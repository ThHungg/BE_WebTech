const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "Order_Detail",
    timestamps: false,
    underscored: true,
  }
);

module.exports = OrderDetail;
