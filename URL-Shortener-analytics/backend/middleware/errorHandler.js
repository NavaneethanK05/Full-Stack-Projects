/**
 * Catches 404s for unknown routes.
 */
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

/**
 * Centralized error handler. Express recognizes this because it
 * has 4 arguments (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose duplicate key error (e.g. duplicate email or shortCode)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { notFound, errorHandler };
