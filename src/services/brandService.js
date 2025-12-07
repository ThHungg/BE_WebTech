const { deleteFile } = require("../../utils/deleteFile.js");
const generateSlug = require("../../utils/generateSlug.js");
const Brand = require("../models/Brand.js");

const createBrand = async (newBrand) => {
  try {
    const { name, image } = newBrand;
    // console.log("url img", `/Img/brands/${image}`);
    const checkName = await Brand.findOne({ where: { name } });
    if (checkName) {
      deleteFile(`Img/brands/${image}`);
      return { status: "Err", message: "Tên thương hiệu đã tồn tại" };
    }
    const slug = generateSlug(name);
    const createBrand = await Brand.create({
      name,
      slug,
      logo: `/Img/brands/${image}`,
    });

    return {
      status: "Ok",
      message: "Thương hiệu được tạo thành công",
      data: createBrand,
    };
  } catch (e) {
    deleteFile(`Img/brands/${image}`);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const updateBrand = async (brandInfo) => {
  try {
    const { brandId, name, image } = brandInfo;
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      if (image) {
        deleteFile(`Img/brands/${image}`);
      }
      return {
        status: "Err",
        message: "Thương hiệu không tồn tại",
      };
    }
    if (name) {
      brand.name = name;
      brand.slug = generateSlug(name);
    }
    if (image) {
      brand.logo = `/Img/brands/${image}`;
    }
    await brand.save();
    return {
      status: "Ok",
      message: "Cập nhật thương hiệu thành công",
      data: brand,
    };
  } catch (e) {
    if (image) {
      deleteFile(`Img/brands/${image}`);
    }
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getAllBrands = async () => {
  try {
    const brands = await Brand.findAll();
    return {
      status: "Ok",
      data: brands,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const deleteBrand = async (brandId) => {
  try {
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return {
        status: "Err",
        message: "Thương hiệu không tồn tại",
      };
    }
    await brand.destroy();
    deleteFile(brand.dataValues.logo);
    return {
      status: "Ok",
      message: "Xóa thương hiệu thành công",
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
  createBrand,
  getAllBrands,
  deleteBrand,
  updateBrand,
};
