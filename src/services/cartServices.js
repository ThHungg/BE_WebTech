const Product_Variant = require("../models/Product_Variant");
const Cart_Item = require("../models/Cart_Item");
const Cart = require("../models/Cart");
const { Product, Img_Product } = require("../models");

const addToCart = async (newItem) => {
  try {
    const { userId, product_variant_id, quantity } = newItem;

    let checkCart = await Cart.findOne({ where: { user_id: userId } });
    if (!checkCart) {
      checkCart = await Cart.create({ user_id: userId });
    }

    const checkVariant = await Product_Variant.findOne({
      where: { id: product_variant_id },
    });
    if (!checkVariant) {
      return {
        status: "Err",
        message: "Biến thể sản phẩm không tồn tại",
      };
    }

    if (quantity > checkVariant.stock) {
      return {
        status: "Err",
        message: "Số lượng trong kho không đủ",
      };
    }

    const checkItem = await Cart_Item.findOne({
      where: {
        cart_id: checkCart.id,
        product_variant_id: product_variant_id,
      },
    });

    if (checkItem) {
      checkItem.quantity += quantity;
      await checkItem.save();
      return {
        status: "Ok",
        message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
        cartItem: checkItem,
      };
    } else {
      const newCartItem = await Cart_Item.create({
        cart_id: checkCart.id,
        product_variant_id: product_variant_id,
        quantity: quantity,
      });
      return {
        status: "Ok",
        message: "Đã thêm sản phẩm vào giỏ hàng",
        cartItem: newCartItem,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getCartByUserId = async (userId) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Cart_Item,
          as: "items",
          include: [
            {
              model: Product_Variant,
              as: "variant",

              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "brand_id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!cart) {
      return {
        status: "Ok",
        message: "Giỏ hàng trống",
        cart: null,
      };
    }
    return {
      status: "Ok",
      message: "Lấy giỏ hàng thành công",
      cart: cart,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const deleteCartItem = async (itemId) => {
  try {
    const cartItem = await Cart_Item.findByPk(itemId);
    if (!cartItem) {
      return {
        status: "Err",
        message: "Mục giỏ hàng không tồn tại",
      };
    }
    await cartItem.destroy();
    return {
      status: "Ok",
      message: "Xóa mục giỏ hàng thành công",
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const selectCartItem = async (cartItemId, is_selected) => {
  try {
    const cartItem = await Cart_Item.findByPk(cartItemId);
    if (!cartItem) {
      return {
        status: "Err",
        message: "Mục giỏ hàng không tồn tại",
      };
    }
    cartItem.is_selected = is_selected;
    await cartItem.save();
    return {
      status: "Ok",
      message: "Cập nhật trạng thái lựa chọn mục giỏ hàng thành công",
      cartItem: cartItem,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getCartSelectedByUserId = async (userId) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Cart_Item,
          as: "items",
          where: { is_selected: true },
          include: [
            {
              model: Product_Variant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "brand_id", "name"],
                  include: [
                    {
                      model: Img_Product,
                      as: "images",
                      attributes: ["image"],
                      limit: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!cart) {
      return {
        status: "Ok",
        message: "Không có mục giỏ hàng được chọn",
        cart: null,
      };
    }

    let totalPrice = 0;
    let totalQuantity = 0;

    cart.items.forEach((item) => {
      const itemPrice = item.variant.price * item.quantity;
      totalPrice += itemPrice;
      totalQuantity += item.quantity;
    });

    return {
      status: "Ok",
      message: "Lấy các mục giỏ hàng được chọn thành công",
      data: {
        items: cart.items,
        totalPrice,
        totalQuantity,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const deleteCartItemSelected = async (userId) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return {
        status: "Err",
        message: "Giỏ hàng không tồn tại",
      };
    }

    await Cart_Item.destroy({
      where: {
        cart_id: cart.id,
        is_selected: true,
      },
    });

    return {
      status: "Ok",
      message: "Xóa các mục giỏ hàng được chọn thành công",
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  deleteCartItem,
  selectCartItem,
  getCartSelectedByUserId,
  deleteCartItemSelected,
};
