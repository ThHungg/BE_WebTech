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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    voucher_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Order",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;
