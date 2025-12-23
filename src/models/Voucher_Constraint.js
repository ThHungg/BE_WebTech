const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Voucher_Constraint = sequelize.define(
  "Voucher_Constraint",
  {
    voucher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    max_discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "Voucher_Constraint",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Voucher_Constraint;
