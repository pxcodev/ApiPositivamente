const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
const mysqlConnection = require("../database");

//Consultar voluntarios
router.get("/voluntarios", (req, res) => {
  try {
    mysqlConnection.query(
      "SELECT * FROM voluntarios AS vol",
      (error, rows, fields) => {
        if (!error) {
          var voluntarios = rows;
          var c = 0;
          for (let i = 0; i < voluntarios.length; i++) {
            //
            mysqlConnection
              .query(
                "SELECT * FROM inscripciones AS ins INNER JOIN jornadas AS jor ON ins.id_jornada = jor.id WHERE ins.correo = ?",
                [voluntarios[i].correo],
                (error, rows, fields) => {
                  if (!error) {
                    voluntarios[i].jornadas = rows;
                  } else {
                  }
                }
              )
              .on("end", function () {
                c++;
              });
          }
          var timer = setInterval(async () => {
            if (c == voluntarios.length) {
              clearInterval(timer);
              res.json(voluntarios);
            }
          });
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
  }
});

router.post("/estadovoluntario", async (req, res) => {
  const { correo, estado } = req.body;
  var estadoactual = estado == "Habilitado" ? "Deshabilitado" : "Habilitado";
  try {
    var query = `UPDATE voluntarios SET estado='${estadoactual}' WHERE correo = ? ;`;
    mysqlConnection.query(query, [correo], (error, rows, fields) => {
      if (!error) {
        const respuesta = {
          datos: { estado: estadoactual, correo: correo },
          estado: "exito",
          cod: 0,
          msg: "Voluntario ha sido" + estadoactual,
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
      error,
    });
  }
});
module.exports = router;
