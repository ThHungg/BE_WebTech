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
const { Op } = require("sequelize");

const deleteProductFiles = (productImages) => {
  if (Array.isArray(productImages) && productImages.length > 0) {
    productImages.forEach((imgPath) => {
      if (imgPath) {
        deleteFile(`public/${imgPath}`);
      }
    });
  }
};

// Helper function to calculate total stock from variants
const calculateTotalStock = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) return 0;
  return variants.reduce(
    (total, variant) => total + parseInt(variant.stock || 0),
    0
  );
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

  // Calculate total_stock from variants instead of using user input
  const totalStock = calculateTotalStock(variants);

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
        total_stock: totalStock,
      },
      { transaction: t }
    );

    const productId = product.id;

    const productImages = images.map((imgPath) => ({
      product_id: productId,
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
            product_id: productId,
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

    const variantValues = variants.map((variant) => ({
      product_id: productId,
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
    await t.rollback();
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

// const updateProduct = async (productInfo) => {
//   const { productId, updatedProduct } = productInfo;
//   let {
//     category_id,
//     brand_id,
//     attributes,
//     variants,
//     images,
//     is_active,
//     ...productData
//   } = updatedProduct;

//   if (typeof variants === "string" && variants) {
//     variants = JSON.parse(variants);
//   }
//   if (typeof attributes === "string" && attributes) {
//     attributes = JSON.parse(attributes);
//   }

//   brand_id = parseInt(brand_id);
//   category_id = parseInt(category_id);

//   const t = await sequelize.transaction();
//   try {
//     const product = await Product.findByPk(productId);
//     if (!product) {
//       return {
//         status: "Err",
//         message: "Sản phẩm không tồn tại",
//       };
//     }
//     console.log("images", images);
//     if (images && images.length > 0) {
//       const oldImages = await Img_Product.findAll({
//         where: { product_id: productId },
//         transaction: t,
//       });
//       for (const img of oldImages) {
//         deleteFile(img.image);
//       }
//       await Img_Product.destroy({
//         where: { product_id: productId },
//         transaction: t,
//       });

//       const newProductImages = images.map((imgPath) => ({
//         product_id: productId,
//         image: imgPath,
//       }));
//       await Img_Product.bulkCreate(newProductImages, { transaction: t });
//     }

//     const updateData = {};
//     if (productData.name) updateData.name = productData.name;
//     if (productData.description)
//       updateData.description = productData.description;

//     if (brand_id && brand_id !== product.brand_id && brand_id !== "") {
//       const checkBrand = await Brand.findByPk(brand_id);
//       if (!checkBrand) {
//         return {
//           status: "Err",
//           message: "Thương hiệu không tồn tại",
//         };
//       }
//       updateData.brand_id = brand_id;
//     }
//     if (
//       category_id &&
//       category_id !== product.category_id &&
//       category_id !== ""
//     ) {
//       const checkCategory = await Category.findByPk(category_id);
//       if (!checkCategory) {
//         return {
//           status: "Err",
//           message: "Danh mục không tồn tại",
//         };
//       }
//       updateData.category_id = category_id;
//     }
//     if (is_active !== undefined && is_active !== "") {
//       updateData.is_active = is_active === "true" || is_active === true;
//     }

//     console.log("attributes", attributes);

//     if (Array.isArray(attributes) && attributes.length > 0) {
//       for (const attr of attributes) {
//         let attributeId = attr.attribute_id;

//         if (!attributeId && attr.name) {
//           const [newAttr] = await Attribute.findOrCreate({
//             where: { name: attr.name },
//             defaults: { name: attr.name },
//             transaction: t,
//           });
//           attributeId = newAttr.id;
//         }

//         await Cate_Attribute_Link.findOrCreate({
//           where: {
//             category_id: product.category_id,
//             attribute_id: attributeId,
//           },
//           defaults: {
//             category_id: product.category_id,
//             attribute_id: attributeId,
//           },
//           transaction: t,
//         });
//         if (attributeId) {
//           const checkValue = await Product_Attribute_Value.findOne({
//             where: { product_id: productId, attribute_id: attributeId },
//             transaction: t,
//           });
//           if (checkValue) {
//             checkValue.value = attr.value;
//             await checkValue.save({ transaction: t });
//           } else {
//             await Product_Attribute_Value.create(
//               {
//                 product_id: productId,
//                 attribute_id: attributeId,
//                 value: attr.value,
//               },
//               { transaction: t }
//             );
//           }
//         }
//       }
//     }

//     if (Array.isArray(variants) && variants.length >= 0) {
//       for (const variant of variants) {
//         if (variant.variant_id) {
//           const checkVariant = await Product_Variant.findByPk(
//             variant.variant_id
//           );
//           if (checkVariant) {
//             if (variant.name) checkVariant.name = variant.name;
//             if (variant.stock !== undefined) checkVariant.stock = variant.stock;
//             if (variant.original_price !== undefined)
//               checkVariant.original_price = variant.original_price;
//             if (variant.price !== undefined) checkVariant.price = variant.price;
//             if (variant.discount_amount !== undefined)
//               checkVariant.discount_amount = variant.discount_amount;
//             if (variant.discount_percent !== undefined)
//               checkVariant.discount_percent = variant.discount_percent;

//             await checkVariant.save({ transaction: t });
//           }
//         } else if (!variant.variant_id) {
//           if (!variant.name || !variant.stock || !variant.original_price) {
//             return {
//               status: "Err",
//               message:
//                 "Thiếu thông tin biến thể mới. Vui lòng kiểm tra lại tên, tồn kho và giá gốc.",
//             };
//           }

//           await Product_Variant.create(
//             {
//               product_id: productId,
//               name: variant.name,
//               stock: variant.stock,
//               sold: variant.sold || 0,
//               original_price: variant.original_price,
//               price: variant.price || variant.original_price,
//               discount_amount: variant.discount_amount || 0,
//               discount_percent: variant.discount_percent || 0,
//             },
//             { transaction: t }
//           );
//         }
//       }
//     }

//     // Get all variants after updates to recalculate total_stock
//     const allVariants = await Product_Variant.findAll({
//       where: { product_id: productId },
//     });
//     const newTotalStock = calculateTotalStock(allVariants);
//     updateData.total_stock = newTotalStock;

//     await product.update(updateData, { transaction: t });

//     await t.commit();

//     return {
//       status: "Ok",
//       message: "Cập nhật sản phẩm thành công",
//     };
//   } catch (e) {
//     console.log(e);
//     await t.rollback();
//     return {
//       status: "Err",
//       message: "Lỗi hệ thống vui lòng thử lại sau",
//     };
//   }
// };

const updateProduct = async (productInfo) => {
  const { productId, updatedProduct } = productInfo;
  let {
    category_id,
    brand_id,
    attributes,
    variants,
    images, // Đây là danh sách các path ảnh mới/hiện có từ FE gửi về
    is_active,
    ...productData
  } = updatedProduct;

  // 1. Chuẩn hóa dữ liệu đầu vào
  if (typeof variants === "string" && variants) variants = JSON.parse(variants);
  if (typeof attributes === "string" && attributes)
    attributes = JSON.parse(attributes);

  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      return { status: "Err", message: "Sản phẩm không tồn tại" };
    }

    // 2. Xử lý Hình ảnh (Chỉ xóa ảnh cũ không còn trong danh sách mới)
    if (images && Array.isArray(images)) {
      const oldImages = await Img_Product.findAll({
        where: { product_id: productId },
        transaction: t,
      });
      const oldImagePaths = oldImages.map((img) => img.image);

      // Ảnh cần xóa: có trong DB nhưng không có trong danh sách FE gửi lên
      const imagesToDelete = oldImages.filter(
        (img) => !images.includes(img.image)
      );
      for (const img of imagesToDelete) {
        deleteFile(img.image); // Hàm xóa file vật lý của bạn
        await img.destroy({ transaction: t });
      }

      // Ảnh cần thêm: có trong danh sách FE nhưng chưa có trong DB
      const imagesToAdd = images.filter(
        (path) => !oldImagePaths.includes(path)
      );
      const newImgData = imagesToAdd.map((path) => ({
        product_id: productId,
        image: path,
      }));
      await Img_Product.bulkCreate(newImgData, { transaction: t });
    }

    // 3. Chuẩn bị dữ liệu cập nhật Product
    const targetCategoryId = category_id
      ? parseInt(category_id)
      : product.category_id;
    const updateData = {
      ...productData,
      category_id: targetCategoryId,
      brand_id: brand_id ? parseInt(brand_id) : product.brand_id,
      is_active:
        is_active !== undefined
          ? is_active === "true" || is_active === true
          : product.is_active,
    };

    // 4. Xử lý Attributes (Đồng bộ với Category hiện tại/mới)
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
        }

        if (attributeId) {
          // Luôn đảm bảo thuộc tính được link với Category hiện tại của sản phẩm
          await Cate_Attribute_Link.findOrCreate({
            where: { category_id: targetCategoryId, attribute_id: attributeId },
            defaults: {
              category_id: targetCategoryId,
              attribute_id: attributeId,
            },
            transaction: t,
          });

          // Cập nhật hoặc tạo mới giá trị thuộc tính cho sản phẩm
          await Product_Attribute_Value.upsert(
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

    // 5. Xử lý Variants (Update, Create, và quan trọng nhất là DELETE thừa)
    if (Array.isArray(variants)) {
      const sentVariantIds = [];

      for (const variant of variants) {
        if (variant.variant_id) {
          // Update biến thể cũ
          await Product_Variant.update(
            {
              name: variant.name,
              stock: variant.stock,
              original_price: variant.original_price,
              price: variant.price || variant.original_price,
              discount_amount: variant.discount_amount || 0,
              discount_percent: variant.discount_percent || 0,
            },
            {
              where: { id: variant.variant_id, product_id: productId },
              transaction: t,
            }
          );
          sentVariantIds.push(parseInt(variant.variant_id));
        } else {
          // Tạo biến thể mới bổ sung
          const newVariant = await Product_Variant.create(
            {
              product_id: productId,
              name: variant.name,
              stock: variant.stock,
              original_price: variant.original_price,
              price: variant.price || variant.original_price,
            },
            { transaction: t }
          );
          sentVariantIds.push(newVariant.id);
        }
      }

      // XÓA các biến thể không có trong danh sách gửi lên
      await Product_Variant.destroy({
        where: {
          product_id: productId,
          id: { [Op.notIn]: sentVariantIds },
        },
        transaction: t,
      });
    }

    // 6. Tính toán lại tổng kho và Lưu Product
    const allVariants = await Product_Variant.findAll({
      where: { product_id: productId },
      transaction: t,
    });
    updateData.total_stock = allVariants.reduce(
      (sum, variant) => sum + (parseInt(variant.stock) || 0),
      0
    );

    await product.update(updateData, { transaction: t });

    await t.commit();
    return {
      status: "Ok",
      message: "Cập nhật sản phẩm và biến thể thành công",
    };
  } catch (e) {
    await t.rollback();
    console.error("Update Product Error:", e);
    return { status: "Err", message: "Lỗi hệ thống: " + e.message };
  }
};

const updateProductStatus = async (productId, status) => {
  try {
    console.log("Updating product status:", productId, status);
    const product = await Product.findByPk(productId);
    if (!product) {
      return {
        status: "Err",
        message: "Sản phẩm không tồn tại",
      };
    }

    product.is_active = status;
    await product.save();

    return {
      status: "Ok",
      message: "Cập nhật trạng thái sản phẩm thành công",
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
        {
          association: "attributeValues",
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

const getAllProducts = async (page = 1, limit = 12) => {
  try {
    const offset = (page - 1) * limit;

    const total = await Product.count();

    const products = await Product.findAll({
      offset,
      limit,
      include: [
        { association: "brand" },
        { association: "category" },
        { association: "images" },
        {
          association: "variants",
          limit: 1,
        },
        {
          association: "attributes",
          through: { attributes: [] },
        },
        {
          association: "attributeValues",
        },
      ],
    });

    return {
      status: "Ok",
      message: "Lấy tất cả sản phẩm thành công",
      data: products,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.log(e);
    return {
      status: "Err",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};

const getProductBySlug = async (slug, page = 1, limit = 12) => {
  try {
    const parentCategory = await Category.findOne({ where: { slug } });
    if (!parentCategory) {
      return {
        status: "Err",
        message: "Danh mục không tồn tại",
      };
    }

    const subCategories = await Category.findAll({
      where: {
        [Op.or]: [
          {
            id: parentCategory.id,
          },
          {
            parent_id: parentCategory.id,
          },
        ],
      },
      attributes: ["id"],
    });

    const categoryIds = subCategories.map((cat) => cat.id);

    const offset = (page - 1) * limit;

    const total = await Product.count({
      where: {
        category_id: { [Op.in]: categoryIds },
        is_active: true,
      },
    });

    const products = await Product.findAll({
      where: {
        category_id: { [Op.in]: categoryIds },
        is_active: true,
      },
      include: [
        { association: "brand" },
        { association: "category" },
        { association: "images" },
        {
          association: "variants",
          limit: 1,
        },
        {
          association: "attributes",
          through: { attributes: [] },
        },
        {
          association: "attributeValues",
        },
      ],
      offset: offset,
      limit: limit,
    });
    return {
      status: "Ok",
      message: "Lấy tất cả sản phẩm thành công",
      data: products,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
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
  updateProductStatus,
  getProductDetail,
  getAllProducts,
  getProductBySlug,
  deleteProduct,
};
