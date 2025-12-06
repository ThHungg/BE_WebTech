const { Role } = require("../models");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("./jwtService");
const Address = require("../models/Address");
const register = async (newUser) => {
  try {
    const checkEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const checkPhone = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    if (!checkPhone.test(newUser.phone)) {
      return {
        status: "Err",
        message: "Vui lòng nhập số điện thoại đúng định dạng",
      };
    }
    if (!checkEmail.test(newUser.email)) {
      return {
        status: "Err",
        message: "Vui lòng nhập email đúng định dạng",
      };
    }
    const user = await User.findOne({ where: { email: newUser.email } });

    if (user) {
      return {
        status: "Err",
        message: "Email đã tồn tại",
      };
    }
    const hash = bcrypt.hashSync(newUser.password, 10);

    const role = await Role.findOne({
      where: { role_name: "User" },
      attributes: ["id", "role_name"],
    });
    console.log("Role User: ", role.id);
    const createdUser = await User.create({
      username: newUser.username,
      phone: newUser.phone,
      email: newUser.email,
      password: hash,
      role_id: role.id,
    });
    return { status: "Ok", message: "Đăng ký thành công", data: createdUser };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const login = async (userData) => {
  try {
    const user = await User.findOne({ where: { email: userData.email } });
    console.log("User Login: ", user.role_id);
    const role = await Role.findByPk(user.role_id, {
      attributes: ["id", "role_name"],
    });
    console.log("userData", userData);
    if (!user) {
      return {
        status: "Err",
        message: "Email hoặc mật khẩu không đúng",
      };
    }
    const isPasswordValid = bcrypt.compareSync(
      userData.password,
      user.password
    );
    if (!isPasswordValid) {
      return {
        status: "Err",
        message: "Email hoặc mật khẩu không đúng",
      };
    }

    const access_token = await generateAccessToken({
      id: user.id,
      role: role.role_name,
    });

    const refresh_token = await generateRefreshToken({
      id: user.id,
      role: role.role_name,
    });

    return {
      status: "Ok",
      message: "Đăng nhập thành công",
      data: user,
      access_token,
      refresh_token,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const updateUser = async (dataUpdate) => {
  try {
    const { id, username, phone, email, role } = dataUpdate;
    console.log("Update User ID: ", role);
    const user = await User.findByPk(id);
    if (!user) {
      return {
        status: "Err",
        message: "Người dùng không tồn tại",
      };
    }

    if (role) {
      const roleData = await Role.findByPk(role, {
        attributes: ["id", "role_name"],
      });
      if (roleData && user.role_id !== roleData.id) {
        user.role_id = roleData.id;
      }
    }
    if (username) user.username = username;
    if (phone) user.phone = phone;

    await user.save();
    return {
      status: "Ok",
      message: "Cập nhật thông tin thành công",
      data: user,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      // include: [
      //   {
      //     model: Role,
      //     as: "role",
      //     attributes: ["id", "role_name"],
      //   },
      // ],
    });
    const address = await Address.findAll({
      where: { user_id: id },
      order: [["is_default", "DESC"]],
    });
    if (!user) {
      return {
        status: "Err",
        message: "Người dùng không tồn tại",
      };
    }
    return {
      status: "Ok",
      message: "Lấy thông tin người dùng thành công",
      data: user,
      address,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getAllUser = async (offset, limit) => {
  try {
    const user = await User.findAll({
      offset: offset,
      limit: limit,
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_name"],
        },
        {
          model: Address,
          as: "addresses",
          attributes: [
            "id",
            "city",
            "district",
            "ward",
            "street_address",
            "is_default",
          ],
          order: [["is_default", "DESC"]],
        },
      ],
    });
    return {
      status: "Ok",
      message: "Lấy danh sách người dùng thành công",
      data: user,
      pagination: {
        offset,
        limit,
        total: await User.count(),
      },
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        status: "Err",
        message: "Người dùng không tồn tại",
      };
    }
    await user.destroy();
    return {
      status: "Ok",
      message: "Xóa người dùng thành công",
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

//Address
const addAddress = async (user_id, address) => {
  try {
    const { city, district, ward, street_address, is_default } = address;
    console.log(address);
    const listAddress = await Address.findAll({ where: { user_id: user_id } });

    if (is_default) {
      for (const addr of listAddress) {
        if (addr.is_default) {
          addr.is_default = false;
          await addr.save();
        }
      }
    }
    const newAddress = await Address.create({
      user_id: user_id,
      city,
      district,
      ward,
      street_address,
      is_default,
    });
    return {
      status: "Ok",
      message: "Thêm địa chỉ thành công",
      data: newAddress,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const updateAddress = async (addressId, address) => {
  try {
    const { city, district, ward, street_address, is_default } = address;
    console.log(address);
    const addr = await Address.findByPk(addressId);
    if (!addr) {
      return {
        status: "Err",
        message: "Địa chỉ không tồn tại",
      };
    }
    if (is_default) {
      const listAddress = await Address.findAll({
        where: { user_id: addr.user_id },
      });
      for (const a of listAddress) {
        if (a.is_default) {
          a.is_default = false;
          await a.save();
        }
      }
    }
    if (city) addr.city = city;
    if (district) addr.district = district;
    if (ward) addr.ward = ward;
    if (street_address) addr.street_address = street_address;
    if (is_default !== undefined) addr.is_default = is_default;
    await addr.save();
    return {
      status: "Ok",
      message: "Cập nhật địa chỉ thành công",
      data: addr,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
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
