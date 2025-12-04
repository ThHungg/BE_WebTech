const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Cate_Attribute_Link = sequelize.define(
  "Cate_Attribute_Link",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Cate_Attribute_Link",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Cate_Attribute_Link;
