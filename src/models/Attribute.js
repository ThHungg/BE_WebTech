const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Attribute = sequelize.define(
  "Attribute",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "Attribute",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Attribute;
