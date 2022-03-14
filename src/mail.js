var nodemailer = require("nodemailer"); // email sender function
const moment = require("moment");
exports.sendEmail = async (req, res) => {
  // Send mails through an existing and valid gmail address
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  // Send mail through a local service

  // var transporter = nodemailer.createTransport({
  //   host: "localhost",
  //   port: 25,
  // });
  let OpcionesCorreo = {
    from: `'Proyecto Positivamente' <${process.env.EMAIL}>`,
    to: req.to,
    subject: req.subject,
    html: req.html,
  };
  transporter.sendMail(OpcionesCorreo, function (error, info) {
    if (error) {
      console.log("Ha ocurrido un error al enviar el correo: " + error);
      res({
        cod: -5,
        error: error.message,
        msg: "No se ha enviado el correo",
      });
      console.log(
        "No se ha enviado el correo " +
          req.to +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    } else {
      console.log("Correo enviado");
      res({
        cod: 0,
        msg: "Correo enviado",
      });
      console.log(
        "Correo enviado " +
          req.to +
          " " +
          moment().format("YYYY-MM-DD h:mm:ss A")
      );
    }
    transporter.close();
  });
};
