const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

/**
 * Verify JWT token and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, firstName: true, lastName: true },
    });

    if (!user) return res.status(401).json({ error: "User not found." });
    if (!user.isActive) return res.status(403).json({ error: "Account is deactivated." });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

/**
 * Restrict route to ADMIN role only
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
