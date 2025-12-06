const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.ENUM("Admin", "User", "Employee"),
      allowNull: false,
      unique: true,
    },
  },
  { 
    tableName: "Role",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Role;
