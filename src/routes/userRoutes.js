const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authMiddleware,
  roleMddleware,
} = require("../middleware/authMiddleware");

router.post("/register", userController.register);

router.post("/login", userController.login);
router.post(
  "/update",
  authMiddleware,
  roleMddleware(["User"]),
  userController.updateUser
);

router.get("/getUser", authMiddleware, userController.getUserById);
router.get(
  "/getAll",
  authMiddleware,
  roleMddleware(["Admin"]),
  userController.getAllUser
);

router.delete(
  "/delete/:userId",
  authMiddleware,
  roleMddleware(["Admin"]),
  userController.deleteUser
);

//Address
router.post("/address", authMiddleware, userController.addAddress);
router.post(
  "/address/:addressId",
  authMiddleware,
  userController.updateAddress
);
module.exports = router;
