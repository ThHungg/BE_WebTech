const { Product } = require("../models");
const Review = require("../models/Review");

const createReview = async (newReview) => {
  try {
    const { userId, product_id, rate, content } = newReview;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return {
        status: "Err",
        message: "Sản phẩm không tồn tại",
      };
    }

    const checkReview = await Review.findOne({
      where: { user_id: userId, product_id: product_id },
    });
    if (checkReview) {
      return {
        status: "Err",
        message: "Bạn đã đánh giá sản phẩm này rồi",
      };
    }
    const review = await Review.create({
      user_id: userId,
      product_id: product_id,
      rate: rate,
      content: content,
    });

    const stats = await Review.findAll({
      where: { product_id: product_id },
      attributes: ["rate"],
    });

    const totalRates = stats.reduce((sum, r) => sum + r.rate, 0);
    const avgRate =
      stats.length > 0 ? (totalRates / stats.length).toFixed(1) : 0;
    const finalAvg = parseFloat(avgRate);

    await Product.update(
      { avg_rating: finalAvg },
      { where: { id: product_id } }
    );

    return {
      status: "Ok",
      message: "Đánh giá sản phẩm thành công",
      review: review,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getReviewsByProductId = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: productId },
    });
    return {
      status: "Ok",
      message: "Lấy đánh giá sản phẩm thành công",
      data: reviews,
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
  createReview,
  getReviewsByProductId,
};
