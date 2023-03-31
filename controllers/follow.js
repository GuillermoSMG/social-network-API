const Follow = require("../models/Follow");
const User = require("../models/User");
const { paginate } = require("mongoose-pagination");
const followService = require("../services/followService");

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
  let userId = req.user.id;
  //get id from params?
  if (req.params.id) userId = req.params.id;
  //get page from params?
  let page = 1;

  if (req.params.page) page = req.params.page;
  //users per page
  const itemsPerPage = 5;
  //find follow and paginate with mongoose
  Follow.find({ user: userId })
    .populate("user followed", "-role -password -__v -email")
    .paginate(page, itemsPerPage, async (err, follows, total) => {
      let followUserIds = await followService.followUserIds(req.user.id);
      return res.status(200).send({
        status: "success",
        message: "Lista seguidos!",
        follows,
        total,
        page: Math.ceil(total / itemsPerPage),
        user_following: followUserIds.following,
        users_follows_me: followUserIds.followers,
      });
    });
  //users follow others and also follow me
};

const followers = (req, res) => {
  //get user id
  let userId = req.user.id;
  //get id from params?
  if (req.params.id) userId = req.params.id;
  //get page from params?
  let page = 1;

  if (req.params.page) page = req.params.page;
  //users per page
  const itemsPerPage = 5;

  Follow.find({ followed: userId })
    .populate("user", "-role -password -__v -email")
    .paginate(page, itemsPerPage, async (err, follows, total) => {
      let followUserIds = await followService.followUserIds(req.user.id);
      return res.status(200).send({
        status: "success",
        message: "Lista de usuarios que me siguen.",
        follows,
        total,
        page: Math.ceil(total / itemsPerPage),
        user_following: followUserIds.following,
        users_follows_me: followUserIds.followers,
      });
    });
};

module.exports = {
  testFollow,
  save,
  unfollow,
  following,
  followers,
};
