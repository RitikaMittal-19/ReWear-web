const wishlistService = require("../services/wishlist.service");

const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    res.json({ wishlist: items });
  } catch (err) { next(err); }
};

const addToWishlist = async (req, res, next) => {
  try {
    const entry = await wishlistService.addToWishlist(req.user.id, req.params.itemId);
    res.status(201).json({ message: "Added to wishlist!", entry });
  } catch (err) { next(err); }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.removeFromWishlist(req.user.id, req.params.itemId);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
