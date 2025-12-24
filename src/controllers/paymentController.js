const moment = require("moment-timezone");
const vnpayService = require("../services/vnpayService");
const { deleteCartItemSelected } = require("./cartController");
const OrderDetail = require("../models/Order_Detail");
const Order = require("../models/Order");
const { Product_Variant } = require("../models");
const CartItem = require("../models/Cart_Item");
const Cart = require("../models/Cart");

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    "unknown"
  );
};

const createVNPayPayment = (req, res) => {
  try {
    const { amount, orderId, bankCode, language } = req.query;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Amount and orderId are required",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const ipAddr = getClientIp(req);

    const paymentData = vnpayService.createPaymentUrl(
      orderId,
      parseInt(amount),
      ipAddr,
      bankCode || "",
      language || "vn"
    );

    res.json({
      success: true,
      paymentUrl: paymentData.paymentUrl,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
    });
  } catch (error) {
    console.error("Error creating VNPay payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const clearCartAndUpdateStock = async (orderCode) => {
  try {
    const order = await Order.findOne({
      where: { order_code: orderCode },
    });

    if (!order) {
      console.error("Order not found:", orderCode);
      return;
    }

    const orderDetails = await OrderDetail.findAll({
      where: { order_id: order.id },
    });

    for (const detail of orderDetails) {
      const variant = await Product_Variant.findByPk(detail.product_variant_id);
      if (variant) {
        variant.stock -= detail.quantity;
        variant.sold += detail.quantity;
        await variant.save();
      }
    }

    // Xóa cart items của người dùng
    const cart = await Cart.findOne({ where: { user_id: order.user_id } });
    if (cart) {
      await CartItem.destroy({
        where: {
          cart_id: cart.id,
          is_selected: true,
        },
      });
    }

    console.log("Stock updated and cart cleared for order:", orderCode);
  } catch (error) {
    console.error("Error clearing cart and updating stock:", error);
  }
};

const handleVNPayReturn = (req, res) => {
  try {
    const query = { ...req.query };
    const result = vnpayService.verifyPaymentResult(query);

    if (!result.isValid) {
      return res.redirect(
        `http://localhost:3000/checkout/payment-failed?message=Invalid+signature`
      );
    }

    const isSuccess = result.responseCode === "00";

    if (isSuccess) {
      clearCartAndUpdateStock(result.orderId);

      return res.redirect(
        `http://localhost:3000/checkout/payment-success?orderId=${result.orderId}&amount=${result.amount}`
      );
    } else {
      return res.redirect(
        `http://localhost:3000/checkout/payment-failed?message=Payment+failed`
      );
    }
  } catch (error) {
    console.error("Error handling VNPay return:", error);
    res.redirect(
      `http://localhost:3000/checkout/payment-failed?message=Internal+server+error`
    );
  }
};

const handleVNPayWebhook = (req, res) => {
  try {
    const query = { ...req.body };
    const result = vnpayService.verifyPaymentResult(query);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    res.json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Error handling VNPay webhook:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createVNPayPayment,
  handleVNPayReturn,
  handleVNPayWebhook,
  clearCartAndUpdateStock,
};
