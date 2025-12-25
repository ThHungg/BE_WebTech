// const { Sequelize } = require("sequelize");
// const dotenv = require("dotenv");
// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: "mysql",
//   }
// );

// const connectDB = async () => {
//   try {
//     const res = await sequelize.authenticate();
//     console.log("Kết nối database thành công!");
//   } catch (e) {
//     console.error("Kết nối database thất bại:", e);
//   }
// };

// module.exports = { sequelize, connectDB };

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

class Database {
  constructor() {
    if (!Database.instance) {
      this.sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          dialect: "mysql",
          logging: false,
        }
      );
      Database.instance = this;
    }
    return Database.instance;
  }
}

// Khởi tạo instance duy nhất
const db = new Database();

// Trích xuất các biến để export y hệt như cũ
const sequelize = db.sequelize;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Kết nối database thành công! (Singleton Mode)");
  } catch (e) {
    console.error("Kết nối database thất bại:", e);
  }
};

// EXPORT Y HỆT CŨ: Không cần sửa các file khác
module.exports = { sequelize, connectDB };
