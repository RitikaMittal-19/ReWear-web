const { validationResult } = require("express-validator");

/**
 * Run express-validator and return 422 if errors exist
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: "Validation failed",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Global error handler — must have 4 params for Express to recognize it
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Prisma-specific errors
  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Image too large. Max 5MB per file." });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
};

module.exports = { validate, errorHandler };
