const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const News = sequelize.define(
  "News",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "News",
    timestamps: true,
    underscored: true,
  }
);

module.exports = News;
