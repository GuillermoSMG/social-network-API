//IMPORTS
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
//TEST
const testUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/user.js",
    user: req.user,
  });
};

//SIGN UP METHOD
const signUp = (req, res) => {
  //get data
  let params = req.body;
  //data !== undefined && validate
  if (!params.name || !params.email || !params.password || !params.nickname) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar.",
    });
  }

  //control duplicate users
  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { email: params.nickname.toLowerCase() },
    ],
  }).exec(async (err, users) => {
    if (err)
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta de usuarios.",
      });

    if (users && users.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe.",
      });
    }
    //encode password
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;
    //create user
    const user_to_save = new User(params);
    //save user => DB
    user_to_save.save((err, savedUser) => {
      if (err || !savedUser) {
        return res.status(500).send({
          status: "error",
          message: "Error al guardar el usuario.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Usuario registrado correctamente.",
        user: savedUser,
      });
    });
  });
};

//LOGIN AUTH
const logIn = (req, res) => {
  //get data
  const params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar.",
    });
  }

  //search user at db
  User.findOne({ email: params.email }).exec((err, user) => {
    if (err || !user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario inexistente.",
      });
    }
    //check password
    let pwd = bcrypt.compareSync(params.password, user.password);
    if (!pwd) {
      return res.status(400).send({
        status: "error",
        message: "No te has identificado correctamente.",
      });
    }
    //return token
    const token = jwt.createToken(user);
    //return user data
    return res.status(200).send({
      status: "success",
      message: "Acceso correcto.",
      user: {
        id: user._id,
        name: user.name,
        nickname: user.nickname,
      },
      token,
    });
  });
};

module.exports = {
  testUser,
  signUp,
  logIn,
};
