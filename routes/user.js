const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");

//define routes
router.get("/user-test", auth, UserController.testUser);
router.post("/signup", UserController.signUp);
router.post("/login", UserController.logIn);

//export router
module.exports = router;
