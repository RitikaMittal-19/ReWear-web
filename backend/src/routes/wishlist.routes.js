const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/", wishlistController.getWishlist);
router.post("/:itemId", wishlistController.addToWishlist);
router.delete("/:itemId", wishlistController.removeFromWishlist);

module.exports = router;
