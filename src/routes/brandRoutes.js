const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { uploadBrand } = require("../middleware/upload");
const {
  authMiddleware,
  roleMddleware,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  uploadBrand.single("brandImage"),
  brandController.createBrand
);
router.post(
  "/update/:brandId",
  uploadBrand.single("brandImage"),
  brandController.updateBrand
);

router.get(
  "/getAll",
  authMiddleware,
  roleMddleware(["Admin"]),
  brandController.getAllBrands
);

router.delete(
  "/delete/:brandId",
  authMiddleware,
  roleMddleware(["Admin"]),
  brandController.deleteBrand
);
module.exports = router;
