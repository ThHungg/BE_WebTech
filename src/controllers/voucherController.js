const voucherService = require("../services/voucherService");

const createVoucher = async (req, res) => {
  try {
    const {
      discount_type,
      discount_value,
      code,
      brandId,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
    } = req.body;

    if (!code) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập mã voucher",
      });
    }
    if (!discount_type || !discount_value) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin voucher",
      });
    }

    const response = await voucherService.createVoucher({
      discount_type,
      discount_value,
      code,
      brandId,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
    });

    return res.status(201).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getAllVouchers = async (req, res) => {
  try {
    const response = await voucherService.getAllVouchers();
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await voucherService.getVoucherById(id);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const   applyVoucher = async (req, res) => {
  try {
    const { code, cartItems } = req.body;
    const response = await voucherService.applyVoucher(code, cartItems);
    return res.status(200).json(response);
  } catch (e) {}
};

const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await voucherService.deleteVoucher(id);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  applyVoucher,
  deleteVoucher,
};
