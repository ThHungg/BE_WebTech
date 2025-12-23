const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { uploadProduct } = require("../middleware/upload");

router.post(
  "/create",
  uploadProduct.fields([{ name: "productImages", maxCount: 10 }]),
  productController.createProduct
);

router.post(
  "/update/:productId",
  uploadProduct.fields([{ name: "productImages", maxCount: 10 }]),
  productController.updateProduct
);
router.put("/updateStatus/:productId", productController.updateProductStatus);

router.get("/detail/:productId", productController.getProductDetail);
router.get("/getAll", productController.getAllProducts);

router.delete("/delete/:productId", productController.deleteProduct);
module.exports = router;
