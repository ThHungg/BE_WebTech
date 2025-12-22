const express = require("express");
const router = express.Router();
const cateAttributeLinkController = require("../controllers/cateAttributeLinkController");

router.post("/link", cateAttributeLinkController.createCateAttributeLink);
router.get(
  "/getByCategory/:categoryId",
  cateAttributeLinkController.getLinksByCategoryId
);
router.delete(
  "/delete/:id",
  cateAttributeLinkController.deleteCateAttributeLink
);

module.exports = router;
