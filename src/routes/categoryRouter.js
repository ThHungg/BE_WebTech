const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { route } = require("./brandRoutes");

router.post("/create", categoryController.createCategory);
router.get("/getAll", categoryController.getAllCategories);
router.get("/get/:categoryId", categoryController.getCategoryById);
router.get(
  "/getChildren/:categoryId",
  categoryController.getCategoryChildrenById
);

router.delete("/delete/:categoryId", categoryController.deleteCategory);


module.exports = router;
