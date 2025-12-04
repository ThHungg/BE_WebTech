const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
);

const connectDB = async () => {
  try {
    const res = await sequelize.authenticate();
    console.log("Kết nối database thành công!");
  } catch (e) {
    console.error("Kết nối database thất bại:", e);
  }
};

module.exports = { sequelize, connectDB };
