const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Voucher_Brand_Link = sequelize.define(
  "Voucher_Brand_Link",
  {
    voucher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "Voucher_Brand_Link",
    timestamps: false,
  }
);

module.exports = Voucher_Brand_Link;
