const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
const mysqlConnection = require("../database");

//Consultar noticias
router.get("/noticias", (req, res) => {
  try {
    mysqlConnection.query(" SELECT * FROM noticias", (error, rows, fields) => {
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

//Consultar noticia
router.get("/noticia/:id", async (req, res) => {
  const id = req.params.id;
  try {
    mysqlConnection.query(
      "SELECT * FROM noticias WHERE id = ?",
      [id],
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

//Agregar noticia
router.post("/nueva-noticia", (req, res) => {
  var status = "";
  var extracto = "";
  var id = 0;
  var fecha = moment().format("YYYY-MM-DD");
  var hora = moment().format("LT");
  const {
    autor,
    titulo,
    contenido,
    estado,
    img_principal,
    img_autor,
  } = req.body;
  estado ? (status = "Publicado") : (status = "No publicado");
  extracto = contenido.replace(/<[^>]*>?/g, "").substring(0, 100);
  const query = `
        CALL noticiasAddOrEdit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  try {
    mysqlConnection.query(
      query,
      [
        id,
        autor,
        titulo,
        contenido,
        extracto,
        fecha,
        hora,
        estado,
        status,
        img_principal,
        img_autor,
      ],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            id: rows[0][0].id,
            autor,
            titulo,
            contenido,
            extracto,
            fecha,
            hora,
            estado,
            status,
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

//Actualizar una noticia
router.put("/noticia/:id", (req, res) => {
  const { id } = req.params;
  var status = "";
  var extracto = "";
  var fecha = moment().format("YYYY-MM-DD");
  var hora = moment().format("LT");
  const {
    autor,
    titulo,
    contenido,
    estado,
    img_principal,
    img_autor,
  } = req.body;
  estado ? (status = "Publicado") : (status = "No publicado");
  extracto = contenido.replace(/<[^>]*>?/g, "").substring(0, 100);
  const query = `
        CALL noticiasAddOrEdit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  try {
    mysqlConnection.query(
      query,
      [
        id,
        autor,
        titulo,
        contenido,
        extracto,
        fecha,
        hora,
        estado,
        status,
        img_principal,
        img_autor,
      ],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            id,
            autor,
            titulo,
            contenido,
            extracto,
            estado,
            status,
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

//Eliminar una noticia
router.delete("/noticia/:id", (req, res) => {
  const { id } = req.params;
  try {
    mysqlConnection.query(
      "DELETE FROM noticias WHERE id = ?",
      [id],
      (error, rows, fields) => {
        if (!error) {
          res.json({
            Status: "Noticia eliminada",
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
module.exports = router;
