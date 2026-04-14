const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");

// All order routes require authentication
router.use(authenticate);

// GET /api/orders — my orders (buying + selling)
router.get("/", orderController.getMyOrders);

// POST /api/orders — request an item
router.post(
  "/",
  [body("itemId").isInt().withMessage("Valid item ID required")],
  validate,
  orderController.requestItem
);

// PATCH /api/orders/:id/accept — seller accepts
router.patch("/:id/accept", orderController.acceptOrder);

// PATCH /api/orders/:id/reject — seller rejects
router.patch("/:id/reject", orderController.rejectOrder);

// PATCH /api/orders/:id/complete — mark complete
router.patch("/:id/complete", orderController.completeOrder);

module.exports = router;
