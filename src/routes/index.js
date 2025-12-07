const userRoutes = require("./userRoutes");
const brandRoutes = require("./brandRoutes");
const categoryRoutes = require("./categoryRouter");
const cate_brand_linkRoutes = require("./cate_brand_linkRouter");
const routes = (app) => {
  app.use("/api/users", userRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cate_brand_links", cate_brand_linkRoutes);
};

module.exports = routes;
