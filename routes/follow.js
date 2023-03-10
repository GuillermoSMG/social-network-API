const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const { auth } = require("../middlewares/auth");

//define routes
router.get("/follow-test", FollowController.testFollow);
router.post("/save", auth, FollowController.save);
router.delete("/unfollow/:id", auth, FollowController.unfollow);
router.get("/following/:id?/:page?", auth, FollowController.following);
router.get("/followers/:id?/:page?", auth, FollowController.followers);

//export router
module.exports = router;
