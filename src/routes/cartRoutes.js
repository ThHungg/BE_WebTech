const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, cartController.addToCart);
router.post(
  "/selectItem/:cartItemId",
  authMiddleware,
  cartController.selectCartItem
);
router.put(
  "/updateItemQuantity/:cartItemId",
  authMiddleware,
  cartController.updateCartItemQuantity
);
router.get("/getCart", authMiddleware, cartController.getCartByUserId);
router.get(
  "/getCartSelected",
  authMiddleware,
  cartController.getCartSelectedByUserId
);
router.delete(
  "/deleteItem/:itemId",
  authMiddleware,
  cartController.deleteCartItem
);

router.delete(
  "/deleteItemSelected",
  authMiddleware,
  cartController.deleteCartItemSelected
);

module.exports = router;
