const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { uploadProduct } = require("../middleware/upload");

router.post(
  "/create",
  uploadProduct.fields([
    { name: "productImages", maxCount: 10 },
    { name: "descriptionImages", maxCount: 10 },
  ]),
  productController.createProduct
);

router.get("/detail/:productId", productController.getProductDetail);

router.delete("/delete/:productId", productController.deleteProduct);
module.exports = router;
