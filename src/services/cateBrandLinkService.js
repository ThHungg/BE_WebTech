const { Cate_Brand_Link } = require("../models");
const { Brand } = require("../models");
const { Category } = require("../models");

const createCateBrandLink = async (newLink) => {
  try {
    const { categoryId, brandId } = newLink;
    const checkLink = await Cate_Brand_Link.findOne({
      where: { category_id: categoryId, brand_id: brandId },
    });
    if (checkLink) {
      return {
        status: "Err",
        message: "Liên kết danh mục - thương hiệu đã tồn tại",
      };
    }
    console.log("brand_id, category_id", brandId, categoryId);
    const link = await Cate_Brand_Link.create({
      brand_id: brandId,
      category_id: categoryId,
    });
    return {
      status: "Ok",
      message: "Liên kết danh mục - thương hiệu được tạo thành công",
      data: link,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getLinksByCategoryId = async (categoryId) => {
  try {
    console.log("categoryId", categoryId);
    const checkCategory = await Category.findByPk(categoryId);
    if (!checkCategory) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    const links = await Cate_Brand_Link.findAll({
      where: { category_id: categoryId },
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
    });
    console.log("links", links);
    return {
      status: "Ok",
      message: "Lấy liên kết danh mục - thương hiệu thành công",
      data: links,
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
  createCateBrandLink,
  getLinksByCategoryId,
};
