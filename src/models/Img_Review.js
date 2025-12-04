const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ImgReview = sequelize.define(
  "ImgReview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Img_Review",
    timestamps: false,
    underscored: true,
  }
);

module.exports = ImgReview;
