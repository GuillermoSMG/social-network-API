const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");

//define routes
router.get("/user-test", auth, UserController.testUser);
router.post("/signup", UserController.signUp);
router.post("/login", UserController.logIn);
router.get("/profile/:id", auth, UserController.profile);
router.get("/list/:page?", auth, UserController.userList);
router.put("/update", auth, UserController.updateUser);

//export router
module.exports = router;
