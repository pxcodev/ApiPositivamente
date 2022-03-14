const express = require("express");
const router = express.Router();
const multer = require("multer");
const multeraux = require("multer");
const moment = require("moment");
const mysqlConnection = require("../database");
const path = require("path");
var fs = require("fs");
const rimraf = require("rimraf");
var num = 0;
var del = false;
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder;
    const subfolder = req.params.subfolder;
    var imagenes = null;
    if (req.params.images == undefined || req.params.images == "undefined") {
      imagenes = undefined;
    } else {
      imagenes = req.params.images.split(",");
    }
    const dir = `./src/public/subidas/${folder}/${subfolder}`;
    fs.exists(dir, exist => {
      if (!exist) {
        num = 0;
        return fs.mkdir(
          dir,
          {
            recursive: true
          },
          error => cb(error, dir)
        );
      } else if (imagenes != null && !del) {
        del = true;
        imagenes.forEach(element => {
          var direc = `./src/public/subidas/${folder}/${subfolder}/${element}`;
          fs.exists(direc, exist => {
            if (exist) {
              fs.unlinkSync(direc);
            }
          });
        });
      }
      return cb(null, dir);
    });
    // cb(null, "./public/subidas/" + req.body);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
        num++ +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  }
});
const upload = multer({
  storage
});

router.post(
  "/subir/:folder/:subfolder",
  upload.single("archivo"),
  (req, res) => {
    try {
      console.log(`Guardado en ${req.hostname}/${req.file.path}`);
      return res.send(req.file);
    } catch (error) {
      console.log(
        "Ha ocurrido un error" +
          error +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
      return res.status(500).json({
        mensaje: "Ocurrio un error",
        error
      });
    }
  }
);

router.post("/eliminarfolder/:folder/:subfolder", (req, res) => {
  try {
    const folder = req.params.folder;
    const subfolder = req.params.subfolder;
    const path = `./src/public/subidas/${folder}/${subfolder}`;
    rimraf.sync(path);
    return res.send(req.file);
  } catch (error) {
    console.log(
      "Ha ocurrido un error" +
        error +
        " " +
        moment().format("YYYY-MM-DD h:mm:ss A")
    );
  }
});

router.post(
  "/editarimg/:folder/:subfolder/:images",
  upload.single("archivo"),
  (req, res) => {
    //   var files = fs.readdirSync("./public/subidas"); //ver todos los archivos en el directorio seleccionado
    //   console.log(req);
    console.log(`Guardado en ${req.hostname}/${req.file.path}`);
    return res.send(req.file);
  }
);

router.post(
  "/subirmultiple/:folder/:subfolder/:id_jornada/:images",
  upload.array("archivos"),
  (req, res) => {
    try {
      var id_jornada = req.params.id_jornada;
      var ImgBorradas = req.params.images.split(",");
      var RutImgGuardadas = [];
      // Recorrido de imagenes guardadas
      req.files.forEach(element => {
        let nuevaRuta = element.path
          .replace("src", process.env.BASE_API)
          .replace("public", "")
          .replace(/\\/g, "/");
        RutImgGuardadas.push(nuevaRuta);
      });
      // Si no se agregaron imagenes borrar imagenes solicitadas
      if (req.files.length == 0) {
        ImgBorradas.forEach(element => {
          var direc = `./src/public/subidas/${req.params.folder}/${req.params.subfolder}/${element}`;
          fs.exists(direc, exist => {
            if (exist) {
              fs.unlinkSync(direc);
            }
          });
        });
      }
      // Borrar carpeta si se encuentra vacia
      var ruta = `./src/public/subidas/${req.params.folder}/${req.params.subfolder}`;
      fs.readdir(ruta, function(error, archivos) {
        if (error) {
          onError(error);
          return;
        }
        if (archivos.length == ImgBorradas.length) {
          rimraf.sync(ruta);
        }
      });
      // Consulta de imagenes guardadas en BD
      mysqlConnection.query(
        `SELECT imagenes FROM jornadas WHERE id = '${id_jornada}'`,
        (error, rows, fields) => {
          if (!error) {
            // Eliminacion de imagenes borradas
            var imgaux = rows[0].imagenes.split(",");
            var c2 = 0;
            ImgBorradas.forEach(element => {
              var c = 0;
              imgaux.forEach(imgguar => {
                var imgact = imgguar.split("/");
                if ([imgact[imgact.length - 1]] == element) {
                  imgaux.splice(c, 1);
                }
                c++;
              });
              c2++;
            });

            // Actualizacion de imagenes en base de datos
            var timer = setInterval(async () => {
              if (c2 == ImgBorradas.length) {
                clearInterval(timer);
                var ambasimg = "";
                if (String(imgaux) != "") {
                  if (String(RutImgGuardadas) != "") {
                    ambasimg = String(imgaux) + "," + String(RutImgGuardadas);
                  } else {
                    ambasimg = String(imgaux);
                  }
                } else {
                  ambasimg = String(RutImgGuardadas);
                }
                var queryenf = `UPDATE jornadas SET imagenes = '${ambasimg}' WHERE id = '${id_jornada}'`;
                mysqlConnection.query(queryenf, (error, rows, fields) => {
                  if (!error) {
                    console.log("Han sido guardadas las imagenes");
                    del = false;
                    return res.send(ambasimg);
                  } else {
                    console.log(
                      "Ha ocurrido un error en la consulta" +
                        error +
                        " " +
                        moment().format("YYYY-MM-DD h:mm:ss A")
                    );
                  }
                });
              }
            });
          } else {
            console.log(error);
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
        error
      });
    }
  }
);
module.exports = router;
