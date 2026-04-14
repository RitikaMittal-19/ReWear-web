// ─── SERVICE ──────────────────────────────────────────────────
const prisma = require("../config/prisma");

const getWishlist = async (userId) => {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      item: {
        include: {
          seller: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const addToWishlist = async (userId, itemId) => {
  const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });
  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }
  return prisma.wishlist.create({
    data: { userId, itemId: Number(itemId) },
  });
};

const removeFromWishlist = async (userId, itemId) => {
  const entry = await prisma.wishlist.findUnique({
    where: { userId_itemId: { userId, itemId: Number(itemId) } },
  });
  if (!entry) {
    const err = new Error("Item not in wishlist.");
    err.status = 404;
    throw err;
  }
  await prisma.wishlist.delete({
    where: { userId_itemId: { userId, itemId: Number(itemId) } },
  });
  return { message: "Removed from wishlist." };
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
