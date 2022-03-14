const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
const mysqlConnection = require("../database");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const servicio = require("../servicios");
const nodemailer = require("nodemailer");
const mail = require("./../mail.js");
// Verificar correo
async function verificar(correo) {
  var estado = null;
  let promise = new Promise((res, rej) => {
    try {
      mysqlConnection.query(
        "SELECT * FROM solicitudes WHERE correo = ?",
        [correo],
        (error, rows, fields) => {
          estado = 0; // Usuario solicito con token vencido o no posee solicitudes
          rows.forEach((element) => {
            // Usuario solicito y completo registro
            if (element.estado == "Completada") {
              console.log("object");
              estado = -1;
            } else if (
              servicio.DecodificarToken(element.token) != "Token expired"
            ) {
              // Usuario solicito con token vigente
              if (element.estado != "Cancelada") {
                estado = -2;
              }
            }
          });
          res(estado);
        }
      );
    } catch (error) {
      console.log("ha ocurrido un error: " + error);
    }
  });
  let result = await promise;
  return result;
}

//Consultar gestores
router.get("/gestores/:correo", (req, res) => {
  const correo = req.params.correo;
  const query = `SELECT * FROM usuarios INNER JOIN gestores ON usuarios.correo = gestores.correo INNER JOIN solicitudes ON usuarios.correo = solicitudes.correo WHERE solicitudes.estado <> 'Cancelada' AND gestores.correo <> '${correo}';`;
  try {
    mysqlConnection.query(query, (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(
          "Ha ocurrido un error en la consulta" +
            error +
            " " +
            moment().format("YYYY-MM-DD h:mm:ss A")
        );
      }
    });
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la bd" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

//Consultar solicitudes de gestores
router.get("/solicitudes", (req, res) => {
  const query = `SELECT * FROM solicitudes WHERE estado='Por Completar' AND nivel <> 3;`;
  try {
    mysqlConnection.query(query, (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(
          "Ha ocurrido un error en la consulta" +
            error +
            " " +
            moment().format("YYYY-MM-DD h:mm:ss A")
        );
      }
    });
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la bd" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

//Consultar gestor
router.get("/gestor/:id", async (req, res) => {
  const id = req.params.id;
  try {
    mysqlConnection.query(
      "SELECT * FROM gestor WHERE id = ?",
      [id],
      (error, rows, fields) => {
        if (!error) {
          res.json(rows[0]);
        } else {
          console.log(
            "Ha ocurrido un error en la consulta" +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la bd" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
    return res.status(400).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

//Agregar gestor
router.post("/nuevo-gestor", async (req, res) => {
  var id = 0;
  const { nombres, apellidos, cedula, correo, status, nivel } = req.body;
  var nivel_id = nivel.id;
  var passaux = generatePasswordRand(8);
  var pass = bcrypt.hashSync(passaux, salt);
  var estado = "Completada";
  var correoold = correo;
  var token = servicio.CrearToken(correo, 15, "minutes");
  const query = `
        CALL gestoresAddOrEdit( ? , ? , ? , ? , ? , ? , ? , ?, ?, ?, ?);
    `;
  const existe = await verificar(correo);
  if (existe == 0) {
    let contenidoHTML = CorreoHtml(passaux);
    mail.sendEmail(
      {
        to: correo,
        subject: "Nueva contraseña de positivamente",
        html: contenidoHTML,
      },
      (respmail) => {
        if (respmail.cod >= 0) {
          try {
            mysqlConnection.query(
              query,
              [
                id,
                nombres,
                apellidos,
                cedula,
                correo,
                correoold,
                status,
                nivel_id,
                pass,
                token,
                estado,
              ],
              (error, rows, fields) => {
                if (!error) {
                  const respuesta = {
                    datos: {
                      id: rows[0][0].id,
                      nombres,
                      apellidos,
                      cedula,
                      correo,
                      status,
                      nivel,
                      estado,
                      token,
                    },
                    estado: "error",
                    cod: 0,
                    msg: "Registro exitoso",
                  };
                  res.json(respuesta);
                } else {
                  console.log(
                    "Ha ocurrido un error en la consulta" +
                      error +
                      " " +
                      moment().format("YYYY-MM-DD h:mm:ss A")
                  );
                }
              }
            );
          } catch (error) {
            console.log(
              "Ha ocurrido un error en la bd" +
                error +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
            return res.status(500).json({
              mensaje: "Ocurrio un error",
              error,
            });
          }
          console.log("El correo ha sido enviado");
        } else {
          res.json(respmail);
        }
      }
    );
  } else if (existe == -1) {
    const respuesta = {
      datos: null,
      estado: "error",
      cod: -1,
      msg: "Usuario registrado",
    };
    res.json(respuesta);
    console.log(
      "Nuevo gestor registrado: " +
        correo +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  } else if (existe == -2) {
    const respuesta = {
      datos: null,
      estado: "error",
      cod: -2,
      msg: "Usuario posee una solicitud",
    };
    res.json(respuesta);
    console.log(
      "Gestor posee una solicitud: " +
        correo +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

//Actualizar un gestor
router.put("/gestor/:id", (req, res) => {
  var id = 1;
  const {
    nombres,
    apellidos,
    cedula,
    correo,
    correoold,
    status,
    nivel,
    pass,
    estado,
    token,
  } = req.body;
  var nivel_id = nivel.id;
  const query = `
        CALL gestoresAddOrEdit( ? , ? , ? , ? , ? , ? , ?, ?, ?, ?, ?);
    `;
  try {
    mysqlConnection.query(
      query,
      [
        id,
        nombres,
        apellidos,
        cedula,
        correo,
        correoold,
        status,
        nivel_id,
        pass,
        token,
        estado,
      ],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            nombres,
            apellidos,
            cedula,
            correo,
            correoold,
            status,
            nivel,
            pass,
            estado,
            token,
          });
        } else {
          console.log(
            "Ha ocurrido un error en la bd" +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la bd" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

//Eliminar un gestor
router.delete("/gestor/:correo", (req, res) => {
  const { correo } = req.params;
  try {
    mysqlConnection.query(
      "DELETE FROM gestores WHERE correo = ?",
      [correo],
      (error, rows, fields) => {
        if (!error) {
          mysqlConnection.query(
            "DELETE FROM usuarios WHERE correo = ?",
            [correo],
            (error, rows, fields) => {
              if (!error) {
                mysqlConnection.query(
                  "DELETE FROM solicitudes WHERE correo = ?",
                  [correo],
                  (error, rows, fields) => {
                    if (!error) {
                      res.json({
                        Status: "Gestor eliminado",
                      });
                      console.log(
                        "Gestor eliminado: " +
                          correo +
                          " " +
                          moment().format("YYYY-MM-DD h:mm:ss A")
                      );
                    } else {
                      console.log(
                        "Ha ocurrido un error en la consulta" +
                          error +
                          " " +
                          moment().format("YYYY-MM-DD h:mm:ss A")
                      );
                    }
                  }
                );
              } else {
                console.log(
                  "Ha ocurrido un error en la consulta" +
                    error +
                    " " +
                    moment().format("YYYY-MM-DD h:mm:ss A")
                );
              }
            }
          );
        } else {
          console.log(
            "Ha ocurrido un error en la consulta" +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la bd" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
    return res.status(400).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

// Generar contraseña aleatoria
function generatePasswordRand(length, type) {
  switch (type) {
    case "num":
      characters = "0123456789";
      break;
    case "alf":
      characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      break;
    case "rand":
      //FOR ↓
      break;
    default:
      characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      break;
  }
  var pass = "";
  for (i = 0; i < length; i++) {
    if (type == "rand") {
      pass += String.fromCharCode((Math.floor(Math.random() * 100) % 94) + 33);
    } else {
      pass += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  return pass;
}

// HTML para enviar correo
function CorreoHtml(passaux) {
  var html = `<!DOCTYPE html>
<html>

<head>
    <title></title>
    <style type="text/css">
        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* MOBILE STYLES */
        @media screen and (max-width: 600px) {
            .img-max {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
            }

            .max-width {
                max-width: 100% !important;
            }

            .mobile-wrapper {
                width: 85% !important;
                max-width: 85% !important;
            }

            .mobile-padding {
                padding-left: 5% !important;
                padding-right: 5% !important;
            }
        }

        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }
    </style>
</head>

<body style="margin: 0 !important; padding: 0; !important background-color: #ffffff;" bgcolor="#ffffff">
    <!-- HIDDEN PREHEADER TEXT -->
    <div
        style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Lorem ipsum dolor que ist
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" valign="top" width="100%" background="${process.env.RUTA_IMG_CORREOS}security-baner.png"
                bgcolor="#3b4a69" style="background: #c8dbff
                url('${process.env.RUTA_IMG_CORREOS}security-baner.png');
                background-size: cover; padding: 50px 15px;" class="mobile-padding">
                <!--[if (gte mso 9)|(IE)]>
              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
              <tr>
              <td align="center" valign="top" width="600">
              <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" valign="top" style="padding: 0 0 0 0;">
                            <img src="${process.env.RUTA_IMG_CORREOS}logo.png"
                                width="300" height="300" border="0" style="display: block; text-align: center;" />
                        </td>
                        <td align="center" valign="top" style="padding: 0 0 20px 0;">
                            <img src="${process.env.RUTA_IMG_CORREOS}security.png"
                                width="350" height="350" border="0" style="display: block;" />
                        </td>
                    </tr>
                    <tr>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 50px 15px;"
                class="mobile-padding">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top"
                            style="padding: 0 0 25px 0; font-family: Open Sans, Helvetica, Arial, sans-serif;">
                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" bgcolor="#ffffff" style="border-radius: 3px 3px 0 0;">
                                        <img src="${process.env.RUTA_IMG_CORREOS}security-baner2.png"
                                            width="600" height="200" alt="insert alt text here"
                                            style="display: block; border-radius: 3px 3px 0 0; font-family: sans-serif; font-size: 16px; color: #999999;"
                                            class="img-max" />
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" bgcolor="#ffffff"
                                        style="border-radius: 0 0 3px 3px; padding: 25px;">
                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td align="center"
                                                    style="font-family: Open Sans, Helvetica, Arial, sans-serif;">
                                                    <h2
                                                        style="font-size: 20px; color: #444444; margin: 0; padding-bottom: 10px;">
                                                        Solicitud de contraseña
                                                    </h2>
                                                    <p
                                                        style="color: #999999; font-size: 16px; line-height: 24px; margin: 0;">
                                                        Esta es su nueva contraseña para iniciar sesión.
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="padding: 30px 0 0 0;">
                                                    <table border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td align="center" style="border-radius: 26px;"
                                                                bgcolor="#75b6c9">
                                                                <div
                                                                    style="font-size: 16px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 26px; background-color: #75b6c9; padding: 14px 26px; border: 1px solid #75b6c9; display: block;">
                                                                    ${passaux}</div>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6"
                style="padding: 0 15px 40px 15px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0 0 5px 0;">
                            <img src="${process.env.RUTA_IMG_CORREOS}logosolo.png"
                                width="35" height="35" border="0" style="display: block;" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top"
                            style="padding: 0; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #999999;">
                            <p style="font-size: 14px; line-height: 20px;">
                                Pampatar, Venezuela <br />
                                6301, VE

                                <br /><br />

                                <a href="http://www.positivamente.org.ve" style="color: #999999;" target="_blank">A.C.
                                    Proyecto Positivamente
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
    `;
  return html;
}
module.exports = router;
