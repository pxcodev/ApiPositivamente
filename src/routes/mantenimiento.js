const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
const mysqlConnection = require("../database");
const mysqldump = require("mysqldump");
const MySQLImporter = require("node-mysql-import");
var fs = require("fs");

router.get("/respaldar", async (req, res) => {
  var dir = "./src/respaldos/";
  var nombre = `Respaldo_${moment().format("YYYY-MM-DD_H-m-s")}.sql`;
  mysqldump({
    connection: {
      host: process.env.HOST_DB,
      user: process.env.USER_DB,
      password: process.env.PASS_DB,
      database: process.env.NAME_DB,
    },
    dumpToFile: dir + nombre,
  });
  var aux = nombre.split("_");
  var respuesta = {
    datos: {
      archivo: {
        fecha: moment(aux[1]).format("LL"),
        hora: moment(
          aux[2].split(".")[0].replace(/-/g, ":"),
          "h:mm:ss A"
        ).format("hh:mm:ss A"),
        nombre: nombre,
      },
    },
    estado: "exito",
    cod: 0,
    msg: "Respaldo con exito",
  };
  res.json(respuesta);
});

router.get("/respaldos", async (req, res) => {
  fs.readdir("./src/respaldos/", function (error, archivos) {
    if (error) {
      onError(error);
      return;
    }
    var arch = [];
    archivos.forEach((element) => {
      var aux = element.split("_");
      arch.push({
        fecha: moment(aux[1]).format("LL"),
        hora: moment(
          aux[2].split(".")[0].replace(/-/g, ":"),
          "h:mm:ss A"
        ).format("hh:mm:ss A"),
        nombre: element,
      });
    });
    var respuesta = {
      datos: arch,
      estado: "exito",
      cod: 0,
      msg: "Solicitud enviada",
    };
    res.json(respuesta);
  });
});

router.get("/EliminarRespaldo/:nombre", async (req, res) => {
  try {
    fs.unlinkSync("./src/respaldos/" + req.params.nombre);
    var respuesta = {
      datos: null,
      estado: "exito",
      cod: 0,
      msg: "Ha sido borrado el respaldo",
    };
    res.json(respuesta);
  } catch (error) {
    // Acá puedes manipular el error y decidir que hacer con el
  }
});

router.get("/restaurar/:nombre", async (req, res) => {
  try {
    var test = new MySQLImporter(
      process.env.HOST_DB,
      3306,
      process.env.USER_DB,
      process.env.PASS_DB,
      process.env.NAME_DB,
      "./src/respaldos/" + req.params.nombre
    );

    test
      .init()
      .then(test.dropDatabaseIfExists)
      .then(test.createDatabaseIfDoesNotExist)
      .then(test.execute)
      .then(function (success) {
        console.log("success");
        for (let i = 0; i < proc().length; i++) {
          mysqlConnection.query(proc()[i], (error, rows, fields) => {
            if (!error) {
            }
          });
        }

        var respuesta = {
          datos: null,
          estado: "exito",
          cod: 0,
          msg: "Ha sido restaurado el respaldo",
        };
        res.json(respuesta);
      })
      .catch((error) => {
        console.log("error");
        console.dir(error);
      });
  } catch (error) {
    console.log(error);
    var respuesta = {
      datos: null,
      estado: "error",
      cod: -1,
      msg: error,
    };
    res.json(respuesta);
  }
});

