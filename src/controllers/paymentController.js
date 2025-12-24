const moment = require("moment-timezone");
const vnpayService = require("../services/vnpayService");

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

const handleVNPayReturn = (req, res) => {
  try {
    const query = { ...req.query };
    const result = vnpayService.verifyPaymentResult(query);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
        data: result,
      });
    }

    const isSuccess = result.responseCode === "00";

    res.json({
      success: true,
      isPaymentSuccess: isSuccess,
      message: isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại",
      data: {
        orderId: result.orderId,
        amount: result.amount,
        transactionNo: result.transactionNo,
        bankCode: result.bankCode,
        payDate: result.payDate,
        responseCode: result.responseCode,
      },
    });
  } catch (error) {
    console.error("Error handling VNPay return:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
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
};
