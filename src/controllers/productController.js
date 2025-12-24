const { deleteFile } = require("../../utils/deleteFile");
const productService = require("../services/productService");

const deleteProductFiles = (productImages) => {
  if (Array.isArray(productImages) && productImages.length > 0) {
    productImages.forEach((imgPath) => {
      if (imgPath) {
        deleteFile(`public/Img/products/${imgPath}`);
      }
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const newProduct = req.body;
    const productImages = req.files?.productImages;

    const imagePaths = productImages.map((file) => file.filename);
    newProduct.images = imagePaths;
    console.log(newProduct);
    if (
      !newProduct.name ||
      // !newProduct.total_stock ||
      !newProduct.brand_id ||
      !newProduct.category_id
    ) {
      deleteProductFiles(imagePaths);
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (!productImages || productImages.length === 0) {
      deleteProductFiles(imagePaths);
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
    deleteProductFiles(imagePaths);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedProduct = req.body;
    const productImages = req.files?.productImages;

    const imagePaths = productImages
      ? productImages.map((file) => file.path)
      : [];
    updatedProduct.images = imagePaths;

    const response = await productService.updateProduct({
      productId,
      updatedProduct,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    deleteProductFiles(productImages);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;
    console.log(productId, status);
    if (!productId || status === undefined) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }
    const response = await productService.updateProductStatus(
      productId,
      status
    );
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId);
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

const getAllProducts = async (req, res) => {
  try {
    const response = await productService.getAllProducts();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp slug sản phẩm",
      });
    }
    const response = await productService.getProductBySlug(slug);
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
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getProductDetail,
  getAllProducts,
  getProductBySlug,
};
