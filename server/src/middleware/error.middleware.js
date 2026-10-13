const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Handle Zod validation errors
  if (err.name === "ZodError" || err.issues) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues || err.errors,
    });
  }

  // Handle PostgreSQL errors
  if (err.code) {
    // 23505: Unique constraint violation
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Unique constraint violation: Record already exists",
        detail: err.detail,
      });
    }
    // 23503: Foreign key violation
    if (err.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Referenced entity does not exist",
        detail: err.detail,
      });
    }
    // 22P02: Invalid text representation (e.g. invalid UUID format)
    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: "Invalid UUID or parameter format provided",
      });
    }
  }

  // Fallback for regular Errors
  const isClientError = /not found|cannot|invalid|already|inactive|past|belong/i.test(err.message);
  const status = isClientError ? 400 : 500;

  console.error("[ServerError]", err);

  return res.status(status).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
};

module.exports = errorHandler;
