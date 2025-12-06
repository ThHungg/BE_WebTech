const userSerivce = require("../services/userService");

const register = async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const response = await userSerivce.register({
      username,
      phone,
      email,
      password,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const response = await userSerivce.login({ email, password });
    const { refresh_token, ...newReponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    return res.status(200).json(newReponse);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, phone, email, role } = req.body;
    console.log("Request User: ", req.user);
    const id = req.user.id;
    if (!id) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập ID người dùng",
      });
    }
    if (!username && !phone && !email && !role) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập thông tin cần cập nhật",
      });
    }
    const reponse = await userSerivce.updateUser({
      id: req.user.id,
      username,
      phone,
      email,
      role,
    });
    return res.status(200).json(reponse);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = req.user.id;
    if (!id) {
      return res.status(400).json({
        status: "Err",
        message: "Không tìm thấy người dùng",
      });
    }
    const response = await userSerivce.getUserById(id);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập ID người dùng",
      });
    }
    const response = await userSerivce.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

//Address
const addAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { city, district, ward, street_address, is_default } = req.body;
    if (!city || !district || !ward || !street_address) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin địa chỉ",
      });
    }
    if (!user_id) {
      return res.status(400).json({
        status: "Err",
        message: "Không tìm thấy người dùng",
      });
    }

    const response = await userSerivce.addAddress(user_id, {
      city,
      district,
      ward,
      street_address,
      is_default,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    console.log(addressId);
    if (!addressId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập ID địa chỉ",
      });
    }
    const { city, district, ward, street_address, is_default } = req.body;
    if (
      !city &&
      !district &&
      !ward &&
      !street_address &&
      is_default === undefined
    ) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập thông tin cần cập nhật",
      });
    }
    const response = await userSerivce.updateAddress(addressId, {
      city,
      district,
      ward,
      street_address,
      is_default,
    });
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const response = await userSerivce.getAllUser(offset, limit);

    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};
module.exports = {
  register,
  login,
  updateUser,
  getUserById,
  addAddress,
  updateAddress,
  getAllUser,
  deleteUser,
};
