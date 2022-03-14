const express = require("express");
const router = express.Router();
const moment = require("moment");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
moment.locale("es");
const mysqlConnection = require("../database");
const servicio = require("../servicios");
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
//Solicitar acceso
router.post("/solicitar", async (req, res) => {
  const { correo, nivel } = req.body;
  console.log(correo);
  console.log(nivel);
  var token = servicio.CrearToken(correo, 1, "second");
  const existe = await verificar(correo);
  if (existe == 0) {
    let contenidoHTML = CorreoHtml(token);
    mail.sendEmail(
      {
        to: correo,
        subject: "Contenido de positivamente",
        html: contenidoHTML,
      },
      (respmail) => {
        if (respmail.cod >= 0) {
          momento = moment().unix();
          estado = "Por Completar";
          const query = `INSERT INTO solicitudes(correo, nivel, token, estado, momento)
        VALUES (?, ?, ?, ?, ?);`;
          mysqlConnection.query(
            query,
            [correo, nivel, token, estado, momento],
            (error, rows, fields) => {
              if (!error) {
                const respuesta = {
                  datos: {
                    correo,
                    nivel,
                    token,
                    estado,
                    momento,
                  },
                  estado: "exito",
                  cod: 0,
                  msg: "Solicitud enviada",
                };
                res.json(respuesta);
              } else {
                console.table(error);
              }
            }
          );
          console.log(
            "El correo ha sido enviado: " +
              correo +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        } else {
          console.log(
            "Correo no enviado: " +
              correo +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
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
      "Usuario registrado: " +
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
      "Usuario posee una solicitud: " +
        correo +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

// Cancelar solicitud
router.post("/FormContacto", async (req, res) => {
  console.log(req.body);
  try {
    const { correo, nombre, apellido, mensaje } = req.body;
    mysqlConnection.query(
      "INSERT INTO mensajes_contact(correo, nombre, apellido, mensaje) VALUES( ? , ? , ?, ? );",
      [correo, nombre, apellido, mensaje],
      (error, rows, fields) => {
        const respuesta = {
          datos: null,
          estado: "exito",
          cod: 0,
          msg: "Mensaje enviado",
        };
        res.json(respuesta);
        console.log(
          "Mensaje de contacto enviado: " +
            correo +
            " " +
            moment().format("YYYY-MM-DD h:mm:ss A")
        );
      }
    );
  } catch (error) {
    console.log(
      "ha ocurrido un error: " +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

// Cancelar solicitud
router.get("/CancelarSolicitud/:correo", async (req, res) => {
  try {
    var correo = req.params.correo;
    mysqlConnection.query(
      'UPDATE solicitudes SET estado = "Cancelada" WHERE correo = ?',
      [correo],
      (error, rows, fields) => {
        const respuesta = {
          datos: null,
          estado: "exito",
          cod: 0,
          msg: "Solicitudes canceladas",
        };
        res.json(respuesta);
        console.log(
          "Solicitudes canceladas: " +
            correo +
            " " +
            moment().format("YYYY-MM-DD h:mm:ss A")
        );
      }
    );
  } catch (error) {
    console.log(
      "ha ocurrido un error: " +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

// Validacion de tooken de registro
router.get("/val-token/:token", async (req, res) => {
  const token = req.params.token.replace(/ /g, ".");
  mysqlConnection.query(
    "SELECT * FROM solicitudes WHERE token = ?",
    [token],
    (error, rows, fields) => {
      if (rows.length == 0) {
        const respuesta = {
          datos: null,
          estado: "error",
          cod: -1,
          msg: "Solicitud no encontrada",
        };
        res.json(respuesta);
        console.log(
          "Solicitud no encontrada: " +
            " " +
            moment().format("YYYY-MM-DD h:mm:ss A")
        );
      } else {
        if (rows[0].estado == "Completada") {
          const respuesta = {
            datos: {
              correo: rows[0].correo,
              nivel: rows[0].nivel,
            },
            estado: "error",
            cod: -3,
            msg: "Usuario registrado",
          };
          res.json(respuesta);
          console.log(
            "Usuario registrado: " +
              rows[0].correo +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        } else if (rows[0].estado == "Por Completar") {
          var DataToken = servicio.DecodificarToken(token);
          console.log(DataToken);
          if (DataToken.cod == -1) {
            const respuesta = {
              datos: null,
              estado: "error",
              cod: -2,
              msg: "Solicitud expirada",
            };
            res.json(respuesta);
            console.log(
              "Solicitud expirada: " +
                rows[0].correo +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          } else if (DataToken.cod >= 0) {
            const respuesta = {
              datos: {
                correo: rows[0].correo,
                nivel: rows[0].nivel,
              },
              estado: "exito",
              cod: 0,
              msg: "Token encontrado",
            };
            res.json(respuesta);
            console.log(
              "Token encontrado: " +
                rows[0].correo +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          } else {
            const respuesta = {
              datos: null,
              estado: "error",
              cod: -2,
              msg: "Solicitud no encontrada",
            };
            res.json(respuesta);
            console.log(
              "Ha ocurrido un error: " + moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        } else if (rows[0].estado == "Cancelada") {
          const respuesta = {
            datos: null,
            estado: "error",
            cod: -3,
            msg: "Solicitud cancelada",
          };
          res.json(respuesta);
          console.log(
            "Solicitud cancelada: " +
              rows[0].correo +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    }
  );
});

//Registrar
router.post("/registro", async (req, res) => {
  const { correo, nombres, apellidos, token, pass, nivel } = req.body;
  var estado = "Habilitado";
  var Realtoken = token.replace(/ /g, ".");
  var password = bcrypt.hashSync(pass, salt);
  try {
    const query = `INSERT INTO usuarios(correo, pass, nivel)
        VALUES (?, ?, ?);`;
    mysqlConnection.query(
      query,
      [correo, password, nivel],
      (error, rows, fields) => {
        if (!error) {
          var fechareg = moment().format("YYYY-MM-DD h:mm:ss A");
          const query = ` CALL AddVoluntariosOGestores(?, ?, ?, ?, ?, ?, ?);`;
          mysqlConnection.query(
            query,
            [correo, nombres, apellidos, Realtoken, nivel, fechareg, estado],
            (error, rows, fields) => {
              if (!error) {
                const respuesta = {
                  datos: {
                    correo,
                    nombres,
                    apellidos,
                    Realtoken,
                    nivel,
                    estado,
                  },
                  estado: "exito",
                  cod: 0,
                  msg: "Registro exitoso",
                };
                res.json(respuesta);
                console.log(
                  "Registro exitoso: " +
                    correo +
                    " " +
                    moment().format("YYYY-MM-DD h:mm:ss A")
                );
              } else {
                console.log(
                  "Ha ocurrido un error: " +
                    error +
                    " " +
                    moment().format("YYYY-MM-DD h:mm:ss A")
                );
              }
            }
          );
        } else {
          console.log(
            "Ha ocurrido un error: " +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  } catch (error) {
    console.log(
      "Ha ocurrido un error: " +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
    return res.status(500).json({
      mensaje: "Ocurrio un error: " + error,
      error,
    });
  }
});

//Login
router.post("/login", async (req, res) => {
  const { correo, pass } = req.body;
  try {
    mysqlConnection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
      (error, rows1, fields) => {
        if (!error) {
          if (rows1[0]) {
            var nivel = rows1[0].nivel;
            var tiempo_entrada = moment().format("YYYY-MM-DD H:mm:ss");
            const query = `CALL Login(?, ?, ?);`;
            mysqlConnection.query(
              query,
              [correo, nivel, tiempo_entrada],
              (error, rows, fields) => {
                if (!error) {
                  console.log("object");
                  if (rows[0][0]) {
                    var val = bcrypt.compareSync(pass, rows[0][0].pass);
                    if (val) {
                      // rows[0][0].token = servicio.CrearToken(correo, 15, "minutes");
                      mysqlConnection.query(
                        "SELECT * FROM hist_enfermedades WHERE correo= ?;",
                        [correo],
                        (error, rowsenf, fields) => {
                          if (!error) {
                            mysqlConnection.query(
                              "SELECT * FROM hist_alergias WHERE correo= ?;",
                              [correo],
                              (error, rowsale, fields) => {
                                if (!error) {
                                  const respuesta = {
                                    datos: {
                                      perfil: rows[0][0],
                                      medico: {
                                        enfermedades: rowsenf,
                                        alergias: rowsale,
                                      },
                                    },
                                    estado: "exito",
                                    cod: 0,
                                    msg: "Login exitoso",
                                  };
                                  res.json(respuesta);
                                  console.log(
                                    "Login exitoso: " +
                                      correo +
                                      " " +
                                      moment().format("YYYY-MM-DD h:mm:ss A")
                                  );
                                } else {
                                }
                              }
                            );
                          } else {
                          }
                        }
                      );
                    } else {
                      const respuesta = {
                        datos: null,
                        estado: "error",
                        cod: -1,
                        msg: "Contrasena no valida",
                      };
                      res.json(respuesta);
                      console.log(
                        "Clave incorrecta: " +
                          correo +
                          " " +
                          moment().format("YYYY-MM-DD h:mm:ss A")
                      );
                    }
                  }
                } else {
                  console.log(
                    "Ha ocurrido el siguiente error (endpoint /login): " +
                      error +
                      " " +
                      moment().format("YYYY-MM-DD h:mm:ss A")
                  );
                }
              }
            );
          } else {
            const respuesta = {
              datos: null,
              estado: "error",
              cod: -2,
              msg: "Correo no valido",
            };
            res.json(respuesta);
            console.log(
              "Correo no valido: " +
                correo +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        } else {
          console.log(
            "Ha ocurrido el siguiente error: " +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  } catch (error) {
    console.log(
      "Ha ocurrido un error: " +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
    return res.status(400).json({
      mensaje: "Ocurrio un error: " + error,
      error,
    });
  }
});

router.get("/logout/:correo", async (req, res) => {
  var correo = req.params.correo;
  var tiempo_salida = moment().format("YYYY-MM-DD H:mm:ss");
  try {
    mysqlConnection.query(
      `UPDATE usuarios SET tiempo_salida = '${tiempo_salida}' WHERE correo= ?;`,
      [correo],
      (error, rowsenf, fields) => {
        if (!error) {
          const respuesta = {
            datos: "nada",
            estado: "exito",
            cod: 0,
            msg: "Logout exitoso",
          };
          res.json(respuesta);
          console.log(
            "Logout exitoso: " +
              correo +
              " " +
              moment().format("YYYY-MM-DD H:mm:ss")
          );
        } else {
        }
      }
    );
  } catch (error) {}
});

// Solicitar recuperaciond e contraseña
router.post("/solrecuperar", async (req, res) => {
  const { correo } = req.body;
  const query = `SELECT * FROM usuarios WHERE correo = ?`;
  mysqlConnection.query(query, [correo], (error, rows, fields) => {
    if (!error) {
      if (rows.length > 0) {
        var token = servicio.CrearToken(correo, 15, "minutes");
        let contenidoHTML = CorreoRecHtml(token);
        mail.sendEmail(
          {
            to: correo,
            subject: "Contenido de positivamente",
            html: contenidoHTML,
          },
          (respmail) => {
            if (respmail.cod >= 0) {
              console.log(
                "El correo ha sido enviado: " +
                  correo +
                  " " +
                  moment().format("YYYY-MM-DD h:mm:ss A")
              );
              res.json(respmail);
            } else {
              console.log(
                "Correo no enviado: " +
                  correo +
                  " " +
                  moment().format("YYYY-MM-DD h:mm:ss A")
              );
              res.json(respmail);
            }
          }
        );
      } else {
        var respuesta = {
          datos: null,
          estado: "error",
          cod: -1,
          msg: "Correo no registrado",
        };
        res.json(respuesta);
      }
    } else {
    }
  });
});

// Solicitar recuperaciond e contraseña
router.post("/recuperar", async (req, res) => {
  const { pass, correo } = req.body;
  try {
    var password = bcrypt.hashSync(pass, salt);
    const query = `UPDATE usuarios SET pass = ? WHERE usuarios.correo = ?;`;
    mysqlConnection.query(query, [password, correo], (error, rows, fields) => {
      if (!error) {
        const respuesta = {
          datos: null,
          estado: "exito",
          cod: 0,
          msg: "Recuperación exitosa",
        };
        res.json(respuesta);
      } else {
        console.log(
          "Ha ocurrido un error en la consulta: " +
            error +
            " " +
            moment().format("YYYY-MM-DD h:mm:ss A")
        );
      }
    });
  } catch (error) {
    console.log(
      "Ha ocurrido un error: " +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

// Validar token para recuperar contraseña
router.get("/val-token-rec/:token", async (req, res) => {
  const token = req.params.token.replace(/ /g, ".");
  console.log(token);
  var DataToken = servicio.DecodificarToken(token);
  console.log(DataToken);
  if (DataToken.cod == -1) {
    const respuesta = {
      datos: null,
      estado: "error",
      cod: -1,
      msg: "Solicitud expirada",
    };
    res.json(respuesta);
    console.log(
      "Solicitud expirada: " +
        DataToken.datos.result.cor +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  } else if (DataToken.cod >= 0) {
    const respuesta = {
      datos: {
        correo: DataToken.datos.result.cor,
      },
      estado: "exito",
      cod: 0,
      msg: "Token encontrado",
    };
    res.json(respuesta);
    console.log(
      "Token encontrado: " +
        DataToken.datos.result.cor +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  } else {
    const respuesta = {
      datos: null,
      estado: "error",
      cod: -2,
      msg: "Solicitud no encontrada",
    };
    res.json(respuesta);
    console.log(
      "Ha ocurrido un error: " + moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

// Html para correo de solicitud
function CorreoHtml(token) {
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
    <body
      style="margin: 0 !important; padding: 0; !important background-color: #ffffff;"
      bgcolor="#ffffff"
    >
      <!-- HIDDEN PREHEADER TEXT -->
      <div
        style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"
      >
        Lorem ipsum dolor que ist
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td
            align="center"
            valign="top"
            width="100%"
            background = "${process.env.RUTA_IMG_CORREOS}voluntariado-ban.png"
            bgcolor="#3b4a69"
            style = "background: #c8dbff url('${
              process.env.RUTA_IMG_CORREOS
            }voluntariado-ban.png'); background-size: cover; padding: 50px 15px;"
            class="mobile-padding"
          >
            <!--[if (gte mso 9)|(IE)]>
              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
              <tr>
              <td align="center" valign="top" width="600">
              <![endif]-->
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width:600px;"
            >
              <tr>
                <td align="center" valign="top" style="padding: 0 0 20px 0;">
                  <img
                    src = "${process.env.RUTA_IMG_CORREOS}logo.png"
                    width="300"
                    height="300"
                    border="0"
                    style="display: block;"
                  />
                </td>
              </tr>
              <tr>
                <!-- <td align="center" valign="top" style="padding: 0; font-family: Open Sans, Helvetica, Arial, sans-serif;">
                          <h1 style="font-size: 40px; color: #ffffff;">Proyecto Positivamente</h1>
                          <p style="color: #b7bdc9; font-size: 20px; line-height: 28px; margin: 0;">

                          </p>
                      </td> -->
              </tr>
            </table>

            <!--[if (gte mso 9)|(IE)]>
              </td>
              </tr>
              </table>
              <![endif]-->
          </td>
        </tr>
        <tr>
          <td
            align="center"
            height="100%"
            valign="top"
            width="100%"
            bgcolor="#f6f6f6"
            style="padding: 50px 15px;"
            class="mobile-padding"
          >
            <!--[if (gte mso 9)|(IE)]>
              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
              <tr>
              <td align="center" valign="top" width="600">
              <![endif]-->
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width:600px;"
            >
              <tr>
                <td
                  align="center"
                  valign="top"
                  style="padding: 0 0 25px 0; font-family: Open Sans, Helvetica, Arial, sans-serif;"
                >
                  <table cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td
                        align="center"
                        bgcolor="#ffffff"
                        style="border-radius: 3px 3px 0 0;"
                      >
                        <img
                          src = "${process.env.RUTA_IMG_CORREOS}voltarios.png"
                          width="600"
                          height="200"
                          alt="insert alt text here"
                          style="display: block; border-radius: 3px 3px 0 0; font-family: sans-serif; font-size: 16px; color: #999999;"
                          class="img-max"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        bgcolor="#ffffff"
                        style="border-radius: 0 0 3px 3px; padding: 25px;"
                      >
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          width="100%"
                        >
                          <tr>
                            <td
                              align="center"
                              style="font-family: Open Sans, Helvetica, Arial, sans-serif;"
                            >
                              <h2
                                style="font-size: 20px; color: #444444; margin: 0; padding-bottom: 10px;"
                              >
                                Solicitud de registro
                              </h2>
                              <p
                                style="color: #999999; font-size: 16px; line-height: 24px; margin: 0;"
                              >
                                Para completar el proceso de registro debe
                                completar un formulario con sus datos personales,
                                haciendo click en el boton de abajo.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding: 30px 0 0 0;">
                              <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td
                                    align="center"
                                    style="border-radius: 26px;"
                                    bgcolor="#75b6c9"
                                  >
                                    <a
                                      href="${
                                        process.env.BASE_URL
                                      }/registro/${token.replace(/\./g, " ")}"
                                      target="_blank"
                                      style="font-size: 16px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 26px; background-color: #75b6c9; padding: 14px 26px; border: 1px solid #75b6c9; display: block;"
                                      >Completar registro &rarr;</a
                                    >
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

            <!--[if (gte mso 9)|(IE)]>
              </td>
              </tr>
              </table>
              <![endif]-->
          </td>
        </tr>
        <tr>
          <td
            align="center"
            height="100%"
            valign="top"
            width="100%"
            bgcolor="#f6f6f6"
            style="padding: 0 15px 40px 15px;"
          >
            <!--[if (gte mso 9)|(IE)]>
              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
              <tr>
              <td align="center" valign="top" width="600">
              <![endif]-->
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width:600px;"
            >
              <tr>
                <td align="center" valign="top" style="padding: 0 0 5px 0;">
                  <img
                    src = "${process.env.RUTA_IMG_CORREOS}logosolo.png"
                    width="35"
                    height="35"
                    border="0"
                    style="display: block;"
                  />
                </td>
              </tr>
              <tr>
                <td
                  align="center"
                  valign="top"
                  style="padding: 0; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #999999;"
                >
                  <p style="font-size: 14px; line-height: 20px;">
                    Venezuela, Pampatar <br />
                    6301, VE

                    <br /><br />

                    <a
                      href="http://www.positivamente.org.ve"
                      style="color: #999999;"
                      target="_blank"
                      >A.C. Proyecto Positivamente
                    </a>
                  </p>
                </td>
              </tr>
            </table>

            <!--[if (gte mso 9)|(IE)]>
              </td>
              </tr>
              </table>
              <![endif]-->
          </td>
        </tr>
      </table>
    </body>
  </html>
    `;
  return html;
}
// HTML para enviar correo de recuperacion de contraseña
function CorreoRecHtml(token) {
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
            <td align="center" valign="top" width="100%" background="${
              process.env.RUTA_IMG_CORREOS
            }security-baner.png"
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
                            <img src="${
                              process.env.RUTA_IMG_CORREOS
                            }security.png"
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
                                        <img src="${
                                          process.env.RUTA_IMG_CORREOS
                                        }security-baner2.png"
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
                                                                <a href="${
                                                                  process.env
                                                                    .BASE_URL
                                                                }/recuperacion/${token.replace(
    /\./g,
    " "
  )}"
                                                      target="_blank"
                                                      style="font-size: 16px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 26px; background-color: #75b6c9; padding: 14px 26px; border: 1px solid #75b6c9; display: block;"
                                                      >Recuperar contraseña &rarr;</a>

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
                            <img src="${
                              process.env.RUTA_IMG_CORREOS
                            }logosolo.png"
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
