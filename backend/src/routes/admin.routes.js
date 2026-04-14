const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

// All admin routes: must be logged in AND admin
router.use(authenticate, requireAdmin);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id", adminController.updateUser);
router.get("/items", adminController.getAllItems);
router.patch("/items/:id", adminController.updateItemStatus);
router.get("/orders", adminController.getAllOrders);

module.exports = router;
