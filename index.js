const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const { connection } = require("./database/connection");
const userRoutes = require("./routes/user");
const publicationRoutes = require("./routes/publication");
const followRoutes = require("./routes/follow");

//dotenv
dotenv.config();

//inicio de api
console.log("Api Iniciada.");

//DB connection
connection();

//Create Node Server
const app = express();

//CORS
app.use(cors());

//Body to JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes config
//test route
app.get("/test", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Exito!",
  });
});

app.use("/api/user", userRoutes);
app.use("/api/publication", publicationRoutes);
app.use("/api/follow", followRoutes);

//Run server
app.listen(process.env.PORT, () => {
  console.log(`Servidor de Node corriendo en el puerto ${process.env.PORT}`);
});
