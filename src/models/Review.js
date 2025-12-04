const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Review = sequelize.define(
  "Review",
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Review",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Review;
