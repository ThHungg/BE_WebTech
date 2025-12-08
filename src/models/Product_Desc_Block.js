const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product_Desc_Block = sequelize.define(
  "Product_Desc_Block",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img_content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption_img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Product_Description_Block",
    timestamps: false,
  }
);

module.exports = Product_Desc_Block;
