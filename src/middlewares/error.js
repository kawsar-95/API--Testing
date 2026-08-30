'use strict';

const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler — converts thrown errors into JSON responses with the
// correct HTTP status codes per the assignment spec.
const errorHandler = (err, _req, res, _next) => {
  // Sequelize validation errors (e.g. unique-constraint failure).
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    return res.status(409).json({
      message: `Duplicate value for ${field}.`,
    });
  }
  if (err.name === 'SequelizeValidationError') {
    const message =
      err.errors && err.errors[0]
        ? err.errors[0].message
        : 'Validation error.';
    return res.status(400).json({ message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  if (statusCode >= 500) {
    console.error('[error]', err);
  }
  return res.status(statusCode).json({ message });
};

module.exports = { notFoundHandler, errorHandler };
