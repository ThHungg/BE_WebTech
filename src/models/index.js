const Address = require("./Address.js");
const Role = require("./Role.js");
const User = require("./User.js");
const Brand = require("./Brand.js");
const Category = require("./Category.js");
const Cate_Brand_Link = require("./Cate_Brand_Link.js");

Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

Category.hasMany(Category, { foreignKey: "parent_id", as: "children" });
Category.belongsTo(Category, { foreignKey: "parent_id", as: "parent" });

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

Cate_Brand_Link.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
Cate_Brand_Link.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

module.exports = {
  Role,
  User,
  Address,
  Brand,
  Category,
  Cate_Brand_Link,
};
