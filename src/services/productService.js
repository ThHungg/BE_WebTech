const Product = require("../models/Product");
const Img_Product = require("../models/Img_Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product_Variant = require("../models/Product_Variant");
const Product_Attribute_Value = require("../models/Product_Attribute_Value");
const Product_Description_Block = require("../models/Product_Desc_Block");
const { sequelize } = require("../config/db");
const { deleteFile } = require("../../utils/deleteFile");
const { get } = require("../routes/productRoutes");

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

const createProduct = async (newProduct) => {
  let {
    category_id,
    brand_id,
    attributes,
    variants,
    images,
    is_active,
    description_images,
    description_data,
    ...productData
  } = newProduct;

  if (typeof variants === "string") {
    variants = JSON.parse(variants);
  }
  if (typeof attributes === "string") {
    attributes = JSON.parse(attributes);
  }
  let description_blocks = [];
  if (typeof description_data === "string") {
    description_blocks = JSON.parse(description_data);
  }

  if (Array.isArray(description_images) && description_images.length > 0) {
    description_blocks = description_blocks.map((block, index) => ({
      ...block,
      img_content: description_images[index] || null,
    }));
  }

  brand_id = parseInt(brand_id);
  category_id = parseInt(category_id);
  productData.total_stock = parseInt(productData.total_stock);

  try {
    const t = await sequelize.transaction();

    const checkBrand = await Brand.findByPk(brand_id);
    if (!checkBrand) {
      deleteProductFiles(images, description_images);
      return {
        status: "Err",
        message: "Thương hiệu không tồn tại",
      };
    }

    const checkCategory = await Category.findByPk(category_id);
    if (!checkCategory) {
      deleteProductFiles(images, description_images);
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }

    const product = await Product.create(
      {
        ...productData,
        category_id,
        brand_id,
      },
      { transaction: t }
    );

    const prodcutId = product.id;

    const productImages = images.map((imgPath) => ({
      product_id: prodcutId,
      image: imgPath,
    }));
    const createdImages = await Img_Product.bulkCreate(productImages, {
      transaction: t,
    });

    let createdBlocks = null;
    if (description_blocks.length > 0) {
      const blocksToCreate = description_blocks.map((block, index) => ({
        product_id: prodcutId,
        sort_order: index,
        content: block.content || null,
        img_content: block.img_content || null,
        caption_img: block.caption_img || null,
      }));
      createdBlocks = await Product_Description_Block.bulkCreate(
        blocksToCreate,
        {
          transaction: t,
        }
      );
    }

    const attributeValues = attributes.map((attr) => ({
      product_id: prodcutId,
      attribute_id: attr.attribute_id,
      value: attr.value,
    }));
    const createdAttributes = await Product_Attribute_Value.bulkCreate(
      attributeValues,
      { transaction: t }
    );

    const variantValues = variants.map((variant) => ({
      product_id: prodcutId,
      // img_product_id: variant.img_product_id || null,
      name: variant.name,
      stock: variant.stock,
      sold: variant.sold || 0,
      original_price: variant.original_price,
      price: variant.price || variant.original_price,
      discount_amount: variant.discount_amount || 0,
      discount_percent: variant.discount_percent || 0,
    }));
    const createdVariants = await Product_Variant.bulkCreate(variantValues, {
      transaction: t,
    });

    await t.commit();
    return {
      status: "Ok",
      message: "Tạo sản phẩm thành công",
      data: {
        product,
        images: createdImages,
        attributes: createdAttributes,
        variants: createdVariants,
        descriptionBlocks: createdBlocks,
      },
    };
  } catch (e) {
    console.log(e);
    deleteProductFiles(images, description_images);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getProductDetail = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      include: [
        { association: "brand" },
        { association: "category" },
        { association: "images" },
        { association: "variants" },
        { association: "attributes" },
        { association: "descriptionBlocks" },
      ],
    });
    if (!product) {
      return {
        status: "Err",
        message: "Sản phẩm không tồn tại",
      };
    }
    return {
      status: "Ok",
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      include: [
        { association: "images" },
        { association: "descriptionBlocks" },
        { association: "variants" },
        { association: "attributeValues" },
      ],
    });
    if (!product) {
      return {
        status: "Err",
        message: "Sản phẩm không tồn tại",
      };
    }

    const productImages = product.images.map((img) => img.image);
    const descriptionImages = product.descriptionBlocks.map(
      (block) => block.img_content
    );
    deleteProductFiles(productImages, descriptionImages);

    if (product.variants.length > 0) {
      await Product_Variant.destroy({
        where: { product_id: productId },
      });
    }

    if (product.attributeValues.length > 0) {
      await Product_Attribute_Value.destroy({
        where: { product_id: productId },
      });
    }

    if (product.descriptionBlocks.length > 0) {
      await Product_Description_Block.destroy({
        where: { product_id: productId },
      });
    }

    if (product.images.length > 0) {
      await Img_Product.destroy({
        where: { product_id: productId },
      });
    }

    await product.destroy();

    return {
      status: "Ok",
      message: "Xóa sản phẩm thành công",
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

module.exports = {
  createProduct,
  getProductDetail,
  deleteProduct,
};
