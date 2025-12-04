const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const VoucherDetail = sequelize.define(
  "Voucher_Detail",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    voucher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "Voucher_Detail",
    timestamps: false,
    underscored: true,
  }
);

module.exports = VoucherDetail;
