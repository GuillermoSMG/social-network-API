const Publication = require("../models/Publication");
const { paginate } = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");

const testPublication = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/publication.js",
  });
};

//SAVE PUBLICATION
const save = (req, res) => {
  //get body data
  const params = req.body;
  //no data === return error
  if (!params.text)
    return res.status(400).send({
      status: "error",
      message: "Debes enviar un texto.",
    });
  //create obj
  let newPublication = new Publication(params);
  newPublication.user = req.user.id;
  //save obj DB
  newPublication.save((err, savedPublication) => {
    if (err || !savedPublication)
      return res.status(400).send({
        status: "error",
        message: "No se ha podido guardar la publicación.",
      });
    return res.status(200).send({
      status: "success",
      message: "Se ha guardado la publicación.",
      savedPublication,
    });
  });
};

//GET ONE PUBLICATION
const publicationDetail = (req, res) => {
  //get publication id from url
  const publicationId = req.params.id;
  //find publication by id
  Publication.findById(publicationId, (err, storedPublication) => {
    if (err || !storedPublication)
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado la publicación.",
      });
    return res.status(200).send({
      status: "success",
      message: "Detalle.",
      storedPublication,
    });
  });
};
//DELETE PUBLICATION
const deletePublication = (req, res) => {
  //get publication id from url
  const publicationId = req.params.id;
  //find publication by id
  Publication.find({ user: req.user.id, _id: publicationId }).remove((err) => {
    if (err)
      return res.status(500).send({
        status: "error",
        message: "No se ha podido eliminar la publicación.",
      });
    return res.status(200).send({
      status: "success",
      message: "Se ha eliminado una publicación.",
      publicationId,
    });
  });
};

//USERS FOLLOWING PUBLICATIONS
const user = (req, res) => {
  //get user id
  let userId = req.params.id;
  //page number
  let page = req.params?.page || 1;
  const itemsPerPage = 5;
  //find, populate, paginate
  Publication.find({ user: userId })
    .sort("-created_at")
    .populate("user", "-password -__v -role -email")
    .paginate(page, itemsPerPage, (err, publications, total) => {
      if (err || !publications || publications.length < 1)
        return res.status(404).send({
          status: "error",
          message: "No se han encontrado publicaciones.",
        });

      return res.status(200).send({
        status: "success",
        message: "Lista de publicaciones.",
        page,
        pages: Math.ceil(total / itemsPerPage),
        itemsPerPage,
        publications,
      });
    });
};

//UPLOAD FILE
const upload = (req, res) => {
  //get publication id
  let publicationId = req.params.id;
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

  Publication.findOneAndUpdate(
    { user: req.user.id, _id: publicationId },
    { file: req.file.filename },
    { new: true },
    (err, publicationUpdated) => {
      if (err || !publicationUpdated) {
        return res.status(500).send({
          status: "error",
          message: "Error al intentar subir imagen.",
        });
      }
      //return result
      return res.status(200).send({
        status: "success",
        publicationUpdated,
        file: req.file,
      });
    }
  );
};

//RETURN MULTIMEDIA
const publicationImage = (req, res) => {
  //get param from url
  const file = req.params.file;
  //create path
  const filePath = `./upload/publications/${file}`;
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

//(FEED) PUBLICATIONS LIST
const feed = async (req, res) => {
  //get page
  let page = req.params?.page || 1;
  //items per page
  const itemsPerPage = 5;
  //my follows
  try {
    let followUserIds = await followService.followUserIds(req.user.id);

    const publications = await Publication.find({
      user: followUserIds.following,
    })
      .populate("user", "-password -role -__v -email")
      .sort("-created_at")
      .paginate(page, itemsPerPage, (err, publications, total) => {
        if (err || !publications || publications.length < 1) {
          return res.status(404).send({
            status: "error",
            message: "No se han encontrado publicaciones.",
          });
        }

        return res.status(200).send({
          status: "success",
          following: followUserIds.following,
          total,
          page,
          pages: Math.ceil(total / itemsPerPage),
          publications,
        });
      });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "No se han podido listar las publicaciones.",
    });
  }
  //find publications, populate n paginate
};

module.exports = {
  testPublication,
  save,
  publicationDetail,
  deletePublication,
  user,
  upload,
  publicationImage,
  feed,
};
