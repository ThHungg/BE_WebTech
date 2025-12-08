const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");

router.post("/create", attributeController.createAttributes);

module.exports = router;
