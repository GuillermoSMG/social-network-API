const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const multer = require("multer");
//Middleware
const { auth } = require("../middlewares/auth");

//upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/publications");
  },
  filename: function (req, file, cb) {
    cb(null, `publication${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

//define routes
router.get("/publication-test", PublicationController.testPublication);
router.post("/save", auth, PublicationController.save);
router.get("/detail/:id", auth, PublicationController.publicationDetail);
router.delete("/delete/:id", auth, PublicationController.deletePublication);
router.get("/user/:id/:page?", auth, PublicationController.user);
router.post(
  "/upload/:id",
  [auth, uploads.single("file0")],
  PublicationController.upload
);
router.get("/image/:file", auth, PublicationController.publicationImage);

//export router
module.exports = router;
