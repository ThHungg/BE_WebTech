const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["Admin"]),
  attributeController.createAttributes
);
// router.delete("/delete/:id", attributeController.deleteAttribute);

module.exports = router;
