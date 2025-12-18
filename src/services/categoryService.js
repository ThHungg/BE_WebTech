const generateSlug = require("../../utils/generateSlug");
const Category = require("../models/Category");
const Cate_Attribute_Link = require("../models/Cate_Attribute_Link");
const Cate_Brand_Link = require("../models/Cate_Brand_Link"); // ← THÊM DÒNG NÀY
const Attribute = require("../models/Attribute");
const { Op } = require("sequelize");
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

const updateCategory = async (categoryInfo) => {
  try {
    const { categoryId, name, parent_id, icon_emoji } = categoryInfo;
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }
    if (parent_id !== undefined) {
      if (parent_id) {
        const checkParent = await Category.findByPk(parent_id);
        if (!checkParent) {
          return {
            status: "Err",
            message: "Danh mục cha không tồn tại",
          };
        }
      }
      category.parent_id = parent_id;
    }
    if (icon_emoji !== undefined) {
      category.icon_emoji = icon_emoji;
    }
    await category.save();
    return {
      status: "Ok",
      message: "Cập nhật danh mục thành công",
      data: category,
    };
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
      include: [
        {
          model: Category,
          as: "children",
        },
      ],
      order: [["id", "ASC"]],
    });
    return {
      status: "Ok",
      message: "Lấy danh mục thành công",
      data: parentCategories,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
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

const getCategoryParent = async () => {
  try {
    const parentCategory = await Category.findAll({
      where: { parent_id: null },
      order: [["id", "ASC"]],
    });
    return {
      status: "Ok",
      message: "Lấy danh mục cha thành công",
      data: parentCategory,
    };
  } catch (e) {
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getAllChildren = async () => {
  try {
    const childrenCategories = await Category.findAll({
      where: { parent_id: { [Op.ne]: null } },
      order: [["id", "ASC"]],
    });
    return {
      status: "Ok",
      message: "Lấy danh mục con thành công",
      data: childrenCategories,
    };
  } catch (e) {}
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

    for (const child of children) {
      // ← THÊM: Xóa Cate_Brand_Link của danh mục con
      await Cate_Brand_Link.destroy({
        where: { category_id: child.id },
      });

      const childAttributeLinks = await Cate_Attribute_Link.findAll({
        where: { category_id: child.id },
      });
      for (const link of childAttributeLinks) {
        await link.destroy();
      }
      await child.destroy();
    }

    await Cate_Brand_Link.destroy({
      where: { category_id: categoryId },
    });

    const cateAttributeLinks = await Cate_Attribute_Link.findAll({
      where: { category_id: categoryId },
    });
    for (const link of cateAttributeLinks) {
      await link.destroy();
    }

    const allAttributes = await Attribute.findAll();
    for (const attribute of allAttributes) {
      const attributeLinksCount = await Cate_Attribute_Link.count({
        where: { attribute_id: attribute.id },
      });
      if (attributeLinksCount === 0) {
        await attribute.destroy();
      }
    }

    await category.destroy();

    return {
      status: "Ok",
      message: "Xóa danh mục thành công",
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
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  getCategoryChildrenById,
  getCategoryParent,
  getAllChildren,
  deleteCategory,
};
