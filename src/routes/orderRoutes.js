const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, orderController.createOrder);
router.put(
  "/updateStatus/:orderId",
  authMiddleware,
  orderController.updateOrderStatus
);
router.get("/getAll", authMiddleware, orderController.getAllOrders);
router.get("/get/:id", authMiddleware, orderController.getOrderById);
router.get("/getOrderByUser", authMiddleware, orderController.getOrderByUser);
router.get("/stats", authMiddleware, orderController.getStatsOrder);

router.delete("/delete/:id", authMiddleware, orderController.deleteOrder);
router.delete("/cancel/:id", authMiddleware, orderController.cancelOrder);
module.exports = router;
