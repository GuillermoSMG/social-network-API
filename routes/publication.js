const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");

//define routes
router.get("/publication-test", PublicationController.testPublication);

//export router
module.exports = router;
