const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, reviewController.createReview);

router.get("/getByProduct/:productId", reviewController.getReviewsByProductId);

module.exports = router;
