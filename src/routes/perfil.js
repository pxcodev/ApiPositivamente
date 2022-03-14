const express = require("express");
const router = express.Router();
const moment = require("moment");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
moment.locale("es");
const mysqlConnection = require("../database");
const servicio = require("../servicios");

//Editar perfil
router.post("/EditarPerfil", async (req, res) => {
  const {
    nombres,
    apellidos,
    correo,
    edad,
    cedula,
    ocupacion,
    tel_movil,
    tel_casa,
    tel_emergencia,
    direccion,
    nivel,
    idiomas,
    disponibilidad,
    habilidades,
    foto
  } = req.body;
  try {
    if (nivel == 3) {
      var query = `UPDATE voluntarios SET correo='${correo}', nombres='${nombres}', apellidos='${apellidos}', cedula='${cedula}', edad='${edad}', ocupacion='${ocupacion}', direccion='${direccion}', tel_movil='${tel_movil}', tel_casa='${tel_casa}', tel_emergencia='${tel_emergencia}', idiomas='${idiomas}',habilidades='${habilidades}',disponibilidad='${disponibilidad}', foto='${foto}' WHERE correo = ? ;`;
    } else {
      var query = `UPDATE gestores SET correo='${correo}', nombres='${nombres}', apellidos='${apellidos}', cedula='${cedula}', edad='${edad}',ocupacion='${ocupacion}', direccion='${direccion}', tel_movil='${tel_movil}', tel_casa='${tel_casa}', tel_emergencia='${tel_emergencia}',foto='${foto}' WHERE correo = ? ;`;
    }
    var tiempo_entrada = moment().format("YYYY-MM-DD H:mm:ss");
    mysqlConnection.query(query, [correo], (error, rows, fields) => {
      if (!error) {
        const query2 = ` CALL Login(?, ?, ?);`;
        mysqlConnection.query(
          query2,
          [correo, nivel, tiempo_entrada],
          (error, rows, fields) => {
            const respuesta = {
              datos: rows[0][0],
              estado: "exito",
              cod: 0,
              msg: "Perfil Actualizado"
            };
            res.json(respuesta);
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
    });
  } catch (error) {
    console.log(
      "Ha ocurrido un error en la bd" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
    return res.status(500).json({
      mensaje: "Ocurrio un error: " + error,
      error
    });
  }
});

router.post("/AddHistorialMed", async (req, res) => {
  const { enfermedades, alergias, correo } = req.body;

  try {
    mysqlConnection.query(
      "DELETE FROM hist_enfermedades WHERE correo = ?",
      [correo],
      (error, rows, fields) => {
        if (!error) {
          mysqlConnection.query(
            "DELETE FROM hist_alergias WHERE correo = ?",
            [correo],
            (error, rows, fields) => {
              if (!error) {
                if (
                  enfermedades[0].enfermedad != "" &&
                  enfermedades[0].enfermedad != " "
                ) {
                  var filasenf = "";
                  var c = 0;
                  enfermedades.forEach(element => {
                    c++;
                    filasenf += `('${correo}', '${element.enfermedad}','${
                      element.medicamento
                    }')${enfermedades.length == c ? ";" : ","}`;
                  });
                  try {
                    var queryenf = `INSERT INTO hist_enfermedades (correo, enfermedad, medicamento) VALUES ${filasenf} `;
                    mysqlConnection.query(queryenf);
                  } catch (error) {
                    console.log(
                      "Ha ocurrido un error en la bd" +
                        error +
                        " " +
                        moment().format("YYYY-MM-DD h:mm:ss A")
                    );
                  }
                }
                if (alergias[0].alergia !== "" && alergias[0].alergia !== " ") {
                  var filasale = "";
                  var c = 0;
                  alergias.forEach(element => {
                    c++;
                    filasale += `('${correo}', '${element.alergia}','${
                      element.medicamento
                    }')${alergias.length == c ? ";" : ","}`;
                  });
                  try {
                    var queryale = `INSERT INTO hist_alergias (correo, alergia, medicamento) VALUES ${filasale} `;
                    mysqlConnection.query(queryale);
                  } catch (error) {
                    console.log(
                      "Ha ocurrido un error en la bd" +
                        error +
                        " " +
                        moment().format("YYYY-MM-DD h:mm:ss A")
                    );
                  }
                }
                const respuesta = {
                  datos: {
                    enfermedades,
                    alergias
                  },
                  estado: "exito",
                  cod: 0,
                  msg: "Historial Actualizado"
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
      error
    });
  }
});

router.post("/CambiarPass", async (req, res) => {
  const { contras, correo } = req.body;
  console.log(req.body);
  try {
    mysqlConnection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
      (error, usuario, fields) => {
        if (!error) {
          if (usuario[0]) {
            console.log(usuario[0]);
            var val = bcrypt.compareSync(contras.contravieja, usuario[0].pass);
            if (val) {
              var password = bcrypt.hashSync(contras.contranueva, salt);
              const query = `UPDATE usuarios SET pass = ? WHERE usuarios.correo = ?;`;
              mysqlConnection.query(
                query,
                [password, correo],
                (error, rows, fields) => {
                  if (!error) {
                    const respuesta = {
                      datos: null,
                      estado: "exito",
                      cod: 0,
                      msg: "Cambio de contraseña exitoso"
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
                }
              );
            } else {
              const respuesta = {
                datos: null,
                estado: "error",
                cod: -1,
                msg: "Contrasena no coincide con la registrada"
              };
              res.json(respuesta);
              console.log(
                "Clave no coinciden: " +
                  correo +
                  " " +
                  moment().format("YYYY-MM-DD h:mm:ss A")
              );
            }
          }
        } else {
        }
      }
    );
  } catch (error) {}
});
module.exports = router;
