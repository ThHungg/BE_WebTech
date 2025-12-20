const Product = require("../models/Product");
const Img_Product = require("../models/Img_Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product_Variant = require("../models/Product_Variant");
const Product_Attribute_Value = require("../models/Product_Attribute_Value");
const Cart_Item = require("../models/Cart_Item");
const { sequelize } = require("../config/db");
const { deleteFile } = require("../../utils/deleteFile");
const { Attribute, Cate_Attribute_Link } = require("../models");

const deleteProductFiles = (productImages) => {
  if (Array.isArray(productImages) && productImages.length > 0) {
    productImages.forEach((imgPath) => {
      if (imgPath) {
        deleteFile(`public/Img/products/${imgPath}`);
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
    ...productData
  } = newProduct;
  console.log("images", images);

  if (typeof variants === "string") {
    variants = JSON.parse(variants);
  }
  if (typeof attributes === "string") {
    attributes = JSON.parse(attributes);
  }

  brand_id = parseInt(brand_id);
  category_id = parseInt(category_id);

  productData.total_stock = parseInt(productData.total_stock);
  const t = await sequelize.transaction();
  try {
    const checkBrand = await Brand.findByPk(brand_id);
    if (!checkBrand) {
      deleteProductFiles(images);
      return {
        status: "Err",
        message: "Thương hiệu không tồn tại",
      };
    }

    const checkCategory = await Category.findByPk(category_id);
    if (!checkCategory) {
      deleteProductFiles(images);
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
      image: `Img/products/${imgPath}`,
    }));
    const createdImages = await Img_Product.bulkCreate(productImages, {
      transaction: t,
    });

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
      },
    };
  } catch (e) {
    console.log(e);
    deleteProductFiles(images);
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
    ...productData
  } = updatedProduct;

  if (typeof variants === "string" && variants) {
    variants = JSON.parse(variants);
  }
  if (typeof attributes === "string" && attributes) {
    attributes = JSON.parse(attributes);
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
    console.log("images", images);
    if (images && images.length > 0) {
      const oldImages = await Img_Product.findAll({
        where: { product_id: productId },
        transaction: t,
      });
      for (const img of oldImages) {
        deleteFile(img.image);
      }
      await Img_Product.destroy({
        where: { product_id: productId },
        transaction: t,
      });

      const newProductImages = images.map((imgPath) => ({
        product_id: productId,
        image: imgPath,
      }));
      await Img_Product.bulkCreate(newProductImages, { transaction: t });
    }
    // console.log(variants);
    const updateData = {};
    if (productData.name) updateData.name = productData.name;
    if (productData.description)
      updateData.description = productData.description;
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
        // deleteFile(imgPath);
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

    console.log("attributes", attributes);

    if (Array.isArray(attributes) && attributes.length > 0) {
      for (const attr of attributes) {
        let attributeId = attr.attribute_id;

        if (!attributeId && attr.name) {
          const [newAttr] = await Attribute.findOrCreate({
            where: { name: attr.name },
            defaults: { name: attr.name },
            transaction: t,
          });
          attributeId = newAttr.id;
        }

        await Cate_Attribute_Link.findOrCreate({
          where: {
            category_id: product.category_id,
            attribute_id: attributeId,
          },
          defaults: {
            category_id: product.category_id,
            attribute_id: attributeId,
          },
          transaction: t,
        });
        if (attributeId) {
          const checkValue = await Product_Attribute_Value.findOne({
            where: { product_id: productId, attribute_id: attributeId },
            transaction: t,
          });
          if (checkValue) {
            checkValue.value = attr.value;
            await checkValue.save({ transaction: t });
          } else {
            await Product_Attribute_Value.create(
              {
                product_id: productId,
                attribute_id: attributeId,
                value: attr.value,
              },
              { transaction: t }
            );
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
      // data: product,
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
    deleteProductFiles(productImages);

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
