const orderService = require("../services/order.service");

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const requestItem = async (req, res, next) => {
  try {
    const { itemId, note } = req.body;
    const order = await orderService.requestItem(req.user.id, itemId, note);
    res.status(201).json({ message: "Exchange request sent!", order });
  } catch (err) {
    next(err);
  }
};

const acceptOrder = async (req, res, next) => {
  try {
    const order = await orderService.acceptOrder(req.params.id, req.user.id);
    res.json({ message: "Exchange accepted! Points have been transferred.", order });
  } catch (err) {
    next(err);
  }
};

const rejectOrder = async (req, res, next) => {
  try {
    const order = await orderService.rejectOrder(req.params.id, req.user.id);
    res.json({ message: "Request rejected.", order });
  } catch (err) {
    next(err);
  }
};

const completeOrder = async (req, res, next) => {
  try {
    const order = await orderService.completeOrder(req.params.id, req.user.id);
    res.json({ message: "Exchange marked as complete!", order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyOrders, requestItem, acceptOrder, rejectOrder, completeOrder };
