const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Unit = sequelize.define(
  "Unit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Unit",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Unit;
