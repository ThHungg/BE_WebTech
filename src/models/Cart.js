const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Cart",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Cart;
