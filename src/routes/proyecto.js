const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
const mysqlConnection = require("../database");

//Consultar proyectos
router.get("/proyectos", (req, res) => {
  try {
    mysqlConnection.query(" SELECT * FROM proyectos", (error, rows, fields) => {
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

//Consultar proyecto
router.get("/proyecto/:id_p", async (req, res) => {
  const id_p = req.params.id_p;
  try {
    mysqlConnection.query(
      "SELECT * FROM proyectos WHERE id_p = ?",
      [id_p],
      (error, rows, fields) => {
        res.json(rows[0]);
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

//Agregar proyecto
router.post("/nuevo-proyecto", (req, res) => {
  var extracto = "";
  var id_p = 0;
  var fecha = moment().format("YYYY-MM-DD");
  var hora = moment().format("LT");
  const { titulo_p, descripcion_p, img_principal } = req.body;
  extracto = descripcion_p.replace(/<[^>]*>?/g, "").substring(0, 100);
  const query = `
        CALL proyectosAddOrEdit(?, ?, ?, ?, ?, ?, ?);
    `;
  try {
    mysqlConnection.query(
      query,
      [id_p, titulo_p, descripcion_p, extracto, fecha, hora, img_principal],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            id_p: rows[0][0].id_p,
            titulo_p,
            descripcion_p,
            extracto,
            fecha,
            hora,
            img_principal,
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

//Actualizar una proyecto
router.put("/proyecto/:id_p", (req, res) => {
  const { id_p } = req.params;
  var status = "";
  var extracto = "";
  var fecha = moment().format("YYYY-MM-DD");
  var hora = moment().format("LT");
  const { titulo_p, descripcion_p, img_principal } = req.body;
  extracto = descripcion_p.replace(/<[^>]*>?/g, "").substring(0, 100);
  const query = `
        CALL proyectosAddOrEdit(?, ?, ?, ?, ?, ?, ?);
    `;
  try {
    mysqlConnection.query(
      query,
      [id_p, titulo_p, descripcion_p, extracto, fecha, hora, img_principal],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            id_p,
            titulo_p,
            descripcion_p,
            extracto,
            img_principal,
          });
          console.log(rows);
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

// Eliminar un proyecto
router.delete("/proyecto/:id_p", (req, res) => {
  const { id_p } = req.params;
  try {
    mysqlConnection.query(
      "DELETE FROM proyectos WHERE id_p = ?",
      [id_p],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            Status: "Proyecto eliminado",
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
    return res.status(400).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

//Consultar jornadas por rango de fecha
router.post("/fechproyectos", (req, res) => {
  const { fechaInicial, fechaFinal } = req.body;
  var ini = fechaInicial.replace(/-/g, "");
  var fin = fechaFinal.replace(/-/g, "");
  query = `SELECT * FROM proyectos AS pro WHERE pro.fecha BETWEEN ${ini} AND ${fin}`;
  try {
    mysqlConnection.query(query, (error, rows, fields) => {
      if (!error) {
        var proyectos = rows;
        var c = 0;
        query = "SELECT * FROM jornadas AS jor WHERE jor.id_p = ?";
        for (let i = 0; i < proyectos.length; i++) {
          mysqlConnection
            .query(query, [proyectos[i].id_p], (error, rowsv, fields) => {
              if (!error) {
                proyectos[i].jornadas = rowsv;
                proyectos[i].fecha = moment(proyectos[i].fecha).format(
                  "DD-MM-YYYY"
                );
              } else {
                console.log(error);
              }
            })
            .on("end", function () {
              c++;
            });
        }
        var timer = setInterval(async () => {
          if (c == proyectos.length) {
            clearInterval(timer);
            res.json(proyectos);
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
module.exports = router;
