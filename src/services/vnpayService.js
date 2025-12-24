const express = require("express");
const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment-timezone");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

const createPaymentUrl = (
  orderId,
  amount,
  ipAddr,
  bankCode = "",
  language = "vn"
) => {
  const tmnCode = process.env.VNP_TMN_CODE || "4ZVUWL9J";
  const secretKey =
    process.env.VNP_SECRET_KEY || "AVZ4GCMJ2X999T0HO5FJB0LO97PYL6WN";
  const returnUrl =
    process.env.VNP_RETURN_URL ||
    `${process.env.BASE_URL}/api/vnpay/payment-result`;
  const vnp_Url =
    process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  let createDate = moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss");
  let expireDate = moment()
    .tz("Asia/Ho_Chi_Minh")
    .add(30, "minutes")
    .format("YYYYMMDDHHmmss");

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: language || "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh_toan_don_hang_${orderId}`,
    vnp_OrderType: "billpayment",
    vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params);
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params)}`;

  return {
    paymentUrl,
    orderId,
    amount,
    signData,
    signed,
  };
};

// Xác minh kết quả thanh toán từ VNPay
const verifyPaymentResult = (query) => {
  const secretKey =
    process.env.VNP_SECRET_KEY || "AVZ4GCMJ2X999T0HO5FJB0LO97PYL6WN";
  const vnp_SecureHash = query.vnp_SecureHash;

  // Xóa vnp_SecureHash và vnp_SecureHashType khỏi query để tính lại hash
  delete query.vnp_SecureHash;
  delete query.vnp_SecureHashType;

  const signData = qs.stringify(query);
  const hmac = crypto.createHmac("sha512", secretKey);
  const checkSum = hmac.update(signData).digest("hex");

  // Kiểm tra tính hợp lệ của hash
  const isValid = vnp_SecureHash === checkSum;

  return {
    isValid,
    checkSum,
    vnp_SecureHash,
    responseCode: query.vnp_ResponseCode || "01",
    transactionNo: query.vnp_TransactionNo,
    bankCode: query.vnp_BankCode,
    cardType: query.vnp_CardType,
    bankTranNo: query.vnp_BankTranNo,
    amount: query.vnp_Amount ? parseInt(query.vnp_Amount) / 100 : 0,
    orderId: query.vnp_TxnRef,
    payDate: query.vnp_PayDate,
  };
};

module.exports = {
  createPaymentUrl,
  verifyPaymentResult,
  sortObject,
};
