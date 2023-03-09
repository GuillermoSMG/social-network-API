//IMPORTS
const jwt = require("jwt-simple");
const moment = require("moment");

//secret key
//SECRET = process.env.SECRET;

//GENERATE TOKEN FUNCTION
const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  //return token
  return jwt.encode(payload, process.env.SECRET);
};

module.exports = { createToken };
