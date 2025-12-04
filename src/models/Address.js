const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Address = sequelize.define(
  "Address",
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
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Address",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Address;
