const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
  try {
    const { name, parent_id, icon_emoji } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập tên danh mục",
      });
    }
    const response = await categoryService.createCategory({
      name,
      parent_id,
      icon_emoji,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID danh mục",
      });
    }
    const { name, parent_id, icon_emoji } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng nhập tên danh mục",
      });
    }
    const response = await categoryService.updateCategory({
      categoryId,
      name,
      parent_id,
      icon_emoji,
    });
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const response = await categoryService.getAllCategories();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID danh mục",
      });
    }
    const response = await categoryService.getCategoryById(categoryId);
    return res.status(200).json(response);
  } catch (e) {}
};

const getCategoryChildrenById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID danh mục",
      });
    }
    const response = await categoryService.getCategoryChildrenById(categoryId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getCategoryParent = async (req, res) => {
  try {
    const response = await categoryService.getCategoryParent();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const getAllChildren = async (req, res) => {
  try {
    const response = await categoryService.getAllChildren();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({
        status: "Err",
        message: "Vui lòng cung cấp ID danh mục",
      });
    }
    const category = await categoryService.deleteCategory(categoryId);
    return res.status(200).json(category);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "Err", message: "Lỗi hệ thống vui lòng thử lại sau" });
  }
};
module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  getCategoryChildrenById,
  getCategoryParent,
  getAllChildren,
  deleteCategory,
};
