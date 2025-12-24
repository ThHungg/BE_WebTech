const Brand = require("../models/Brand");
const VoucherDetail = require("../models/Voucher_Detail");
const Voucher = require("../models/Voucher");
const Voucher_Constraint = require("../models/Voucher_Constraint");
const Voucher_Brand_Link = require("../models/Voucher_Brand_Link");
const Cart = require("../models/Cart");
const Cart_Item = require("../models/Cart_Item");
const Product = require("../models/Product");
const Product_Variant = require("../models/Product_Variant");
const { sequelize } = require("../config/db");

const createVoucher = async (newVoucher) => {
  const t = await sequelize.transaction();
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
    } = newVoucher;

    const checkCode = await VoucherDetail.findOne({ where: { code } });
    if (checkCode) {
      return {
        status: "Err",
        message: "Mã voucher đã tồn tại, vui lòng chọn mã khác",
      };
    }
    if (brandId) {
      const checkBrand = await Brand.findOne({ where: { id: brandId } });
      if (!checkBrand) {
        return {
          status: "Err",
          message: "Thương hiệu không tồn tại",
        };
      }
    }

    if (min_order_amount < 0) {
      return {
        status: "Err",
        message: "Giá trị đơn hàng tối thiểu không được âm",
      };
    }

    if (max_discount_amount !== undefined && max_discount_amount < 0) {
      return {
        status: "Err",
        message: "Giá trị giảm giá tối đa không được âm",
      };
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return {
        status: "Err",
        message: "Ngày bắt đầu phải trước ngày kết thúc",
      };
    }

    const createVoucher = await Voucher.create(
      {
        discount_type,
        discount_value,
        start_date,
        end_date,
        usage_limit,
        is_active: true,
      },
      { transaction: t }
    );

    await VoucherDetail.create(
      {
        code,
        voucher_id: createVoucher.id,
        is_active: true,
      },
      { transaction: t }
    );

    await Voucher_Constraint.create(
      {
        voucher_id: createVoucher.id,
        min_order_amount,
        max_discount_amount,
      },
      { transaction: t }
    );

    if (brandId) {
      await Voucher_Brand_Link.create(
        {
          voucher_id: createVoucher.id,
          brand_id: brandId,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return {
      status: "Ok",
      message: "Tạo voucher thành công",
      data: {
        voucher_id: createVoucher.id,
        code,
      },
    };
  } catch (e) {
    await t.rollback();
    console.error(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const updateVoucher = async (id, updatedFields) => {
  const t = await sequelize.transaction();
  try {
    const voucher = await Voucher.findByPk(id, {
      include: [{ model: VoucherDetail, as: "Voucher_Details" }],
    });
    if (!voucher) {
      return {
        status: "Err",
        message: "Voucher không tồn tại",
      };
    }

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
    } = updatedFields;

    if (code && code !== voucher.Voucher_Details.code) {
      const checkCode = await VoucherDetail.findOne({ where: { code } });
      if (checkCode) {
        return {
          status: "Err",
          message: "Mã voucher đã tồn tại, vui lòng chọn mã khác",
        };
      }
    }

    await voucher.update(
      {
        discount_type,
        discount_value,
        start_date,
        end_date,
        usage_limit,
        is_active,
      },
      { transaction: t }
    );

    await voucher.Voucher_Details[0].update(
      {
        code,
        is_active,
      },
      { transaction: t }
    );

    await Voucher_Constraint.update(
      {
        min_order_amount,
        max_discount_amount,
      },
      { where: { voucher_id: id }, transaction: t }
    );

    if (brandId) {
      const checkBrand = await Brand.findOne({ where: { id: brandId } });
      if (!checkBrand) {
        return {
          status: "Err",
          message: "Thương hiệu không tồn tại",
        };
      }

      await Voucher_Brand_Link.upsert(
        {
          voucher_id: id,
          brand_id: brandId,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return {
      status: "Ok",
      message: "Cập nhật voucher thành công",
      data: {
        voucher_id: voucher.id,
        code,
      },
    };
  } catch (e) {
    await t.rollback();
    console.error(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getAllVouchers = async () => {
  try {
    const vouchers = await Voucher.findAll({
      include: [
        {
          model: VoucherDetail,
          as: "Voucher_Details",
        },
        {
          model: Voucher_Constraint,
          as: "Voucher_Constraint",
        },
        {
          model: Brand,
          as: "Brands",
          through: { attributes: {} }, // Loại bỏ thông tin bảng trung gian
        },
      ],
    });

    return {
      status: "Ok",
      message: "Lấy danh sách voucher thành công",
      data: vouchers,
    };
  } catch (e) {
    console.error(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getVoucherById = async (id) => {
  try {
    const voucher = await Voucher.findByPk(id, {
      include: [
        {
          model: VoucherDetail,
          as: "Voucher_Details",
        },
        {
          model: Voucher_Constraint,
          as: "Voucher_Constraint",
        },
        {
          model: Brand,
          as: "Brands",
          through: { attributes: {} },
        },
      ],
    });

    if (!voucher) {
      return {
        status: "Err",
        message: "Voucher không tồn tại",
      };
    }

    return {
      status: "Ok",
      message: "Lấy thông tin voucher thành công",
      data: voucher,
    };
  } catch (e) {
    console.error(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const applyVoucher = async (code, userId) => {
  try {
    // Lấy giỏ hàng và các item được chọn
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
                  attributes: ["id", "brand_id"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        status: "Err",
        message: "Giỏ hàng trống hoặc không có sản phẩm được chọn",
      };
    }

    const voucherDetail = await VoucherDetail.findOne({
      where: { code, is_active: true },
      include: [
        {
          model: Voucher,
          where: { is_active: true },
          include: [
            { model: Voucher_Constraint },
            { model: Brand, as: "Brands" },
          ],
        },
      ],
    });

    if (!voucherDetail || !voucherDetail.Voucher) {
      return {
        status: "Err",
        message: "Mã voucher không tồn tại hoặc đã bị vô hiệu hóa",
      };
    }

    const voucher = voucherDetail.Voucher;
    const now = new Date();

    if (now < new Date(voucher.start_date)) {
      return {
        status: "Err",
        message: "Voucher chưa đến hạn sử dụng",
      };
    }

    if (now > new Date(voucher.end_date)) {
      return {
        status: "Err",
        message: "Voucher đã hết hạn sử dụng",
      };
    }

    if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
      return {
        status: "Err",
        message: "Voucher đã đạt giới hạn sử dụng",
      };
    }

    let totalOrderAmount = 0;
    let applicableAmount = 0;
    const brandIds = voucher.Brands.map((brand) => brand.id);

    cart.items.forEach((item) => {
      const itemTotal = item.variant.price * item.quantity;
      totalOrderAmount += itemTotal;

      if (brandIds.length > 0) {
        if (brandIds.includes(item.variant.product.brand_id)) {
          applicableAmount += itemTotal;
        }
      } else {
        applicableAmount += itemTotal;
      }
    });

    if (brandIds.length > 0 && applicableAmount === 0) {
      return {
        status: "Err",
        message: "Voucher không áp dụng cho sản phẩm trong giỏ hàng",
      };
    }

    const constraint = voucher.Voucher_Constraint;
    if (constraint && constraint.min_order_amount) {
      if (totalOrderAmount < constraint.min_order_amount) {
        return {
          status: "Err",
          message: `Đơn hàng tối thiểu phải đạt ${constraint.min_order_amount} để áp dụng voucher`,
        };
      }
    }

    let discountAmount = 0;
    if (voucher.discount_type === "percentage") {
      discountAmount = (applicableAmount * voucher.discount_value) / 100;
      if (
        constraint &&
        constraint.max_discount_amount > 0 &&
        discountAmount > constraint.max_discount_amount
      ) {
        discountAmount = constraint.max_discount_amount;
      }
    } else if (voucher.discount_type === "fixed") {
      discountAmount = voucher.discount_value;
      if (
        constraint &&
        constraint.max_discount_amount > 0 &&
        discountAmount > constraint.max_discount_amount
      ) {
        discountAmount = constraint.max_discount_amount;
      }
    }

    if (discountAmount > applicableAmount) {
      discountAmount = applicableAmount;
    }

    return {
      status: "Ok",
      message: "Áp dụng voucher thành công",
      data: {
        code,
        discount_amount: discountAmount,
        oldPrice: totalOrderAmount,
        newPrice: totalOrderAmount - discountAmount,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống khi áp dụng voucher",
    };
  }
};

const deleteVoucher = async (id) => {
  const t = await sequelize.transaction();
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return {
        status: "Err",
        message: "Voucher không tồn tại",
      };
    }

    await Voucher_Brand_Link.destroy(
      { where: { voucher_id: id } },
      { transaction: t }
    );

    await Voucher_Constraint.destroy(
      { where: { voucher_id: id } },
      { transaction: t }
    );

    await VoucherDetail.destroy(
      { where: { voucher_id: id } },
      { transaction: t }
    );

    await Voucher.destroy({ where: { id } }, { transaction: t });

    await t.commit();
    return {
      status: "Ok",
      message: "Xóa voucher thành công",
    };
  } catch (e) {
    await t.rollback();
    console.error(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  applyVoucher,
  deleteVoucher,
};
