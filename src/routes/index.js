const userRoutes = require("./userRoutes");
const brandRoutes = require("./brandRoutes");
const categoryRoutes = require("./categoryRoutes");
const cate_brand_linkRoutes = require("./cate_brand_linkRoutes");
const unitRoutes = require("./unitRoutes");
const attributeRoutes = require("./attributeRoutes");
const cate_attribute_link = require("./cate_attribute_link");

const routes = (app) => {
  app.use("/api/users", userRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cate_brand_links", cate_brand_linkRoutes);
  app.use("/api/units", unitRoutes);
  app.use("/api/attributes", attributeRoutes);
  app.use("/api/cate_attribute_links", cate_attribute_link);
};

module.exports = routes;
