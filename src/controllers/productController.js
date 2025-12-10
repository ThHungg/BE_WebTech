const { deleteFile } = require("../../utils/deleteFile");
const productService = require("../services/productService");

const deleteProductFiles = (productImages, descriptionImages) => {
  if (Array.isArray(productImages) && productImages.length > 0) {
    productImages.forEach((imgPath) => {
      if (imgPath) {
        deleteFile(imgPath);
      }
    });
  }
  if (Array.isArray(descriptionImages) && descriptionImages.length > 0) {
    descriptionImages.forEach((imgPath) => {
      if (imgPath) {
        deleteFile(imgPath);
      }
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const newProduct = req.body;
    const productImages = req.files?.productImages;
    const descriptionImages = req.files?.descriptionImages;

    // console.log("uploadedFiles", uploadedFiles);

    const imagePaths = productImages.map((file) => file.path);
    newProduct.images = imagePaths;

    const imageDescPaths = descriptionImages.map((file) => file.path);
    newProduct.description_images = imageDescPaths;

    if (
      !newProduct.name ||
      !newProduct.total_stock ||
      !newProduct.brand_id ||
      !newProduct.category_id
    ) {
      deleteProductFiles(productImages, descriptionImages);
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (!productImages || productImages.length === 0) {
      deleteProductFiles([], descriptionImages);
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng upload ít nhất 1 ảnh sản phẩm",
      });
    }

    const response = await productService.createProduct(newProduct);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    // deleteFile(req.files);
    deleteProductFiles(productImages, descriptionImages);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID sản phẩm",
      });
    }
    const response = await productService.getProductDetail(productId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID sản phẩm",
      });
    }
    const response = await productService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  getProductDetail,
};
