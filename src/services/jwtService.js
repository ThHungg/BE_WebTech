const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const Access_Token = process.env.Access_Token;
const Refresh_Token = process.env.Refresh_Token;

const generateAccessToken = (payload) => {
  const accessToken = jwt.sign({ ...payload }, Access_Token, {
    expiresIn: "1d",
  });
  return accessToken;
};

const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign({ ...payload }, Refresh_Token, {
    expiresIn: "7d",
  });
  return refreshToken;
};

const refreshToken = async (token) => {
  try {
    if (!token) {
      return {
        status: "Err",
        message: "Token không được để trống",
      };
    }
    const decoded = jwt.verify(token, Refresh_Token);
    const accessToken = genneralAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    return {
      status: "Ok",
      message: "Thành công",
      accessToken: accessToken,
    };
  } catch (e) {
    return {
      status: "Err",
      message: "Token không hợp lệ",
    };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
};
