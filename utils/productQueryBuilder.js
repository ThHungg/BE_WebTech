class ProductQueryBuilder {
  constructor() {
    this.query = {
      where: { is_active: true },
      include: [],
      distinct: true,
    };
  }

  setPagination(page, limit) {
    this.query.limit = parseInt(limit);
    this.query.offset = (parseInt(page) - 1) * parseInt(limit);
    return this;
  }

  withDetails() {
    this.query.include.push(
      { association: "brand" },
      { association: "category" },
      { association: "images" },
      { association: "variants", limit: 1 },
      { association: "attributes", through: { attributes: [] } },
      { association: "attributeValues" }
    );
    return this;
  }

  filterByCategory(categoryId) {
    if (categoryId) this.query.where.category_id = categoryId;
    return this;
  }

  build() {
    return this.query;
  }
}

module.exports = ProductQueryBuilder;
