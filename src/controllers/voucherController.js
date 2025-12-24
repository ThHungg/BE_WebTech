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

const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
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
      is_active,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID voucher",
      });
    }

    const response = await voucherService.updateVoucher(id, {
      discount_type,
      discount_value,
      code,
      brandId,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      is_active,
    });

    return res.status(200).json(response);
  } catch (e) {}
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

const applyVoucher = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?.id; // Lấy từ auth middleware

    if (!code) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập mã voucher",
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: "Err",
        message: "Vui lòng đăng nhập để áp dụng voucher",
      });
    }

    const response = await voucherService.applyVoucher(code, userId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    });
  }
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
  updateVoucher,
  getAllVouchers,
  getVoucherById,
  applyVoucher,
  deleteVoucher,
};
