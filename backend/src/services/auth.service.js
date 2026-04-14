const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const SALT_ROUNDS = 12;

/**
 * Generate a signed JWT for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Format safe user object (no password)
 */
const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

/**
 * Register a new user
 */
const register = async ({ firstName, lastName, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      points: 100, // Welcome bonus
    },
  });

  const token = generateToken(user.id);
  return { user: safeUser(user), token };
};

/**
 * Login existing user
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }
  if (!user.isActive) {
    const err = new Error("Your account has been deactivated. Contact support.");
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  const token = generateToken(user.id);
  return { user: safeUser(user), token };
};

/**
 * Get current user profile
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      location: true,
      avatar: true,
      points: true,
      role: true,
      rating: true,
      reviewCount: true,
      preferredSizes: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          listings: true,
          ordersBuyer: true,
        },
      },
    },
  });
  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe };
