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
      type: DataTypes.ENUM("fixed", "percentage"),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    used_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
   
  },
  {
    tableName: "Voucher",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Voucher;
