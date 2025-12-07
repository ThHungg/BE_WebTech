const cateBrandLinkService = require("../services/cateBrandLinkService");

const createCateBrandLink = async (req, res) => {
  try {
    const { categoryId, brandId } = req.body;
    console.log("Req Body: ", req.body);
    if (!categoryId || !brandId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }
    const response = await cateBrandLinkService.createCateBrandLink({
      categoryId,
      brandId,
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
        message: "Vui lòng nhập ID danh mục",
      });
    }
    const response = await cateBrandLinkService.getLinksByCategoryId(
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
  createCateBrandLink,
  getLinksByCategoryId,
};
