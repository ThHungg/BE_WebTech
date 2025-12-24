const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      voucher_code,
      recipient_name,
      phone,
      shipping_address,
      payment_method,
      note,
    } = req.body;

    if (!recipient_name || !phone || !shipping_address || !payment_method) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp đầy đủ thông tin giao hàng",
      });
    }

    const response = await orderService.createOrder({
      userId,
      voucher_code,
      recipient_name,
      phone,
      shipping_address,
      payment_method,
      note,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: "Err", message: e.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(orderId, status);
    if (!orderId || !status) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }
    const response = await orderService.updateOrderStatus(orderId, status);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const offset = (page - 1) * limit;
    const response = await orderService.getAllOrders({
      limit,
      offset,
      page,
      search,
      status,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await orderService.getOrderById(id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getOrderByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const response = await orderService.getOrderByUser(userId, page, limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getStatsOrder = async (req, res) => {
  try {
    const response = await orderService.getStatsOrder();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await orderService.deleteOrder(id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const response = await orderService.cancelOrder(userId, id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  getOrderByUser,
  getStatsOrder,
  deleteOrder,
  cancelOrder,
};
