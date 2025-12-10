const cateAttributeLinkService = require("../services/cateAttributeLinkService");

const createCateAttributeLink = async (req, res) => {
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

    const response = await cateAttributeLinkService.createCateAttributeLink({
      categoryId,
      attributeIds,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getLinksByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp categoryId",
      });
    }

    const response = await cateAttributeLinkService.getLinksByCategoryId(
      categoryId
    );
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createCateAttributeLink,
  getLinksByCategoryId,
};
