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
    data_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    input_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Attribute",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Attribute;
