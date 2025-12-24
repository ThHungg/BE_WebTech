const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.get("/vnpay/create_payment", paymentController.createVNPayPayment);
router.get("/vnpay/payment-result", paymentController.handleVNPayReturn);
router.post("/vnpay/webhook", paymentController.handleVNPayWebhook);

module.exports = router;
