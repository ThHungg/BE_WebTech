const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ImgProduct = sequelize.define(
  "Img_Product",
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
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Img_Product",
    timestamps: false,
    underscored: true,
  }
);

module.exports = ImgProduct;
