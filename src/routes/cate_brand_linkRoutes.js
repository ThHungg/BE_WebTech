const express = require("express");
const router = express.Router();
const cateBrandLinkController = require("../controllers/cateBrandLinkController");
const { route } = require("./brandRoutes");

router.post("/link", cateBrandLinkController.createCateBrandLink);
router.get("/getByCategory/:categoryId", cateBrandLinkController.getLinksByCategoryId);

module.exports = router;
