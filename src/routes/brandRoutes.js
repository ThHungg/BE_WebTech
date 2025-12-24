const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { uploadBrand, makeOptional } = require("../middleware/upload");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["Admin"]),
  uploadBrand.single("brandImage"),
  brandController.createBrand
);
router.post(
  "/update/:brandId",
  authMiddleware,
  roleMiddleware(["Admin"]),
  uploadBrand.single("brandImage"),
  brandController.updateBrand
);

router.get("/getAll", brandController.getAllBrands);

router.delete(
  "/delete/:brandId",
  authMiddleware,
  roleMiddleware(["Admin"]),
  brandController.deleteBrand
);
module.exports = router;
