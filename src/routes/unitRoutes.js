const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");

router.post("/create", unitController.createUnit);

module.exports = router;
