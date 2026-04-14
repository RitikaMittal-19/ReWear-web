const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

/**
 * Get public profile of a user
 */
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      location: true,
      rating: true,
      reviewCount: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });
  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Update current user's profile
 */
const updateProfile = async (userId, data, avatarUrl) => {
  const updateData = {};
  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.preferredSizes !== undefined) updateData.preferredSizes = data.preferredSizes;
  if (avatarUrl) updateData.avatar = avatarUrl;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true, email: true, firstName: true, lastName: true,
      bio: true, location: true, avatar: true, points: true,
      rating: true, reviewCount: true, preferredSizes: true,
    },
  });
  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    const err = new Error("Current password is incorrect.");
    err.status = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password changed successfully." };
};

module.exports = { getUserProfile, updateProfile, changePassword };
