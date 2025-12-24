const { generateOrderCode } = require("../../utils/generateOrderCode");
const { sequelize } = require("../config/db");
const { Product_Variant, Product, Img_Product } = require("../models");
const CartItem = require("../models/Cart_Item");
const Order = require("../models/Order");
const OrderDetail = require("../models/Order_Detail");
const Cart = require("../models/Cart");
const voucherService = require("./voucherService");
const cartServices = require("./cartServices");
const { Op } = require("sequelize");

const createOrder = async (orderData) => {
  const t = await sequelize.transaction();
  try {
    const {
      userId,
      voucher_code,
      recipient_name,
      phone,
      shipping_address,
      payment_method,
      note,
    } = orderData;

    // Lấy selected cart items từ cartServices
    const cartResponse = await cartServices.getCartSelectedByUserId(userId);

    if (
      cartResponse.status === "Err" ||
      !cartResponse.data ||
      cartResponse.data.items.length === 0
    ) {
      return {
        status: "Err",
        message: "Giỏ hàng trống hoặc không có sản phẩm được chọn",
      };
    }

    const selectedItems = cartResponse.data.items;
    let totalAmount = cartResponse.data.totalPrice;
    const orderDetailsData = [];

    for (const item of selectedItems) {
      const variant = item.variant;

      if (!variant) {
        await t.rollback();
        return {
          status: "Err",
          message: `Phiên bản sản phẩm không tồn tại`,
        };
      }
      if (variant.stock < item.quantity) {
        await t.rollback();
        return {
          status: "Err",
          message: `Sản phẩm không đủ số lượng trong kho`,
        };
      }

      const itemTotalPrice = variant.price * item.quantity;

      if (payment_method === "COD") {
        variant.stock -= item.quantity;
        variant.sold += item.quantity;
        await variant.save({ transaction: t });
      }

      orderDetailsData.push({
        product_variant_id: variant.id,
        quantity: item.quantity,
        price: variant.price,
        total_price: itemTotalPrice,
      });
    }

    let discountAmount = 0;
    if (voucher_code) {
      const voucherResponse = await voucherService.applyVoucher(
        voucher_code,
        userId
      );
      if (voucherResponse.status === "Err") {
        await t.rollback();
        return {
          status: "Err",
          message: voucherResponse.message,
        };
      }
      discountAmount = voucherResponse.data.discount_amount;
    }

    const finalTotal = totalAmount - discountAmount;

    const newOrder = await Order.create(
      {
        order_code: generateOrderCode(),
        user_id: userId,
        voucher_code: voucher_code || null,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalTotal,
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

    if (payment_method === "COD") {
      await CartItem.destroy({
        where: {
          cart_id: (await Cart.findOne({ where: { user_id: userId } })).id,
          is_selected: true,
        },
        transaction: t,
      });
    }

    await t.commit();
    return {
      status: "Ok",
      message: "Đơn hàng đã được tạo thành công",
      data: newOrder,
    };
  } catch (e) {
    await t.rollback();
    console.log(e);
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
    const whereConditions = {};

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
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      pages: Math.ceil(total / parseInt(limit)),
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

const getOrderByUser = async (userId, page = 1, limit = 12) => {
  try {
    const offset = (page - 1) * limit;
    const orders = await Order.findAll({
      where: { user_id: userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
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

    const total = await Order.count({ where: { user_id: userId } });
    return {
      status: "Ok",
      message: "Lấy danh sách đơn hàng của người dùng thành công",
      data: orders,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
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

const cancelOrder = async (userId, orderId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [
        {
          model: OrderDetail,
          as: "details",
          include: [
            {
              model: Product_Variant,
              as: "variant",
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
    if (order.order_status !== "pending") {
      return {
        status: "Err",
        message: "Chỉ có thể hủy đơn hàng ở trạng thái đang chờ xử lý",
      };
    }

    for (const detail of order.details) {
      const variant = detail.variant;
      if (variant) {
        variant.stock += detail.quantity;
        variant.sold -= detail.quantity;
        await variant.save();
      }
    }

    order.order_status = "cancelled";
    await order.save();
    return {
      status: "Ok",
      message: "Hủy đơn hàng thành công",
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
