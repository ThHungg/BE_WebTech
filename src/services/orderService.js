const { generateOrderCode } = require("../../utils/generateOrderCode");
const { sequelize } = require("../config/db");
const { Product_Variant, Product } = require("../models");
const CartItem = require("../models/Cart_Item");
const Order = require("../models/Order");
const OrderDetail = require("../models/Order_Detail");
const voucherService = require("./voucherService");
const { Op } = require("sequelize");

const createOrder = async (orderData) => {
  const t = await sequelize.transaction();
  try {
    const {
      userId,
      voucher_code,
      cartItemIds,
      recipient_name,
      phone,
      shipping_address,
      payment_method,
      note,
    } = orderData;

    const itemsInCart = await CartItem.findAll({
      where: { id: { [Op.in]: cartItemIds }, cart_id: userId },
      include: [{ model: Product_Variant, as: "variant" }],
      transaction: t,
    });

    if (!itemsInCart || itemsInCart.length === 0) {
      return {
        status: "Err",
        message: "Giỏ hàng trống hoặc không hợp lệ",
      };
    }

    let totalAmount = 0;
    const orderDetailsData = [];

    for (const item of itemsInCart) {
      const variant = item.variant;

      if (!variant) {
        return {
          status: "Err",
          message: `Phiên bản sản phẩm không tồn tại cho item trong giỏ hàng`,
        };
      }
      if (variant.stock < item.quantity) {
        return {
          status: "Err",
          message: `Sản phẩm ${variant.id} không đủ số lượng trong kho`,
        };
      }

      const itemTotalPrice = variant.price * item.quantity;
      totalAmount += itemTotalPrice;

      variant.stock -= item.quantity;
      variant.sold += item.quantity;
      await variant.save({ transaction: t });

      orderDetailsData.push({
        product_variant_id: variant.id,
        quantity: item.quantity,
        price: variant.price,
        total_price: itemTotalPrice,
      });
    }

    let discountAmount = 0;
    if (voucher_code) {
      console.log("Applying voucher:", voucher_code);
      const voucherResponse = await voucherService.applyVoucher(
        voucher_code,
        itemsInCart
      );
      if (voucherResponse.status === "Err") {
        return {
          status: "Err",
          message: voucherResponse.message,
        };
      }
      discountAmount = voucherResponse.data?.discount_amount || 0;
    }

    const finalAmount = totalAmount - discountAmount;
    const orderCode = generateOrderCode();

    const newOrder = await Order.create(
      {
        order_code: orderCode,
        user_id: userId,
        voucher_detail_id: voucher_code || null,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        recipient_name,
        phone,
        shipping_address,
        payment_method,
        order_status: "pending",
        note,
      },
      { transaction: t }
    );
    const finalDetails = orderDetailsData.map((detail) => ({
      ...detail,
      order_id: newOrder.id,
    }));
    await OrderDetail.bulkCreate(finalDetails, { transaction: t });

    await CartItem.destroy({
      where: { id: cartItemIds },
      transaction: t,
    });

    await t.commit();
    return {
      status: "Ok",
      message: "Đơn hàng đã được tạo thành công",
      data: newOrder,
    };
  } catch (e) {
    await t.rollback();
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return {
        status: "Err",
        message: "Đơn hàng không tồn tại",
      };
    }

    order.order_status = status;
    await order.save();

    return {
      status: "Ok",
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getAllOrders = async ({
  limit = 10,
  offset = 0,
  search = "",
  status = "",
} = {}) => {
  try {
    // Xây dựng điều kiện WHERE
    const whereConditions = {};

    // Tìm kiếm theo order_code, recipient_name, phone
    if (search) {
      whereConditions[Op.or] = [
        { order_code: { [Op.like]: `%${search}%` } },
        { recipient_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Lọc theo trạng thái
    if (status) {
      whereConditions.order_status = status;
    }

    const orders = await Order.findAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: OrderDetail,
          as: "details",
          include: [
            {
              model: Product_Variant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    const total = await Order.count({
      where: whereConditions,
    });

    return {
      status: "Ok",
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getOrderById = async (id) => {
  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderDetail,
          as: "details",
          include: [
            {
              model: Product_Variant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!order) {
      return {
        status: "Err",
        message: "Đơn hàng không tồn tại",
      };
    }
    return {
      status: "Ok",
      message: "Lấy thông tin đơn hàng thành công",
      data: order,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getOrderByUser = async (userId) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderDetail,
          as: "details",
          include: [
            {
              model: Product_Variant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });
    return {
      status: "Ok",
      message: "Lấy danh sách đơn hàng của người dùng thành công",
      data: orders,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getStatsOrder = async () => {
  try {
    const statusList = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const stats = {};

    for (const status of statusList) {
      const count = await Order.count({ where: { order_status: status } });
      stats[status] = count;
    }
    return {
      status: "Ok",
      message: "Lấy thống kê đơn hàng thành công",
      data: stats,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const deleteOrder = async (id) => {
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return {
        status: "Err",
        message: "Đơn hàng không tồn tại",
      };
    }

    await OrderDetail.destroy({ where: { order_id: id } });
    await order.destroy();

    return {
      status: "Ok",
      message: "Xóa đơn hàng thành công",
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
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
};
