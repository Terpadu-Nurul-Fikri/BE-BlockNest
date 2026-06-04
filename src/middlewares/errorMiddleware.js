import { Prisma } from "@prisma/client";

/**
 * 404 Not Found handler
 * Creates an error for routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler middleware
 * Handles all errors in the application and sends appropriate responses
 * Provides detailed error information in development, minimal info in production
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  }

  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma unique constraint violations
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      statusCode = 400;
      message = `${field} already exists`;
    }
    // Handle record not found
    else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    }
    // Handle Prisma foreign key constraint violations
    else if (err.code === "P2003") {
      statusCode = 400;
      message = "Invalid reference: related record does not exist";
    }
  }

  // Send error response
  res.status(statusCode).json({
    status: status,
    message: message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { notFound, errorHandler };