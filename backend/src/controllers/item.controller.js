const itemService = require("../services/item.service");

const getItems = async (req, res, next) => {
  try {
    const result = await itemService.getItems(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    // Cloudinary upload via multer puts URLs in req.files
    const imageUrls = req.files ? req.files.map((f) => f.path) : [];
    if (imageUrls.length === 0) {
      return res.status(400).json({ error: "At least one image is required." });
    }
    const item = await itemService.createItem(req.user.id, req.body, imageUrls);
    res.status(201).json({ message: "Item listed successfully!", item });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.user.id, req.body);
    res.json({ message: "Item updated.", item });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const result = await itemService.deleteItem(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getMyItems = async (req, res, next) => {
  try {
    const items = await itemService.getItemsBySeller(req.user.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, getMyItems };
