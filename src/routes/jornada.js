const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
const mysqlConnection = require("../database");

//Consultar inscripciones de jornada
router.get("/inscripciones/:id/:asis", (req, res) => {
  const id = req.params.id;
  const asis = req.params.asis;
  if (asis == -1) {
    query =
      "SELECT * FROM inscripciones AS ins INNER JOIN voluntarios AS vol ON ins.correo=vol.correo WHERE ins.id_jornada = ?";
  } else {
    query =
      "SELECT * FROM inscripciones AS ins INNER JOIN voluntarios AS vol ON ins.correo=vol.correo WHERE ins.id_jornada = ? AND ins.asistencia = ?";
  }
  try {
    mysqlConnection.query(query, [id, asis], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(
          "Ha ocurrido un error en la bd" +
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

//Consultar jornadas por rango de fecha
router.post("/fechjornadas", (req, res) => {
  console.log(req.body);
  const { fechaInicial, fechaFinal, id_p, asistencia } = req.body;
  var ini = fechaInicial.replace(/-/g, "");
  var fin = fechaFinal.replace(/-/g, "");
  var query = "";
  if (id_p == 0) {
    query = `SELECT jor.*,pro.titulo_p FROM jornadas AS jor INNER JOIN proyectos AS pro ON jor.id_p=pro.id_p WHERE jor.fecha BETWEEN ${ini} AND ${fin}`;
  } else {
    query = `SELECT jor.*,pro.titulo_p FROM jornadas AS jor INNER JOIN proyectos AS pro ON jor.id_p=pro.id_p WHERE jor.fecha BETWEEN ${ini} AND ${fin} AND pro.id_p='${id_p}'`;
  }
  try {
    mysqlConnection.query(query, (error, rows, fields) => {
      if (!error) {
        var jornadas = rows;
        var c = 0;
        var DClaves = {
          totalv: 0,
          totala: 0,
          totali: 0,
          jornact: 0,
          jornenp: 0,
          jornfin: 0,
          jornpro: 0,
          jorncan: 0,
          jorndes: 0
        };

        if (asistencia == -1) {
          query =
            "SELECT * FROM inscripciones AS ins INNER JOIN voluntarios AS vol ON ins.correo=vol.correo WHERE ins.id_jornada = ?";
        } else {
          query =
            "SELECT * FROM inscripciones AS ins INNER JOIN voluntarios AS vol ON ins.correo=vol.correo WHERE ins.id_jornada = ? AND ins.asistencia = ?";
        }
        for (let i = 0; i < jornadas.length; i++) {
          switch (jornadas[i].estado) {
            case "Activa":
              DClaves.jornact++;
              break;
            case "En Proceso":
              DClaves.jornenp++;
              break;
            case "Finalizada":
              DClaves.jornfin++;
              break;
            case "Proximamente":
              DClaves.jornpro++;
              break;
            case "Cancelada":
              DClaves.jorncan++;
              break;
            case "Desactivada":
              DClaves.jorndes++;
              break;
          }
          mysqlConnection
            .query(
              query,
              [jornadas[i].id, asistencia],
              (error, rowsv, fields) => {
                if (!error) {
                  jornadas[i].voluntarios = rowsv;
                  jornadas[i].tvoluntarios = rowsv.length;
                  DClaves.totalv += rowsv.length;
                  rowsv.forEach(element => {
                    console.log(element);
                    if (element.asistencia == 0) {
                      DClaves.totali++;
                    } else {
                      DClaves.totala++;
                    }
                  });
                  jornadas[i].fecha = moment(jornadas[i].fecha).format(
                    "DD-MM-YYYY"
                  );
                } else {
                  console.log(error);
                }
              }
            )
            .on("end", function() {
              c++;
            });
        }
        var timer = setInterval(async () => {
          if (c == jornadas.length) {
            clearInterval(timer);
            res.json({
              jornadas,
              DClaves
            });
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

router.get("/jornadas/:id_p", (req, res) => {
  var ip_p = req.params.id_p;
  try {
    mysqlConnection.query(
      "SELECT * FROM jornadas WHERE id_p = ? AND estado='Finalizada'",
      [ip_p],
      async (error, rows, fields) => {
        if (!error) {
          res.json(rows);
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

//Consultar jornadas
router.get("/jornadas", (req, res) => {
  try {
    mysqlConnection.query(" SELECT * FROM jornadas", (error, rows, fields) => {
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
module.exports = router;
