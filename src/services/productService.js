const Product = require("../models/Product");
const Img_Product = require("../models/Img_Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product_Variant = require("../models/Product_Variant");
const Product_Attribute_Value = require("../models/Product_Attribute_Value");
const Product_Description_Block = require("../models/Product_Desc_Block");
const Cart_Item = require("../models/Cart_Item");
const { sequelize } = require("../config/db");
const { deleteFile } = require("../../utils/deleteFile");
const { Attribute, Cate_Attribute_Link } = require("../models");

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

  console.log("description_data", attributes);

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
  const t = await sequelize.transaction();
  try {
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

    const attributeValues = [];
    if (Array.isArray(attributes)) {
      for (const attr of attributes) {
        let attributeId = attr.attribute_id;
        if (!attributeId && attr.name) {
          const [newAttr] = await Attribute.findOrCreate({
            where: { name: attr.name },
            defaults: { name: attr.name },
            transaction: t,
          });
          attributeId = newAttr.id;

          await Cate_Attribute_Link.findOrCreate({
            where: { category_id, attribute_id: attributeId },
            defaults: { category_id, attribute_id: attributeId },
            transaction: t,
          });
        }
        if (attributeId) {
          attributeValues.push({
            product_id: prodcutId,
            attribute_id: attributeId,
            value: attr.value,
          });
        }
      }
    }

    const createAttributes = await Product_Attribute_Value.bulkCreate(
      attributeValues,
      { transaction: t }
    );

    // const attributeValues = attributes.map((attr) => ({
    //   product_id: prodcutId,
    //   attribute_id: attr.attribute_id,
    //   value: attr.value,
    // }));
    // const createdAttributes = await Product_Attribute_Value.bulkCreate(
    //   attributeValues,
    //   { transaction: t }
    // );

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
        attributes: createAttributes,
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

const updateProduct = async (productInfo) => {
  const { productId, updatedProduct } = productInfo;
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
  } = updatedProduct;

  if (typeof variants === "string" && variants) {
    variants = JSON.parse(variants);
  }
  if (typeof attributes === "string" && attributes) {
    attributes = JSON.parse(attributes);
  }
  let description_blocks = [];
  if (typeof description_data === "string" && description_data) {
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

  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return {
        status: "Err",
        message: "Sản phẩm không tồn tại",
      };
    }
    // console.log(variants);
    const updateData = {};
    if (productData.name) updateData.name = productData.name;
    if (productData.total_stock)
      updateData.total_stock = productData.total_stock;

    if (brand_id && brand_id !== product.brand_id && brand_id !== "") {
      const checkBrand = await Brand.findByPk(brand_id);
      if (!checkBrand) {
        return {
          status: "Err",
          message: "Thương hiệu không tồn tại",
        };
      }
      updateData.brand_id = brand_id;
    }
    if (
      category_id &&
      category_id !== product.category_id &&
      category_id !== ""
    ) {
      const checkCategory = await Category.findByPk(category_id);
      if (!checkCategory) {
        return {
          status: "Err",
          message: "Danh mục không tồn tại",
        };
      }
      updateData.category_id = category_id;
    }
    if (is_active !== undefined && is_active !== "") {
      updateData.is_active = is_active === "true" || is_active === true;
    }

    if (Array.isArray(attributes) && attributes.length > 0) {
      for (const attr of attributes) {
        if (attr.attribute_value_id) {
          const checkAttrValue = await Product_Attribute_Value.findByPk(
            attr.attribute_value_id
          );
          if (checkAttrValue) {
            if (attr.value) {
              checkAttrValue.value = attr.value;
              await checkAttrValue.save({ transaction: t });
            }
          }
        }
      }
    }

    if (Array.isArray(variants) && variants.length >= 0) {
      for (const variant of variants) {
        if (variant.variant_id) {
          const checkVariant = await Product_Variant.findByPk(
            variant.variant_id
          );
          if (checkVariant) {
            if (variant.name) checkVariant.name = variant.name;
            if (variant.stock !== undefined) checkVariant.stock = variant.stock;
            if (variant.original_price !== undefined)
              checkVariant.original_price = variant.original_price;
            if (variant.price !== undefined) checkVariant.price = variant.price;
            if (variant.discount_amount !== undefined)
              checkVariant.discount_amount = variant.discount_amount;
            if (variant.discount_percent !== undefined)
              checkVariant.discount_percent = variant.discount_percent;

            await checkVariant.save({ transaction: t });
          }
        } else if (!variant.variant_id) {
          if (!variant.name || !variant.stock || !variant.original_price) {
            return {
              status: "Err",
              message:
                "Thiếu thông tin biến thể mới. Vui lòng kiểm tra lại tên, tồn kho và giá gốc.",
            };
          }

          await Product_Variant.create(
            {
              product_id: productId,
              name: variant.name,
              stock: variant.stock,
              sold: variant.sold || 0,
              original_price: variant.original_price,
              price: variant.price || variant.original_price,
              discount_amount: variant.discount_amount || 0,
              discount_percent: variant.discount_percent || 0,
            },
            { transaction: t }
          );
        }
      }
    }

    await product.update(updateData, { transaction: t });

    // await product.save();
    await t.commit();

    return {
      status: "Ok",
      message: "Cập nhật sản phẩm thành công",
      data: product,
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống vui lòng thử lại sau",
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
        {
          association: "attributes",
          through: { attributes: [] },
        },
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
      const productVariants = await Product_Variant.findAll({
        where: { product_id: productId },
      });
      for (const vatriant of productVariants) {
        const cartItems = await Cart_Item.findAll({
          where: { product_variant_id: vatriant.id },
        });
        for (const item of cartItems) {
          await item.destroy();
        }
      }

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
  updateProduct,
  getProductDetail,
  deleteProduct,
};
