const express = require("express");
const router = express.Router();
const cateBrandLinkController = require("../controllers/cateBrandLinkController");
const { route } = require("./brandRoutes");

router.post("/link", cateBrandLinkController.createCateBrandLink);
router.get(
  "/getByCategory/:categoryId",
  cateBrandLinkController.getLinksByCategoryId
);

router.delete(
  "/deleteLink/:categoryId/:brandId",
  cateBrandLinkController.deleteCateBrandLink
);

router.get("/getByBrand/:brandId", cateBrandLinkController.getLinksByBrandId);
router.get(
  "/getParentByBrand/:brandId",
  cateBrandLinkController.getParentCategoriesByBrandId
);
router.get(
  "/getChildByParent/:parentId/:brandId",
  cateBrandLinkController.getChildCategoriesByParentId
);
router.get("/getAll", cateBrandLinkController.getAllLinks);

module.exports = router;
