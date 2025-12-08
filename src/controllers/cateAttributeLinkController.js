const cateAttributeLinkService = require("../services/cateAttributeLinkService");

const createCateAttributeLink = (req, res) => {
  try {
    const { categoryId, attributeIds } = req.body;
    if (
      !categoryId ||
      !attributeIds ||
      !Array.isArray(attributeIds) ||
      attributeIds.length === 0
    ) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const response = cateAttributeLinkService.createLinks({
      categoryId,
      attributeIds,
    });
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createCateAttributeLink,
};
