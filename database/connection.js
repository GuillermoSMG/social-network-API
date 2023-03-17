const mongoose = require("mongoose");

const connection = async () => {
  try {
    mongoose.connect(process.env.URL_DB);
    console.log("Conectado a DB Social Network");
  } catch (err) {
    console.log(err);
    throw new Error("No se ha podido conectar a la base de datos.");
  }
};

module.exports = {
  connection,
};
