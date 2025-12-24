const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["Admin"]),
  voucherController.createVoucher
);
router.put("/update/:id", authMiddleware, voucherController.updateVoucher);
router.get("/getAll", voucherController.getAllVouchers);
router.get("/get/:id", voucherController.getVoucherById);
router.post("/apply", authMiddleware, voucherController.applyVoucher);
router.delete("/delete/:id", authMiddleware, voucherController.deleteVoucher);
module.exports = router;