function proc() {
  var pro = [
    `CREATE PROCEDURE noticiasAddOrEdit(
	IN _id INT(11),
    IN _autor VARCHAR(50),
    IN _titulo VARCHAR(100),
    IN _contenido LONGTEXT,
    IN _extracto LONGTEXT,
    IN _fecha VARCHAR(50),
    IN _hora VARCHAR(50),
    IN _estado TINYINT(1),
    IN _status VARCHAR(20),
    IN _img_principal MEDIUMTEXT,
    IN _img_autor VARCHAR(100)
)
BEGIN
	IF _id = 0 THEN
    	INSERT INTO noticias (autor, titulo, contenido, extracto, fecha, hora, estado, status, img_principal, img_autor)
        VALUES (_autor, _titulo, _contenido, _extracto, _fecha, _hora, _estado, _status, _img_principal, _img_autor);
        SET _id = LAST_INSERT_ID();
    ELSE
    	UPDATE noticias
        SET 
        	titulo = _titulo,
        	contenido = _contenido,
            extracto = _extracto,
            fecha = _fecha,
            hora = _hora,
            estado = _estado,
            status = _status,
            img_principal = _img_principal
            WHERE id = _id;
    END IF;
    SELECT _id as id;
END`,
    `
CREATE PROCEDURE AddVoluntariosOGestores(
	IN _correo VARCHAR(50),
    IN _nombres VARCHAR(20),
    IN _apellidos VARCHAR(20),
    IN _Realtoken LONGTEXT,
    IN _nivel INT,
    IN _fechareg DATETIME,
    IN _estado VARCHAR(50)
)
BEGIN
	IF _nivel = 3 THEN
    	INSERT INTO voluntarios (correo, nombres, apellidos, fechareg, estado)
        VALUES (_correo, _nombres, _apellidos, _fechareg, _estado);
    ELSE
    	INSERT INTO gestores (correo, nombres, apellidos, fechareg, status)
        VALUES (_correo, _nombres, _apellidos, _fechareg, 'Habilitado');
    END IF;
    UPDATE solicitudes SET estado = "Completada" WHERE token = _Realtoken;
    UPDATE solicitudes SET estado = "Cancelada" WHERE correo = _correo AND token <> _Realtoken;
END
`,
    `
CREATE PROCEDURE Login(
	IN _correo VARCHAR(50),
    IN _nivel INT,
    IN _tiempo_entrada DATETIME
)
BEGIN
	IF _nivel = 3 THEN
    	SELECT * FROM usuarios INNER JOIN voluntarios ON usuarios.correo = voluntarios.correo WHERE usuarios.correo = _correo;
    ELSE
    	SELECT * FROM usuarios INNER JOIN gestores ON usuarios.correo = gestores.correo WHERE usuarios.correo = _correo;
    END IF;
    UPDATE usuarios SET tiempo_entrada = _tiempo_entrada WHERE usuarios.correo = _correo;
END
`,
    `
CREATE PROCEDURE proyectosAddOrEdit(
	IN _id_p INT(11),
    IN _titulo_p VARCHAR(100),
    IN _descripcion_p LONGTEXT,
    IN _extracto LONGTEXT,
    IN _fecha VARCHAR(50),
    IN _hora VARCHAR(50),
    IN _img_principal MEDIUMTEXT
)
BEGIN
	IF _id_p = 0 THEN
    	INSERT INTO proyectos (titulo_p, descripcion_p, extracto, fecha, hora, img_principal)
        VALUES (_titulo_p, _descripcion_p, _extracto, _fecha, _hora, _img_principal);
        SET _id_p = LAST_INSERT_ID();
    ELSE
    	UPDATE proyectos
        SET 
        	titulo_p = _titulo_p,
        	descripcion_p = _descripcion_p,
            extracto = _extracto,
            img_principal = _img_principal
            WHERE id_p = _id_p;
    END IF;
    SELECT _id_p as id_p;
END
`,
    `
CREATE PROCEDURE jornadasAddOrEdit(
	IN _id INT(11),
    IN _titulo VARCHAR(100),
    IN _descripcion LONGTEXT,
    IN _extracto LONGTEXT,
    IN _fecha VARCHAR(50),
    IN _hora VARCHAR(50),
    IN _ubicacion LONGTEXT,
    IN _cupos INT(11),
    IN _cuposrest INT(11),
	IN _id_p INT(11),
	IN _estado VARCHAR(50),
    IN _inscripcion VARCHAR(50)
)
BEGIN
	IF _id = 0 THEN
    	INSERT INTO jornadas (titulo, descripcion, extracto, fecha, hora, ubicacion, cupos, cuposrest, id_p, estado, inscripcion)
        VALUES (_titulo, _descripcion, _extracto, _fecha, _hora, _ubicacion, _cupos, _cuposrest, _id_p, _estado, _inscripcion);
        SET _id = LAST_INSERT_ID();
    ELSE
    	UPDATE jornadas
        SET 
        	titulo = _titulo,
        	descripcion = _descripcion,
            extracto = _extracto,
            fecha = _fecha,
            hora = _hora,
            ubicacion = _ubicacion,
            cupos = _cupos,
            cuposrest = _cuposrest,
		id_p = _id_p,
		estado = _estado
            WHERE id = _id;
    END IF;
    SELECT _id as id;
END
`,
    `
CREATE PROCEDURE gestoresAddOrEdit(
	IN _id INT(11),
    IN _nombres VARCHAR(50),
    IN _apellidos VARCHAR(100),
    IN _cedula VARCHAR(15),
    IN _correo VARCHAR(100),
    IN _correoold VARCHAR(100),
    IN _status VARCHAR(50),
    IN _nivel_id VARCHAR(50),
    IN _pass VARCHAR(100),
    IN _token MEDIUMTEXT, 
    IN _estado VARCHAR(50)
)
BEGIN
	IF _id = 0 THEN
    	INSERT INTO solicitudes (correo, nivel, estado, token)
        VALUES (_correo, _nivel_id, _estado, _token);
        SET _id = LAST_INSERT_ID();
        INSERT INTO usuarios (correo, nivel, pass)
        VALUES (_correo, _nivel_id, _pass);
        INSERT INTO gestores (nombres, apellidos, cedula, correo, status)
        VALUES (_nombres, _apellidos, _cedula, _correo, _status);
        SET _id = LAST_INSERT_ID();
    ELSE
    	UPDATE gestores
        SET 
        	nombres = _nombres,
        	apellidos = _apellidos,
        	cedula = _cedula,
            correo = _correo,
            status = _status
            WHERE correo = _correoold;
        UPDATE usuarios
        SET 
        	correo = _correo,
        	nivel = _nivel_id
            WHERE correo = _correoold;
        UPDATE solicitudes
        SET 
        	correo = _correo,
        	nivel = _nivel_id
            WHERE correo = _correoold;
    END IF;
    SELECT _id as id;
END
`,
  ];
  return pro;
}
module.exports = router;
