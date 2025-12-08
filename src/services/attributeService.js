const Attribute = require("../models/Attribute");
const Unit = require("../models/Unit");

const createAttributes = async (newAttributes) => {
  try {
    const listUnit = await Unit.findAll({ attributes: ["id"] });
    const checkUnit = listUnit.map((unit) => unit.id);

    for (let i = 0; i < newAttributes.length; i++) {
      const { unit_id } = newAttributes[i];
      if (unit_id && !checkUnit.includes(unit_id)) {
        return {
          status: "Err",
          message: `Đơn vị với id ${unit_id} không tồn tại`,
        };
      }
    }

    const createdAttributes = await Attribute.bulkCreate(newAttributes);
    return {
      status: "Ok",
      message: "Tạo thuộc tính thành công",
      data: createdAttributes,
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
  createAttributes,
};
