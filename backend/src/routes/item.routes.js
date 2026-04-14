const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const itemController = require("../controllers/item.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { upload } = require("../config/cloudinary");

// GET /api/items — public browse
router.get("/", itemController.getItems);

// GET /api/items/mine — my own listings [AUTH]
router.get("/mine", authenticate, itemController.getMyItems);

// GET /api/items/:id — single item
router.get("/:id", itemController.getItemById);

// POST /api/items — create listing [AUTH]
router.post(
  "/",
  authenticate,
  upload.array("images", 5), // max 5 images
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("size").notEmpty().withMessage("Size is required"),
    body("condition").notEmpty().withMessage("Condition is required"),
    body("points").isInt({ min: 10, max: 500 }).withMessage("Points must be between 10 and 500"),
  ],
  validate,
  itemController.createItem
);

// PUT /api/items/:id — update listing [AUTH, owner]
router.put("/:id", authenticate, itemController.updateItem);

// DELETE /api/items/:id — delete listing [AUTH, owner]
router.delete("/:id", authenticate, itemController.deleteItem);

module.exports = router;
