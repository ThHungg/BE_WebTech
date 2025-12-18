const { Role } = require("../models");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("./jwtService");
const Address = require("../models/Address");
const { Op } = require("sequelize");
const register = async (newUser) => {
  try {
    const checkEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const checkPhone = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    const checkPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
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
    if (!checkPass.test(newUser.password)) {
      return {
        status: "Err",
        message:
          "Mật khẩu tối thiểu 6 ký tự, bao gồm ít nhất một chữ cái và một số",
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

    if (!user) {
      return {
        status: "Err",
        message: "Email hoặc mật khẩu không đúng",
      };
    }

    const role = await Role.findByPk(user.role_id, {
      attributes: ["id", "role_name"],
    });

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
      data: {
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
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
    console.log("dataUpdate", dataUpdate);
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

const updateUserById = async (dataUpdate) => {
  try {
    const { id, username, phone, email, role, is_active } = dataUpdate;

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
    if (email) user.email = email;
    if (is_active !== undefined) user.is_active = is_active;

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

const getAllUser = async (offset, limit, filters = {}) => {
  try {
    const { search = "", is_active, role } = filters;

    // Xây dựng điều kiện WHERE
    const whereConditions = {};

    // Lọc theo trạng thái hoạt động
    if (is_active !== undefined) {
      whereConditions.is_active = is_active === "true" || is_active === true;
    }

    // Tìm kiếm theo username, email, phone
    if (search) {
      const { Op } = require("sequelize");
      whereConditions[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Lọc theo role
    const includeOptions = [
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
    ];

    // Thêm điều kiện lọc role nếu có
    if (role) {
      includeOptions[0].where = { role_name: role };
      includeOptions[0].required = true; // INNER JOIN để chỉ lấy user có role phù hợp
    }

    const users = await User.findAll({
      where: whereConditions,
      offset: offset,
      limit: limit,
      attributes: {
        exclude: ["password"],
      },
      include: includeOptions,
    });

    // Lấy tổng số user phù hợp với filter
    const total = await User.count({
      where: whereConditions,
      include: includeOptions,
    });

    return {
      status: "Ok",
      message: "Lấy danh sách người dùng thành công",
      data: users,
      pagination: {
        offset,
        limit,
        total,
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
  updateUserById,
  getUserById,
  addAddress,
  updateAddress,
  getAllUser,
  deleteUser,
};
