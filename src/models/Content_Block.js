const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ContentBlock = sequelize.define(
  "ContentBlock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mews_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img_content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption_img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Content_Block",
    timestamps: false,
    underscored: true,
  }
);

module.exports = ContentBlock;
