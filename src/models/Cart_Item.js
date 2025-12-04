const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CartItem = sequelize.define(
  "Cart_Item",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "Cart_Item",
    timestamps: false,
    underscored: true,
  }
);

module.exports = CartItem;
