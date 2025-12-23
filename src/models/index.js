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
const Cart = require("./Cart.js");
const Cart_Item = require("./Cart_Item.js");
const Voucher = require("./Voucher.js");
const VoucherDetail = require("./Voucher_Detail.js");
const Voucher_Constraint = require("./Voucher_Constraint.js");
const Voucher_Brand_Link = require("./Voucher_Brand_Link.js");
const Order = require("./Order.js");
const OrderDetail = require("./Order_Detail.js");
const Review = require("./Review.js");

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
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
Brand.hasMany(Product, { foreignKey: "brand_id" });

// Product <-> Category (N:1)
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
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

// User - Cart: Một User có một Giỏ hàng (1:1)
User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Cart - Cart_Item: Một Giỏ hàng có nhiều mặt hàng (1:N)
Cart.hasMany(Cart_Item, { foreignKey: "cart_id", as: "items" });
Cart_Item.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });

// Product_Variant - Cart_Item: Một biến thể sản phẩm có thể nằm trong nhiều giỏ hàng (1:N)
Product_Variant.hasMany(Cart_Item, {
  foreignKey: "product_variant_id",
  as: "cartItems",
});
Cart_Item.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

Voucher.hasMany(VoucherDetail, { foreignKey: "voucher_id" });
VoucherDetail.belongsTo(Voucher, { foreignKey: "voucher_id" });

Voucher.hasOne(Voucher_Constraint, { foreignKey: "voucher_id" });
Voucher_Constraint.belongsTo(Voucher, { foreignKey: "voucher_id" });

// Quan hệ n-n giữa Voucher và Brand qua bảng trung gian
Voucher.belongsToMany(Brand, {
  through: Voucher_Brand_Link,
  foreignKey: "voucher_id",
  otherKey: "brand_id",
});
Brand.belongsToMany(Voucher, {
  through: Voucher_Brand_Link,
  foreignKey: "brand_id",
  otherKey: "voucher_id",
});

// Order - User: Một người dùng có nhiều đơn hàng
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Order - VoucherDetail: Một đơn hàng có thể áp dụng một mã voucher
VoucherDetail.hasMany(Order, { foreignKey: "voucher_detail_id", as: "orders" });
Order.belongsTo(VoucherDetail, {
  foreignKey: "voucher_detail_id",
  as: "voucher",
});

// Order - OrderDetail: Một đơn hàng có nhiều chi tiết đơn hàng
Order.hasMany(OrderDetail, { foreignKey: "order_id", as: "details" });
OrderDetail.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// OrderDetail - Product_Variant: Một chi tiết đơn hàng trỏ tới một biến thể sản phẩm
Product_Variant.hasMany(OrderDetail, {
  foreignKey: "product_variant_id",
  as: "orderDetails",
});
OrderDetail.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

// Product - Review: Một sản phẩm có nhiều đánh giá
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// User - Review: Một người dùng có nhiều đánh giá
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });
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
  Unit,
  Attribute,
};
