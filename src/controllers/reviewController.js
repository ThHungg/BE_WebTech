const reviewService = require("../services/reviewService");

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rate, content } = req.body;
    if (userId === undefined) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng đăng nhập để đánh giá sản phẩm",
      });
    }
    const response = await reviewService.createReview({
      userId,
      product_id,
      rate,
      content,
    });
    res.status(201).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const response = await reviewService.getReviewsByProductId(productId);
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createReview,
  getReviewsByProductId,
};
