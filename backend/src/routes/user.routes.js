const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { upload } = require("../config/cloudinary");

// GET /api/users/:id — public profile
router.get("/:id", userController.getUserProfile);

// PUT /api/users/me — update own profile [AUTH]
router.put("/me", authenticate, upload.single("avatar"), userController.updateProfile);

// PATCH /api/users/me/password — change password [AUTH]
router.patch(
  "/me/password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  validate,
  userController.changePassword
);

module.exports = router;
