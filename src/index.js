const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path"); // Para acceder al directorio actual
const mail = require("./mail.js");
const moment = require("moment");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
//Middlewares
app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
var fs = require("fs");
var util = require("util");
var log_file = fs.createWriteStream(__dirname + "/node.log", {
  flags: "w",
});
var log_stdout = process.stdout;
console.log = function (d) {
  //
  log_file.write(util.format(d) + "/" + "\n");
  log_stdout.write(util.format(d) + "/" + "\n");
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("REST API Positivamente iniciada con exito");
});

app.get("/log", (req, res) => {
  res.render("index", {
    cod: 0,
  });
});
app.post("/loginlog", (req, res) => {
  const { correo, pass } = req.body;
  // console.log(req.body);
  // res.send(req.body)
  try {
    mysqlConnection.query(
      "SELECT * FROM usuarios WHERE correo = ? AND nivel = ?",
      [correo, 1],
      (error, rows, fields) => {
        if (!error) {
          if (rows[0]) {
            var val = bcrypt.compareSync(pass, rows[0].pass);
            if (val) {
              // res.send(htmllog(data, 0));
              fs.readFile(__dirname + "/node.log", "utf-8", (error, data) => {
                res.render("log", {
                  cod: 0,
                  msg: "Login correcto",
                  log: data.split("/"),
                });
              });
              console.log(
                "Login log correcto: " +
                  correo +
                  " " +
                  moment().format("YYYY-MM-DD h:mm:ss A")
              );
            } else {
              res.render("index", {
                cod: -1,
                msg: "Contraseña incorrecta",
              });
              console.log(
                "Login log: Contraseña incorrecta: " +
                  correo +
                  " " +
                  moment().format("YYYY-MM-DD h:mm:ss A")
              );
            }
          } else {
            res.render("index", {
              cod: -2,
              msg: "Correo no existe o no posee los permisos necesarios",
            });
            console.log(
              "Login log: Correo no existe: " +
                correo +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        } else {
          console.log(
            "Ha ocurrido un error" +
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
var isInitJornadas = false;
//Routes
app.use("/api", require("./routes/noticia"));
app.use("/api", require("./routes/proyecto"));
app.use("/api", require("./routes/jornada"));
app.use("/api", require("./routes/gestores"));
app.use("/api", require("./routes/perfil"));
app.use("/api", require("./routes/archivo"));
app.use("/api", require("./routes/registro"));
app.use("/api", require("./routes/voluntarios"));
app.use("/api", require("./routes/mantenimiento"));

const mysqlConnection = require("./database");
var socketCount = 0;

var jornadas = [];

io.on("connection", function (socket) {
  console.log(
    "Usuario con IP: " + socket.handshake.address + "se ha conectado"
  );
  socketCount++;
  console.log(
    "Conectado con sockets. Conectados: " +
      socketCount +
      " " +
      moment().format("YYYY-MM-DD h:mm:ss A")
  );

  //Desconectar del socket
  socket.on("disconnect", () => {
    socketCount--;
    console.log(
      "Desconectado de sockets. Conectados: " +
        socketCount +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  });

  // PING al conectar nuevo socket
  socket.on("pingServer", function (data) {
    console.log(data);
    // io.sockets.emit('ActsIniciales', jornadas)
  });

  socket.on("ActsIniciales", function (data) {
    isInitJornadas = false;
    io.sockets.emit("ActsIniciales", jornadas);
  });

  // Inscripciones del voluntario
  socket.on("InsVoluntario", function (data) {
    var sid = socket.id;
    var jornada = [];
    mysqlConnection
      .query(
        `SELECT jornadas.*, inscripciones.inscripcion, inscripciones.correo  FROM jornadas INNER JOIN inscripciones ON inscripciones.id_jornada = jornadas.id WHERE inscripciones.correo = '${data.correo}'`
      )
      .on("result", function (data) {
        jornada.push(data);
      })
      .on("end", function () {
        io.to(sid).emit("InsVoluntario", jornada);
      });
  });

  // Inscripciones en jornada
  socket.on("Inscripciones", function (data) {
    var inscripciones = [];
    mysqlConnection
      .query(
        `SELECT ins.*,vol.nombres,vol.apellidos, vol.cedula FROM inscripciones AS ins INNER JOIN voluntarios AS vol ON ins.correo = vol.correo WHERE id_jornada = '${data.jornada.id}'`
      )
      .on("result", function (data) {
        inscripciones.push(data);
      })
      .on("end", function () {
        io.sockets.emit("Inscripciones", inscripciones);
      });
  });

  // Iniciar jornadas
  if (!isInitJornadas) {
    jornadas = [];
    mysqlConnection.query(
      "SELECT jor.*, pro.titulo_p FROM jornadas AS jor INNER JOIN proyectos AS pro ON jor.id_p = pro.id_p",
      async (error, rows, fields) => {
        var dataaux = rows;
        var c = 0;
        for (let i = 0; i < dataaux.length; i++) {
          dataaux[i].estado = await Estados(
            dataaux[i].fecha,
            dataaux[i].cuposrest,
            dataaux[i].estado,
            dataaux[i].id
          );
          jornadas.push(dataaux[i]);
          c++;
        }
        io.sockets.emit("ActsIniciales", jornadas);
        // var timer = setInterval(async () => {
        //   if (c == dataaux.length) {
        //     clearInterval(timer);
        //     io.sockets.emit("ActsIniciales", jornadas);
        //   }
        // });
      }
    );
    isInitJornadas = true;
  } else {
    for (let i = 0; i < jornadas.length; i++) {
      jornadas[i].estado = Estados(
        jornadas[i].fecha,
        jornadas[i].cuposrest,
        jornadas[i].estado,
        jornadas[i].id
      );
    }
    io.sockets.emit("ActsIniciales", jornadas);
  }

  // Nueva jornada
  socket.on("NuevaAct", async function (data) {
    var jornadaent = data.jornada;
    jornadaent.estado = await Estados(
      jornadaent.fecha,
      jornadaent.cuposrest,
      jornadaent.estado,
      0
    );
    var {
      titulo,
      descripcion,
      fecha,
      hora,
      ubicacion,
      cupos,
      id_p,
      extracto,
      estado,
      id,
      cuposrest,
      inscripcion,
    } = jornadaent;
    jornadas.push(jornadaent);
    mysqlConnection.query(
      "CALL jornadasAddOrEdit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [
        id,
        titulo,
        descripcion,
        extracto,
        fecha,
        hora,
        ubicacion,
        cupos,
        cuposrest,
        id_p,
        estado,
        inscripcion,
      ],
      (error, rows, fields) => {
        if (!error) {
          data.jornada.id = rows[0][0].id;
          io.sockets.emit("NuevaAct", data.jornada);
        } else {
          console.log(
            "Ha ocurrido un error, agregando jornada: " +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  });

  // ENviar correos de nueva jornada
  socket.on("EnviarCorreos", function (data) {
    var correos = [];
    var sid = socket.id;
    try {
      mysqlConnection
        .query("SELECT vol.correo FROM voluntarios AS vol")
        .on("result", function (data) {
          correos.push(data.correo);
        })
        .on("end", function () {
          let contenidoHTML = CorreoHtml();

          if (correos.length > 0) {
            mail.sendEmail(
              {
                to: correos,
                subject: "Nueva jornada agregada a positivamente",
                html: contenidoHTML,
              },
              (res) => {
                io.to(sid).emit("EnviarCorreos", res);
              }
            );
          } else {
            io.to(sid).emit("EnviarCorreos", {
              cod: -6,
              msg: "No se ha enviado el correo",
            });
          }
        });
    } catch (error) {
      console.log(
        "Ha ocurrido un error, enviando correo: " +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
  });

  // Actualizar jornada
  socket.on("EditarAct", async function (data) {
    var foundIndex = jornadas.findIndex((acts) => acts.id == data.jornada.id);
    Object.assign(jornadas[foundIndex], data.jornada);
    jornadas[foundIndex].estado = await Estados(
      jornadas[foundIndex].fecha,
      jornadas[foundIndex].cuposrest,
      jornadas[foundIndex].estado,
      0
    );
    var {
      titulo,
      descripcion,
      fecha,
      hora,
      ubicacion,
      cupos,
      id_p,
      extracto,
      estado,
      id,
      cuposrest,
      inscripcion,
    } = jornadas[foundIndex];

    mysqlConnection.query(
      "CALL jornadasAddOrEdit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [
        id,
        titulo,
        descripcion,
        extracto,
        fecha,
        hora,
        ubicacion,
        cupos,
        cuposrest,
        id_p,
        estado,
        inscripcion,
      ],
      (error, rows, fields) => {
        if (!error) {
          io.sockets.emit("EditarAct", jornadas);
        } else {
          console.log(
            "Ha ocurrido un error, editando jornada: " +
              error +
              " " +
              moment().format("YYYY-MM-DD h:mm:ss A")
          );
        }
      }
    );
  });

  // Eliminar jornada
  socket.on("EliminarAct", function (data) {
    var foundIndex = jornadas.findIndex((acts) => acts.id == data.jornada.id);
    jornadas.splice(foundIndex, 1);
    var id = data.jornada.id;
    try {
      mysqlConnection.query(
        "DELETE FROM jornadas WHERE id = ?",
        [id],
        (error, rows, fields) => {
          if (!error) {
            io.sockets.emit("EditarAct", jornadas);
          } else {
            console.log(
              "Ha ocurrido un error en la consulta, eliminando jornada: " +
                error +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        }
      );
    } catch (error) {
      console.log(
        "Ha ocurrido un error en la bd, eliminando jornada: " +
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

  // Ver jornada
  socket.on("VerAct", function (data) {
    var foundIndex = jornadas.findIndex((acts) => acts.id == data.jornada.id);
    io.sockets.emit("VerAct", jornadas[foundIndex]);
  });

  // Registrar participacion en jornada
  socket.on("ParticiparAct", function (data) {
    var sid = socket.id;
    try {
      mysqlConnection.query(
        `INSERT INTO inscripciones (correo, id_jornada, inscripcion) VALUES('${data.correo}', '${data.id}', 'Inscrito');`,
        (error, rows, fields) => {
          if (!error) {
            io.to(sid).emit("ParticiparAct", "Registro exitoso");
            io.sockets.emit("VolParticipando", "Gestionando jornada");
          } else {
            console.log(
              "Ha ocurrido un error en la consulta, participando en jornada: " +
                error +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        }
      );
    } catch (error) {
      console.log(
        "Ha ocurrido un error en la bd, participando en jornada: " +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
  });

  // Cancelar participacion en jornada
  socket.on("CancelParticiparAct", function (data) {
    var sid = socket.id;
    try {
      mysqlConnection.query(
        `DELETE FROM inscripciones WHERE correo = ? AND id_jornada= ?;`,
        [data.correo, data.id],
        (error, rows, fields) => {
          if (!error) {
            io.sockets.emit("VolParticipando", "Gestionando jornada");
            io.to(sid).emit("CancelParticiparAct", "Cancelación exitosa");
          } else {
            console.log(
              "Ha ocurrido un error en la consulta, cancelando participacion en jornada: " +
                error +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        }
      );
    } catch (error) {
      console.log(
        "Ha ocurrido un error en la bd, cancelando participacion en jornada: " +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
  });

  // Marcar asistencia del voluntario
  socket.on("MarcarAsistenciaVol", function (data) {
    try {
      mysqlConnection.query(
        `UPDATE inscripciones SET asistencia = '${data.voluntario.asistencia}' WHERE correo = ? AND id_jornada= ?;`,
        [data.voluntario.correo, data.voluntario.id_jornada],
        (error, rows, fields) => {
          if (!error) {
            io.sockets.emit("MarcarAsistenciaVol", data.voluntario);
          } else {
            console.log(
              "Ha ocurrido un error en la consulta, marcando asistencia en jornada: " +
                error +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        }
      );
    } catch (error) {
      console.log(
        "Ha ocurrido un error en la bd, marcando asistencia en jornada: " +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
  });

  socket.on("Mensajes", function (data) {
    try {
      var sid = socket.id;
      if (!data) {
        mensajes = [];
        mysqlConnection.query(
          "SELECT * FROM mensajes_contact",
          async (error, rows, fields) => {
            rows.length > 0 ? io.sockets.emit("Mensajes", rows) : false;
          }
        );
        isInitJornadas = true;
      } else {
        const { correo, nombre, apellido, mensaje, estado, fecha } = data.sms;
        mysqlConnection.query(
          "INSERT INTO mensajes_contact(correo, nombre, apellido, mensaje, estado, fecha) VALUES( ? , ? , ?, ?, ?,? );",
          [correo, nombre, apellido, mensaje, estado, fecha],
          (error, rows, fields) => {
            /*const respuesta = {
                datos: null,
                estado: "exito",
                cod: 0,
                msg: "Mensaje enviado"
              };
              res.json(respuesta);*/
            let contenidoHTML = CorreoContact(data.sms);
            mail.sendEmail(
              {
                to: process.env.EMAIL,
                subject: "Nuevo mensaje de consulta",
                html: contenidoHTML,
              },
              (res) => {
                io.to(sid).emit("EnviarCorreos", res);
              }
            );
            io.sockets.emit("Mensajes", data.sms);
            io.to(sid).emit("Aviso", {
              tipo: "success",
              msg: "Mensaje enviado",
            });
            console.log(
              "Mensaje de contacto enviado: " +
                correo +
                " " +
                moment().format("YYYY-MM-DD h:mm:ss A")
            );
          }
        );
      }
    } catch (error) {
      io.to(sid).emit("Aviso", { tipo: "error", msg: "mensaje no enviado" });
      console.log(
        "Ha ocurrido un error en la bd, enviado mensajes " +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
  });
  socket.on("CambiarEstado", function (data) {
    const { correo, nombre, apellido, mensaje, estado, fecha, id } = data;
    try {
      mysqlConnection.query(
        `UPDATE mensajes_contact SET estado = '${estado}' WHERE id = ?;`,
        [id],
        (error, rows, fields) => {
          io.sockets.emit("EstadoCambiado", data);
          // io.to(sid).emit("Aviso", {
          //   tipo: "success",
          //   msg: "Mensaje enviado",
          // });
        }
      );
    } catch (error) {
      console.log(
        "Ha ocurrido un error en la bd, leyendo mensaje" +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
  });
});

// HTML para enviar correo
function CorreoHtml() {
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
            style = "background: #c8dbff url('${process.env.RUTA_IMG_CORREOS}voluntariado-ban.png'); background-size: cover; padding: 50px 15px;"
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
                                Nueva jornada agregada
                              </h2>
                              <p
                                style="color: #999999; font-size: 16px; line-height: 24px; margin: 0;"
                              >
                                Ha sido agregada una nueva jornada, a nuestra fundación Proyecto Positivamente, contamos con tu apoyo.¡Te esperamos!
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
                                      href="${process.env.BASE_URL}"
                                      target="_blank"
                                      style="font-size: 16px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 26px; background-color: #75b6c9; padding: 14px 26px; border: 1px solid #75b6c9; display: block;"
                                      >Ir a positivamente &rarr;</a
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
                    Pampatar, Venezuela <br />
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

function CorreoContact(data) {
  var html = `
    <!DOCTYPE html>
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
      style="
        display: none;
        font-size: 1px;
        color: #fefefe;
        line-height: 1px;
        font-family: Open Sans, Helvetica, Arial, sans-serif;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      Lorem ipsum dolor que ist
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td
          align="center"
          valign="top"
          width="100%"
          background="${process.env.RUTA_IMG_CORREOS}voluntariado-ban.png"
          bgcolor="#3b4a69"
          style="
            background: #c8dbff
              url('${process.env.RUTA_IMG_CORREOS}voluntariado-ban.png');
            background-size: cover;
            padding: 50px 15px;
          "
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
            style="max-width: 600px;"
          >
            <tr>
              <td align="center" valign="top" style="padding: 0 0 20px 0;">
                <img
                  src="${process.env.RUTA_IMG_CORREOS}logo.png"
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
            style="max-width: 600px;"
          >
            <tr>
              <td
                align="center"
                valign="top"
                style="
                  padding: 0 0 25px 0;
                  font-family: Open Sans, Helvetica, Arial, sans-serif;
                "
              >
                <table cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td
                      align="center"
                      bgcolor="#ffffff"
                      style="border-radius: 3px 3px 0 0;"
                    >
                      <img
                        src="${process.env.RUTA_IMG_CORREOS}voltarios.png"
                        width="600"
                        height="200"
                        alt="insert alt text here"
                        style="
                          display: block;
                          border-radius: 3px 3px 0 0;
                          font-family: sans-serif;
                          font-size: 16px;
                          color: #999999;
                        "
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
                            style="
                              font-family: Open Sans, Helvetica, Arial,
                                sans-serif;
                            "
                          >
                            <h2
                              style="
                                font-size: 20px;
                                color: #444444;
                                margin: 0;
                                padding-bottom: 10px;
                              "
                            >
                              Nuevo correo de consulta
                            </h2>
                            <p
                              style="
                                color: #999999;
                                font-size: 16px;
                                line-height: 24px;
                                margin: 0;
                              "
                            >
                              Correo: ${data.correo} <br />De: ${data.nombre}
                              ${data.apellido}
                            </p>
                            <br />
                            <br />

                            <p
                              style="
                                color: #999999;
                                font-size: 16px;
                                line-height: 24px;
                                margin: 0;
                              "
                            >
                              ${data.mensaje}
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
                                ></td>
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
            style="max-width: 600px;"
          >
            <tr>
              <td align="center" valign="top" style="padding: 0 0 5px 0;">
                <img
                  src="${process.env.RUTA_IMG_CORREOS}logosolo.png"
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
                style="
                  padding: 0;
                  font-family: Open Sans, Helvetica, Arial, sans-serif;
                  color: #999999;
                "
              >
                <p style="font-size: 14px; line-height: 20px;">
                  Pampatar, Venezuela <br />
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

function Estados(fecha, cuposrest, estado, id) {
  try {
    var fech = moment(fecha).format("YYYY-MM-DD");
    var estadomod = "";
    var Fech = moment().format("YYYY-MM-DD");
    var FechaActual = moment(Fech.split("-").map(Number));
    var Fechjornada = moment(fech.split("-").map(Number));
    var Dif = Fechjornada.diff(FechaActual, "days");

    if (Dif > 7) {
      if (estado != "Cancelada" && estado != "Desactivada") {
        estadomod = "Proximamente";
      } else {
        estadomod = estado;
      }
    } else if (Dif == 0) {
      estadomod = "En Proceso";
    } else if (Math.sign(Dif) == -1) {
      estadomod = "Finalizada";
    } else {
      if (
        estado != "Cancelada" &&
        estado != "En proceso" &&
        estado != "Finalizada" &&
        estado != "Desactivada"
      ) {
        if (cuposrest == 0) {
          estadomod = "Agotado";
        } else {
          estadomod = "Activa";
        }
      } else {
        if (estado == "Finalizada" && Dif > 0) {
          estadomod = "Activa";
        } else {
          estadomod = estado;
        }
      }
    }
    mysqlConnection.query(
      `UPDATE jornadas SET estado = '${estadomod}' WHERE id = '${id}'`
    );
    return estadomod;
  } catch (error) {
    console.log(
      "Ha ocurrido un error, modificando estado de jornada: " +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
}

// Middleware para Vue.js router modo history
const history = require("connect-history-api-fallback");
app.use(history());
app.use(express.static(path.join(__dirname, "public")));

// Asignar puerto automáticamente
app.set("puerto", process.env.PORT || 3000);
server.listen(app.get("puerto"), function () {
  console.log("Puerto establecido en: " + app.get("puerto"));
});
