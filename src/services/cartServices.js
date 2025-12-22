const Product_Variant = require("../models/Product_Variant");
const Cart_Item = require("../models/Cart_Item");
const Cart = require("../models/Cart");

const addToCart = async (newItem) => {
  try {
    const { userId, product_variant_id, quantity } = newItem;
    const checkCart = await Cart.findOne({ where: { user_id: userId } });
    if (!checkCart) {
      const newCart = await Cart.create({ user_id: userId });
      return {
        status: "Ok",
        message: "Đã tạo giỏ hàng mới và thêm sản phẩm vào giỏ hàng",
        cart: newCart,
      };
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
        message: "Số lượng trông kho không đủ",
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

const deleteCartItem = async (cartItemId) => {
  try {
    const cartItem = await Cart_Item.findByPk(cartItemId);
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

module.exports = {
  addToCart,
  getCartByUserId,
  deleteCartItem,
};
