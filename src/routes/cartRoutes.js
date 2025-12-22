const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, cartController.addToCart);
router.post("/selectItem", authMiddleware, cartController.selectCartItem);
router.get("/getCart", authMiddleware, cartController.getCartByUserId);
router.delete(
  "/deleteItem/:itemId",
  authMiddleware,
  cartController.deleteCartItem
);

module.exports = router;
