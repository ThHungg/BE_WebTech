const generateSlug = require("../../utils/generateSlug");
const Category = require("../models/Category");
const createCategory = async (newCategory) => {
  try {
    const { name, parent_id, icon_emoji } = newCategory;
    console.log("New Category: ", newCategory);
    const checkName = await Category.findOne({ where: { name } });
    if (parent_id) {
      const checkParent = await Category.findByPk(parent_id);
      if (!checkParent) {
        return {
          status: "Err",
          message: "Danh mục cha không tồn tại",
        };
      }
    }
    if (checkName) {
      return {
        status: "Err",
        message: "Tên danh mục đã tồn tại",
      };
    }
    const slug = generateSlug(name);
    const category = await Category.create({
      name,
      parent_id,
      icon_emoji,
      slug,
    });
    return category;
  } catch (e) {
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getAllCategories = async () => {
  try {
    const parentCategories = await Category.findAll({
      where: { parent_id: null },
    });
    return {
      status: "Ok",
      message: "Lấy danh mục thành công",
      data: parentCategories,
    };
  } catch (e) {}
};

const getCategoryById = async (categoryId) => {
  try {
    const checkCategory = await Category.findByPk(categoryId);
    if (!checkCategory) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: Category,
          as: "children",
        },
      ],
    });
    return {
      status: "Ok",
      message: "Lấy danh mục thành công",
      data: category,
    };
  } catch (e) {
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getCategoryChildrenById = async (categoryId) => {
  try {
    const checkCategory = await Category.findByPk(categoryId);
    if (!checkCategory) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    const children = await Category.findAll({
      where: { parent_id: categoryId },
      order: [["id", "ASC"]],
    });
    return {
      status: "Ok",
      message: "Lấy danh mục thành công",
      data: children,
    };
  } catch (e) {
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    const children = await Category.findAll({
      where: { parent_id: categoryId },
    });
    await Promise.all(
      children.map(async (child) => {
        await child.destroy();
      })
    );
    await category.destroy();
    return {
      status: "Ok",
      message: "Xóa danh mục thành công",
    };
  } catch (e) {
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryChildrenById,
  deleteCategory,
};
