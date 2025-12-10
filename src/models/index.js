const Address = require("./Address.js");
const Role = require("./Role.js");
const User = require("./User.js");
const Brand = require("./Brand.js");
const Category = require("./Category.js");
const Cate_Brand_Link = require("./Cate_Brand_Link.js");
const Unit = require("./Unit.js");
const Attribute = require("./Attribute.js");
const Cate_Attribute_Link = require("./Cate_Attribute_Link.js");
const Product = require("./Product.js");
const Product_Variant = require("./Product_Variant.js");
const Img_Product = require("./Img_Product.js");
const Product_Attribute_Value = require("./Product_Attribute_Value.js");
const Product_Description_Block = require("./Product_Desc_Block.js");

// Role - User: Một vai trò (Role) có nhiều người dùng (User)
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

// User - Address: Một người dùng (User) có nhiều địa chỉ (Address)
User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Category - Category: Một danh mục (Category) có thể có nhiều danh mục con (children) và thuộc về một danh mục cha (parent)
Category.hasMany(Category, { foreignKey: "parent_id", as: "children" });
Category.belongsTo(Category, { foreignKey: "parent_id", as: "parent" });

// Brand - Category: Mối quan hệ nhiều-nhiều giữa Thương hiệu (Brand) và Danh mục (Category) thông qua Cate_Brand_Link
Brand.belongsToMany(Category, {
  through: Cate_Brand_Link,
  foreignKey: "brand_id",
  otherKey: "category_id",
  as: "categories",
});

Category.belongsToMany(Brand, {
  through: Cate_Brand_Link,
  foreignKey: "category_id",
  otherKey: "brand_id",
  as: "brands",
});

// Cate_Brand_Link - Brand/Category: Liên kết giữa Cate_Brand_Link với Brand và Category
Cate_Brand_Link.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
Cate_Brand_Link.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// Attribute - Unit: Một thuộc tính (Attribute) thuộc về một đơn vị (Unit), và một đơn vị có nhiều thuộc tính
Attribute.belongsTo(Unit, { foreignKey: "unit_id", as: "unit" });
Unit.hasMany(Attribute, { foreignKey: "unit_id", as: "attributes" });

// Cate_Attribute_Link - Category/Attribute: Liên kết giữa Cate_Attribute_Link với Category và Attribute
Cate_Attribute_Link.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});
Cate_Attribute_Link.belongsTo(Attribute, {
  foreignKey: "attribute_id",
  as: "attribute",
});

// Product <-> Brand (N:1)
Product.belongsTo(Brand, { foreignKey: "brand_id" });
Brand.hasMany(Product, { foreignKey: "brand_id" });

// Product <-> Category (N:1)
Product.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Product, { foreignKey: "category_id" });

// Product - Product_Variant: Một sản phẩm (Product) có nhiều biến thể (Product_Variant)
Product.hasMany(Product_Variant, { foreignKey: "product_id", as: "variants" });
Product_Variant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Product - Img_Product: Một sản phẩm (Product) có nhiều hình ảnh (Img_Product)
Product.hasMany(Img_Product, { foreignKey: "product_id", as: "images" });
Img_Product.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Product - Attribute: Mối quan hệ nhiều-nhiều giữa Sản phẩm (Product) và Thuộc tính (Attribute) thông qua Product_Attribute_Value
Product.belongsToMany(Attribute, {
  through: "Product_Attribute_Value",
  foreignKey: "product_id",
  otherKey: "attribute_id",
  as: "attributes",
});

Attribute.belongsToMany(Product, {
  through: "Product_Attribute_Value",
  foreignKey: "attribute_id",
  otherKey: "product_id",
  as: "products",
});

// Product - Product_Attribute_Value
Product.hasMany(Product_Attribute_Value, {
  foreignKey: "product_id",
  as: "attributeValues",
});
Product_Attribute_Value.belongsTo(Product, {
  foreignKey: "product_id",
});

// Product - Product_Description_Block
Product.hasMany(Product_Description_Block, {
  foreignKey: "product_id",
  as: "descriptionBlocks",
});
Product_Description_Block.belongsTo(Product, {
  foreignKey: "product_id",
});

module.exports = {
  Role,
  User,
  Address,
  Brand,
  Category,
  Cate_Brand_Link,
  Cate_Attribute_Link,
  Product,
  Product_Variant,
  Img_Product,
  Product_Attribute_Value,
  Product_Description_Block,
  Unit,
  Attribute,
};
