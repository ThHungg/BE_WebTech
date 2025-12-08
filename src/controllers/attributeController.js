const attributeService = require("../services/attributeService");

const createAttributes = async (req, res) => {
  try {
    const { attributes } = req.body;
    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    for (const attribute of attributes) {
      if (!attribute.name) {
        return res.status(400).json({
          status: "Err",
          message: "Vui lòng nhập đầy đủ thông tin của mỗi thuộc tính",
        });
      }
    }
    const response = await attributeService.createAttributes(attributes);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createAttributes,
};
