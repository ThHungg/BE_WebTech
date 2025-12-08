const express = require("express");
const router = express.Router();
const cateAttributeLinkController = require("../controllers/cateAttributeLinkController");

router.post("/link", cateAttributeLinkController.createCateAttributeLink);

module.exports = router;
