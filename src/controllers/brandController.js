const { deleteFile } = require("../../utils/deleteFile");
const brandService = require("../services/brandService");

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req?.file?.filename;

    if (!name || !image) {
      if (image) {
        deleteFile(`public/Img/brands/${image}`);
      }
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }
    const response = await brandService.createBrand({ name, image });
    return res.status(200).json(response);
  } catch (e) {
    if (image) {
      deleteFile(`public/Img/brands/${image}`);
    }
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateBrand = async (req, res) => {
  let image;
  try {
    const { brandId } = req.params;
    const { name, is_active } = req.body;

    image = req.file?.filename;
    console.log(image);
    if (!brandId) {
      if (image) {
        deleteFile(`public/Img/brands/${image}`);
      }
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập ID thương hiệu  ",
      });
    }
    const response = await brandService.updateBrand({
      brandId,
      name,
      is_active,
      image,
    });
    return res.status(200).json(response);
  } catch (e) {
    if (image) {
      deleteFile(`public/Img/brands/${image}`);
    }
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const response = await brandService.getAllBrands();
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    if (!brandId) {
      return res.status(400).json({
        status: "Err",
        message: "Thiếu ID thương hiệu",
      });
    }
    const response = await brandService.deleteBrand(brandId);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};
module.exports = {
  createBrand,
  getAllBrands,
  deleteBrand,
  updateBrand,
};
