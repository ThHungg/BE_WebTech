const { Cate_Attribute_Link } = require("../models");

const createLinks = async ({ categoryId, attributeIds }) => {
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
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

module.exports = {
  createLinks,
};
