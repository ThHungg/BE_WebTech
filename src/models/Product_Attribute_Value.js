const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product_Attribute_Value = sequelize.define(
  "ProductAttributeValue",
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Product_Attribute_Value",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Product_Attribute_Value;
