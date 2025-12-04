const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Cate_Brand_Link = sequelize.define(
  "Cate_Brand_Link",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Cate_Brand_Link",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["brand_id", "category_id"],
      },
    ],
  }
);

module.exports = Cate_Brand_Link;
