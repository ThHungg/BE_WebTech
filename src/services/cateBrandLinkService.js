const { Cate_Brand_Link } = require("../models");
const { Brand } = require("../models");
const { Category } = require("../models");

const createCateBrandLink = async (newLink) => {
  try {
    const { categoryId, brandId } = newLink;
    const checkCategory = await Category.findByPk(categoryId);
    if (!checkCategory) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    const checkBrand = await Brand.findByPk(brandId);
    if (!checkBrand) {
      return {
        status: "Err",
        message: "Thương hiệu không tồn tại",
      };
    }
    const checkLink = await Cate_Brand_Link.findOne({
      where: { category_id: categoryId, brand_id: brandId },
    });
    if (checkLink) {
      return {
        status: "Err",
        message: "Liên kết danh mục - thương hiệu đã tồn tại",
      };
    }
    console.log("brand_id, category_id", brandId, categoryId);
    const link = await Cate_Brand_Link.create({
      brand_id: brandId,
      category_id: categoryId,
    });
    return {
      status: "Ok",
      message: "Liên kết danh mục - thương hiệu được tạo thành công",
      data: link,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getLinksByCategoryId = async (categoryId) => {
  try {
    console.log("categoryId", categoryId);
    const checkCategory = await Category.findByPk(categoryId);
    if (!checkCategory) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }
    const links = await Cate_Brand_Link.findAll({
      where: { category_id: categoryId },
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
    });
    const result = links.map((link) => link.brand);
    return {
      status: "Ok",
      message: "Lấy liên kết danh mục - thương hiệu thành công",
      data: result,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getLinksByBrandId = async (brandId) => {
  try {
    const checkBrand = await Brand.findByPk(brandId);
    if (!checkBrand) {
      return {
        status: "Err",
        message: "Thương hiệu không tồn tại",
      };
    }

    const links = await Cate_Brand_Link.findAll({
      where: { brand_id: brandId },
      include: [
        { model: Brand, as: "brand" },
        {
          model: Category,
          as: "category",
          include: [{ model: Category, as: "parent" }],
        },
      ],
      subQuery: false,
      raw: false,
    });

    const parentMap = {};

    links.forEach((link) => {
      const category = link.category.dataValues;
      const parent = category.parent ? category.parent.dataValues : null;

      if (parent) {
        if (!parentMap[parent.id]) {
          parentMap[parent.id] = {
            ...parent,
            children: [],
          };
        }
        parentMap[parent.id].children.push(category);
      } else {
        if (!parentMap[category.id]) {
          parentMap[category.id] = {
            ...category,
            children: [],
          };
        }
      }
    });

    const result = {
      brand: checkBrand,
      parents: Object.values(parentMap),
    };

    return {
      status: "Ok",
      message: "Lấy liên kết danh mục - thương hiệu thành công",
      data: result,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const getAllLinks = async () => {
  try {
    const links = await Cate_Brand_Link.findAll({
      include: [
        { model: Brand, as: "brand" },
        {
          model: Category,
          as: "category",
          include: [{ model: Category, as: "children" }],
        },
      ],
      subQuery: false,
      raw: false,
    });

    const groupedByBrand = {};
    links.forEach((link) => {
      const brandId = link.brand.id;
      if (!groupedByBrand[brandId]) {
        groupedByBrand[brandId] = {
          brand: link.brand,
          categories: [],
        };
      }
      groupedByBrand[brandId].categories.push(link.category.dataValues);
    });

    const result = Object.values(groupedByBrand);

    return {
      status: "Ok",
      message: "Lấy tất cả liên kết danh mục - thương hiệu thành công",
      data: result,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
    };
  }
};

const deleteCateBrandLink = async (params) => {
  try {
    const { categoryId, brandId } = params;
    const link = await Cate_Brand_Link.findOne({
      where: { category_id: categoryId, brand_id: brandId },
    });

    if (!link) {
      return {
        status: "Err",
        message: "Liên kết danh mục - thương hiệu không tồn tại",
      };
    }
    await link.destroy();
    return {
      status: "Ok",
      message: "Xóa liên kết danh mục - thương hiệu thành công",
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
  createCateBrandLink,
  getLinksByCategoryId,
  getLinksByBrandId,
  getAllLinks,
  deleteCateBrandLink,
};
