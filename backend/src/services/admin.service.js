const prisma = require("../config/prisma");

const getStats = async () => {
  const [totalUsers, totalItems, totalOrders, completedOrders] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
  ]);
  return { totalUsers, totalItems, totalOrders, completedOrders };
};

const getAllUsers = async ({ page = 1, limit = 20, search }) => {
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatar: true, role: true, isActive: true, points: true,
        rating: true, createdAt: true,
        _count: { select: { listings: true, ordersBuyer: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } };
};

const updateUser = async (userId, { isActive, role }) => {
  return prisma.user.update({
    where: { id: Number(userId) },
    data: {
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(role && { role }),
    },
    select: { id: true, email: true, isActive: true, role: true },
  });
};

const getAllItems = async ({ page = 1, limit = 20, status }) => {
  const where = status ? { status: status.toUpperCase() } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.item.count({ where }),
  ]);
  return { items, pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } };
};

const updateItemStatus = async (itemId, status) => {
  return prisma.item.update({
    where: { id: Number(itemId) },
    data: { status: status.toUpperCase() },
    select: { id: true, title: true, status: true },
  });
};

const getAllOrders = async ({ page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        item: { select: { id: true, title: true, images: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.order.count(),
  ]);
  return { orders, pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } };
};

module.exports = { getStats, getAllUsers, updateUser, getAllItems, updateItemStatus, getAllOrders };
