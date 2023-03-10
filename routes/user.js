const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");
const multer = require("multer");

//upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/avatars");
  },
  filename: function (req, file, cb) {
    cb(null, `avatar${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

//define routes
router.get("/user-test", auth, UserController.testUser);
router.post("/signup", UserController.signUp);
router.post("/login", UserController.logIn);
router.get("/profile/:id", auth, UserController.profile);
router.get("/list/:page?", auth, UserController.userList);
router.put("/update", auth, UserController.updateUser);
router.post("/upload", [auth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", auth, UserController.avatar);

//export router
module.exports = router;
