const prisma = require("../config/prisma");

/**
 * Get all active items with optional filters + pagination
 */
const getItems = async ({ category, size, condition, minPoints, maxPoints, search, page = 1, limit = 12 }) => {
  const where = { status: "ACTIVE" };

  if (category) where.category = category.toUpperCase();
  if (size) where.size = size.toUpperCase();
  if (condition) where.condition = condition.toUpperCase();
  if (minPoints || maxPoints) {
    where.points = {};
    if (minPoints) where.points.gte = Number(minPoints);
    if (maxPoints) where.points.lte = Number(maxPoints);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: { id: true, firstName: true, lastName: true, avatar: true, rating: true },
        },
      },
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get single item by ID, increment view count
 */
const getItemById = async (id) => {
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true, avatar: true, rating: true, reviewCount: true, location: true },
      },
    },
  });
  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }

  // Async view increment (don't await — non-blocking)
  prisma.item.update({ where: { id: Number(id) }, data: { views: { increment: 1 } } }).catch(() => {});

  return item;
};

/**
 * Create a new listing
 */
const createItem = async (userId, data, imageUrls) => {
  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      brand: data.brand || null,
      category: data.category.toUpperCase(),
      size: data.size.toUpperCase(),
      condition: data.condition.toUpperCase(),
      points: Number(data.points),
      exchangeType: data.exchangeType ? data.exchangeType.toUpperCase() : "POINTS_ONLY",
      tradePrefs: data.tradePrefs || null,
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(",").map((t) => t.trim())) : [],
      images: imageUrls,
      sellerId: userId,
      status: "ACTIVE",
    },
    include: {
      seller: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  return item;
};

/**
 * Update an item (only owner can update)
 */
const updateItem = async (itemId, userId, data) => {
  const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });
  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }
  if (item.sellerId !== userId) {
    const err = new Error("You can only edit your own listings.");
    err.status = 403;
    throw err;
  }
  if (item.status === "EXCHANGED") {
    const err = new Error("Cannot edit an already exchanged item.");
    err.status = 400;
    throw err;
  }

  const updated = await prisma.item.update({
    where: { id: Number(itemId) },
    data: {
      title: data.title,
      description: data.description,
      brand: data.brand,
      points: data.points ? Number(data.points) : undefined,
      condition: data.condition ? data.condition.toUpperCase() : undefined,
      tradePrefs: data.tradePrefs,
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(",").map((t) => t.trim())) : undefined,
    },
  });
  return updated;
};

/**
 * Delete an item (only owner)
 */
const deleteItem = async (itemId, userId) => {
  const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });
  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }
  if (item.sellerId !== userId) {
    const err = new Error("You can only delete your own listings.");
    err.status = 403;
    throw err;
  }

  await prisma.item.delete({ where: { id: Number(itemId) } });
  return { message: "Listing deleted successfully." };
};

/**
 * Get items by a specific seller
 */
const getItemsBySeller = async (sellerId) => {
  return prisma.item.findMany({
    where: { sellerId: Number(sellerId) },
    orderBy: { createdAt: "desc" },
  });
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, getItemsBySeller };
