const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authMiddleware,
  roleMddleware,
} = require("../middleware/authMiddleware");

router.post("/register", userController.register);

router.post("/login", userController.login);
router.post("/refresh-token", userController.refreshToken);
router.post(
  "/update",
  authMiddleware,
  roleMddleware(["User"]),
  userController.updateUser
);
router.post("/update/:userId", authMiddleware, userController.updateUserById);
router.post("/change-password", authMiddleware, userController.changePassword);
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

router.post("/logout", userController.logout);

//Address
router.post("/address", authMiddleware, userController.addAddress);
router.post(
  "/address/:addressId",
  authMiddleware,
  userController.updateAddress
);

module.exports = router;
