//IMPORTS
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
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
      { nickname: params.nickname.toLowerCase() },
    ],
  }).exec(async (err, users) => {
    if (err)
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta de usuarios.",
      });

    if (users && users.length >= 1) {
      return res.status(400).send({
        status: "success",
        message: "Nickname o Email ya registrados.",
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

//PROFILE
const profile = (req, res) => {
  //get id
  const id = req.params.id;
  //query user data
  User.findById(id)
    .select({ password: 0, role: 0 })
    .exec(async (err, userProfile) => {
      if (err || !userProfile) {
        return res.status(404).send({
          status: "error",
          message: "El usuario no existe.",
        });
      }
      //return follows
      const followInfo = await followService.followThisUser(req.user.id, id);
      //return result
      return res.status(200).send({
        status: "success",
        user: userProfile,
        following: followInfo.following,
        follower: followInfo.follower,
      });
    });
};

//USER LIST
const userList = (req, res) => {
  //page
  let page = 1;
  if (req.params.page) page = parseInt(req.params.page);
  //query mongoose pagination
  let itemsPerPage = 5;

  User.find({})
    .sort("_id")
    .paginate(page, itemsPerPage, async (err, users, total) => {
      //return result
      if (err || !users) {
        return res.status(404).send({
          status: "error",
          message: "No hay usuarios disponibles.",
        });
      }

      let followUserIds = await followService.followUserIds(req.user.id);

      return res.status(200).send({
        status: "success",
        users,
        page,
        itemsPerPage,
        total,
        pages: Math.ceil(total / itemsPerPage),
        user_following: followUserIds.following,
        users_follows_me: followUserIds.followers,
      });
    });
};

//UPDATE USER
const updateUser = (req, res) => {
  //get data
  let userIdentity = req.user;
  let userToUpdate = req.body;
  //delete innecesary fields
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;
  //look if user already exists
  User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nickname: userToUpdate.nickname.toLowerCase() },
    ],
  }).exec(async (err, users) => {
    if (err)
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta de usuarios.",
      });

    let userIsSet = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsSet = true;
    });
    if (userIsSet) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe.",
      });
    }
    //encode password
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    }
    //update
    try {
      let userUpdated = await User.findByIdAndUpdate(
        { _id: userIdentity.id },
        userToUpdate,
        { new: true }
      );
      if (!userUpdated) {
        return res.status(400).send({
          status: "error",
          message: "Error al actualizar.",
        });
      }
      return res.status(200).send({
        status: "success",
        message: "Usuario actualizado.",
        user: userUpdated,
      });
    } catch (err) {
      return res.status(500).send({
        status: "error",
        message: "Error al actualizar.",
      });
    }
  });
};

//UPLOAD AVATAR
const upload = (req, res) => {
  //get image file !== undefined
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Debe subir un archivo.",
    });
  }
  //get file name
  let image = req.file.originalname;
  //get extension
  const imageSplit = image.split(".");
  const extension = imageSplit[1];
  //delete if no correct, save if correct
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);
    return res.status(400).send({
      status: "error",
      message: "Extensión del archivo no válida.",
    });
  }

  User.findOneAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    { new: true },
    (err, userUpdated) => {
      if (err || !userUpdated) {
        return res.status(500).send({
          status: "error",
          message: "Error al intentar subir avatar.",
        });
      }

      //return result
      return res.status(200).send({
        status: "success",
        user: userUpdated,
        file: req.file,
      });
    }
  );
};

//GET AVATAR
const avatar = (req, res) => {
  //get param from url
  const file = req.params.file;
  //create path
  const filePath = `./upload/avatars/${file}`;
  //exists? return if yes or no
  fs.stat(filePath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen.",
      });
    }
    return res.sendFile(path.resolve(filePath));
  });
};

module.exports = {
  testUser,
  signUp,
  logIn,
  profile,
  userList,
  updateUser,
  upload,
  avatar,
};
