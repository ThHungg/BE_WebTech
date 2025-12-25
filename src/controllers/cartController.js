const cartService = require("../services/cartServices");

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_variant_id, quantity } = req.body;
    if (!product_variant_id || !quantity) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }
    const response = await cartService.addToCart({
      userId,
      product_variant_id,
      quantity,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    if (!cartItemId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID mục giỏ hàng",
      });
    }
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp số lượng hợp lệ",
      });
    }
    const response = await cartService.updateCartItemQuantity(
      cartItemId,
      quantity
    );
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getCartByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await cartService.getCartByUserId(userId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID mục giỏ hàng",
      });
    }
    const response = await cartService.deleteCartItem(itemId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const selectCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { is_selected } = req.body;
    if (!cartItemId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID mục giỏ hàng",
      });
    }
    if (typeof is_selected !== "boolean") {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp trạng thái lựa chọn hợp lệ",
      });
    }
    const response = await cartService.selectCartItem(cartItemId, is_selected);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getCartSelectedByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await cartService.getCartSelectedByUserId(userId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteCartItemSelected = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await cartService.deleteCartItemSelected(userId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  updateCartItemQuantity,
  deleteCartItem,
  selectCartItem,
  getCartSelectedByUserId,
  deleteCartItemSelected,
};
