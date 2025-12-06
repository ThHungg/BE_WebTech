const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const Access_Token = process.env.Access_Token;

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Không có token" });
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, Access_Token, function (err, user) {
      if (err) {
        return res.status(403).json({ message: "Token không hợp lệ" });
      }
      req.user = user;
      next();
    });
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const roleMddleware = (allowedRole) => {
  console.log("Allowed Roles: ", allowedRole);
  return (req, res, next) => {
    const userRole = req.user.role;
    console.log("User Role: ", userRole);
    if (allowedRole.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
  };
};

module.exports = { authMiddleware, roleMddleware };
