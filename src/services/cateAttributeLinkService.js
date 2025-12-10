const { Cate_Attribute_Link } = require("../models");
const Attribute = require("../models/Attribute.js");
const createCateAttributeLink = async ({ categoryId, attributeIds }) => {
  try {
    const linkData = attributeIds.map((attributeId) => ({
      category_id: categoryId,
      attribute_id: attributeId,
    }));
    const createdLinks = await Cate_Attribute_Link.bulkCreate(linkData);
    return {
      status: "Ok",
      message: "Tạo liên kết thành công",
      data: createdLinks,
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
    const links = await Cate_Attribute_Link.findAll({
      where: { category_id: categoryId },
    });
    const result = links.map((link) => ({ attribute_id: link.attribute_id }));
    for (let item of result) {
      const attribute = await Attribute.findByPk(item.attribute_id);
      item.attribute_name = attribute.name;
    }
    return {
      status: "Ok",
      message: "Lấy liên kết thành công",
      data: result,
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
  createCateAttributeLink,
  getLinksByCategoryId,
};
