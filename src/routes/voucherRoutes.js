const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");

router.post("/create", voucherController.createVoucher);
router.get("/getAll", voucherController.getAllVouchers);
router.get("/get/:id", voucherController.getVoucherById);
router.post("/apply", voucherController.applyVoucher);
router.delete("/delete/:id", voucherController.deleteVoucher);

module.exports = router;
