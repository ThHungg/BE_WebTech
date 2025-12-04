const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Voucher = sequelize.define(
  "Voucher",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    discount_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    id_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "Voucher",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Voucher;
