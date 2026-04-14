const prisma = require("../config/prisma");

/**
 * Get all orders for the logged-in user (as buyer or seller)
 */
const getMyOrders = async (userId) => {
  const [buying, selling] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        item: { select: { id: true, title: true, images: true, points: true } },
        seller: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { sellerId: userId },
      include: {
        item: { select: { id: true, title: true, images: true, points: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { buying, selling };
};

/**
 * Request an item (buyer initiates)
 */
const requestItem = async (buyerId, itemId, note) => {
  const item = await prisma.item.findUnique({
    where: { id: Number(itemId) },
    include: { seller: true },
  });

  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }
  if (item.status !== "ACTIVE") {
    const err = new Error("This item is no longer available.");
    err.status = 400;
    throw err;
  }
  if (item.sellerId === buyerId) {
    const err = new Error("You cannot request your own item.");
    err.status = 400;
    throw err;
  }

  // Check buyer has enough points
  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
  if (buyer.points < item.points) {
    const err = new Error(`You need ${item.points} points but only have ${buyer.points}.`);
    err.status = 400;
    throw err;
  }

  // Check for duplicate pending request
  const existingOrder = await prisma.order.findFirst({
    where: { itemId: Number(itemId), buyerId, status: "REQUESTED" },
  });
  if (existingOrder) {
    const err = new Error("You already have a pending request for this item.");
    err.status = 409;
    throw err;
  }

  const order = await prisma.order.create({
    data: {
      itemId: Number(itemId),
      buyerId,
      sellerId: item.sellerId,
      pointsUsed: item.points,
      note: note || null,
    },
    include: {
      item: { select: { title: true, images: true } },
      seller: { select: { firstName: true, lastName: true } },
    },
  });

  return order;
};

/**
 * Seller accepts the exchange request — points are transferred
 */
const acceptOrder = async (orderId, sellerId) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { item: true },
  });

  if (!order) {
    const err = new Error("Order not found.");
    err.status = 404;
    throw err;
  }
  if (order.sellerId !== sellerId) {
    const err = new Error("Only the seller can accept this request.");
    err.status = 403;
    throw err;
  }
  if (order.status !== "REQUESTED") {
    const err = new Error("This order is no longer pending.");
    err.status = 400;
    throw err;
  }

  // Transactional: deduct buyer points, credit seller, update item & order status
  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: Number(orderId) },
      data: { status: "ACCEPTED" },
    }),
    prisma.user.update({
      where: { id: order.buyerId },
      data: { points: { decrement: order.pointsUsed } },
    }),
    prisma.user.update({
      where: { id: sellerId },
      data: { points: { increment: order.pointsUsed } },
    }),
    prisma.item.update({
      where: { id: order.itemId },
      data: { status: "EXCHANGED" },
    }),
    // Reject any other pending requests for the same item
    prisma.order.updateMany({
      where: { itemId: order.itemId, status: "REQUESTED", id: { not: Number(orderId) } },
      data: { status: "REJECTED" },
    }),
  ]);

  return updatedOrder;
};

/**
 * Seller rejects a request
 */
const rejectOrder = async (orderId, sellerId) => {
  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order) {
    const err = new Error("Order not found.");
    err.status = 404;
    throw err;
  }
  if (order.sellerId !== sellerId) {
    const err = new Error("Only the seller can reject this request.");
    err.status = 403;
    throw err;
  }
  if (order.status !== "REQUESTED") {
    const err = new Error("This order is not pending.");
    err.status = 400;
    throw err;
  }

  return prisma.order.update({
    where: { id: Number(orderId) },
    data: { status: "REJECTED" },
  });
};

/**
 * Mark order as completed (either party)
 */
const completeOrder = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order) {
    const err = new Error("Order not found.");
    err.status = 404;
    throw err;
  }
  if (order.buyerId !== userId && order.sellerId !== userId) {
    const err = new Error("You are not part of this order.");
    err.status = 403;
    throw err;
  }
  if (order.status !== "ACCEPTED") {
    const err = new Error("Only accepted orders can be marked complete.");
    err.status = 400;
    throw err;
  }

  return prisma.order.update({
    where: { id: Number(orderId) },
    data: { status: "COMPLETED" },
  });
};

module.exports = { getMyOrders, requestItem, acceptOrder, rejectOrder, completeOrder };
