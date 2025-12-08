const Unit = require("../models/Unit");

const createUnit = async (symbol) => {
  try {
    const checkUnit = await Unit.findOne({ where: { symbol } });
    if (checkUnit) {
      return {
        status: "Err",
        message: "Đơn vị đã tồn tại",
      };
    }
    const unit = await Unit.create({ symbol });
    return {
      status: "Ok",
      message: "Đơn vị được tạo thành công",
      data: unit,
    };
  } catch (e) {
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

module.exports = {
  createUnit,
};
