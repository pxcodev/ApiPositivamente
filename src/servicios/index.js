"use strict";
const jwt = require("jwt-simple");
const moment = require("moment");

function CrearToken(correo, time, type) {
  const payload = {
    cor: correo,
    ini: moment().unix(),
    exp: moment().add(time, type).unix(),
  };
  return jwt.encode(payload, process.env.SECRET_TOKEN);
}

function DecodificarToken(token) {
  var respuesta;
  try {
    var result = jwt.decode(token, process.env.SECRET_TOKEN);
    respuesta = {
      datos: {
        result,
      },
      estado: "exito",
      cod: 0,
      msg: "Token valido",
    };
  } catch (error) {
    console.log(error);
    // Usuario solicito pero el token esta vencido
    if (error.message == "Token expired") {
      respuesta = {
        datos: null,
        estado: "expirado",
        cod: -1,
        msg: error.message,
      };
    } else {
      //   console.log(error);
      respuesta = {
        datos: null,
        estado: "error",
        cod: -2,
        msg: "Solicitud no encontrada",
      };
    }
  }
  return respuesta;
}

function ValExpToken(exp) {
  return moment().unix() >= exp ? true : false;
}
exports.CrearToken = CrearToken;
exports.DecodificarToken = DecodificarToken;
exports.ValExpToken = ValExpToken;
