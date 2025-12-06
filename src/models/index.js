const Address = require("./Address.js");
const Role = require("./Role.js");
const User = require("./User.js");


Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  Role,
  User,
  Address,
};
