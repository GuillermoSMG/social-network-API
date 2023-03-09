//IMPORTS
const jwt = require("jwt-simple");
const moment = require("moment");

//AUTH MIDDLEWARE
const auth = (req, res, next) => {
  //auth header
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "La petición no contiene la cabecera de autenticación.",
    });
  }

  let token = req.headers.authorization.replace(/['"]+g/, "");
  //decode token
  try {
    let payload = jwt.decode(token, process.env.SECRET);
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token expirado.",
      });
    }
    //add data to req
    req.user = payload;
  } catch (err) {
    return res.status(404).send({
      status: "error",
      message: "Token inválido.",
    });
  }
  //next action
  next();
};

module.exports = { auth };
