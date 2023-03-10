const Follow = require("../models/Follow");
const User = require("../models/User");

const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/follow.js",
  });
};

//FOLLOW
const save = (req, res) => {
  //get body data
  const params = req.body;
  //get user id
  const identity = req.user;
  //create obj with model follow
  let userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });
  //save obj => DB
  userToFollow.save((err, followSaved) => {
    if (err || !followSaved) {
      return res.status(500).send({
        status: "error",
        message: "No se ha podido seguir al usuario.",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Usuario seguido correctamente",
      identity: req.user,
      follow: followSaved,
    });
  });
};

//UNFOLLOW
const unfollow = (req, res) => {
  //get user id
  const userId = req.user.id;
  //get unfollowed user id
  const followedId = req.params.id;
  //find of condicences and remove
  Follow.find({
    user: userId,
    followed: followedId,
  }).remove((err, followStored) => {
    if (err || !followStored) {
      return res.status(500).send({
        status: "error",
        message: "No se ha podido dejar de seguir al usuario.",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Ya no sigues al usuario.",
    });
  });
};

//list of follows
const following = (req, res) => {
  //get user id
  //get id from params?
  //get page from params?
  //users per page
  //find follow and paginate with mongoose
  //users follow others and also follow me
  return res.status(200).send({
    status: "success",
    message: "Lista seguidos!",
  });
};

const followers = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Lista me siguen!",
  });
};

module.exports = {
  testFollow,
  save,
  unfollow,
  following,
  followers,
};
