const adminService = require("../services/admin.service");

const getStats = async (req, res, next) => {
  try { res.json(await adminService.getStats()); }
  catch (err) { next(err); }
};
const getAllUsers = async (req, res, next) => {
  try { res.json(await adminService.getAllUsers(req.query)); }
  catch (err) { next(err); }
};
const updateUser = async (req, res, next) => {
  try { res.json(await adminService.updateUser(req.params.id, req.body)); }
  catch (err) { next(err); }
};
const getAllItems = async (req, res, next) => {
  try { res.json(await adminService.getAllItems(req.query)); }
  catch (err) { next(err); }
};
const updateItemStatus = async (req, res, next) => {
  try { res.json(await adminService.updateItemStatus(req.params.id, req.body.status)); }
  catch (err) { next(err); }
};
const getAllOrders = async (req, res, next) => {
  try { res.json(await adminService.getAllOrders(req.query)); }
  catch (err) { next(err); }
};

module.exports = { getStats, getAllUsers, updateUser, getAllItems, updateItemStatus, getAllOrders };
