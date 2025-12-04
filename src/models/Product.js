const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cate_brand_link_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avg_rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
    },
    total_sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "Product",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Product;
