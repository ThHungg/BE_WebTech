const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    voucher_detail_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    recipient_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order_status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "Order",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;
