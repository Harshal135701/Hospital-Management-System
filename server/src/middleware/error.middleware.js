const ApiError = require('../utils/ApiError');
const { ZodError } = require('zod');

function errorHandler(err, req, res, next) {
  // If response has already started sending
  if (res.headersSent) {
    return next(err);
  }

  // 1. Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors ? err.errors.map(e => ({ path: e.path.join('.'), message: e.message })) : err.message
    });
  }

  // 2. Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }

  // 3. PostgreSQL Database Errors
  if (err.code) {
    const isProd = process.env.NODE_ENV === 'production';

    // Unique violation (e.g. duplicate donor_code, bag_barcode, requisition_number)
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Conflict: A record with this unique identifier already exists.',
        ...(isProd ? {} : { detail: err.detail })
      });
    }

    // Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference: The referenced record does not exist.',
        ...(isProd ? {} : { detail: err.detail })
      });
    }

    // Check constraint violation
    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        message: isProd ? 'Database check constraint failed.' : `Database constraint violation: ${err.message}`,
        ...(isProd ? {} : { constraint: err.constraint })
      });
    }

    // Custom PostgreSQL trigger RAISE EXCEPTION (error code P0001)
    if (err.code === 'P0001') {
      return res.status(422).json({
        success: false,
        message: err.message,
        ...(isProd ? {} : { hint: err.hint })
      });
    }
  }

  // Fallback 500 Internal Error
  console.error('[Unhandled Error]', err);
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProd ? 'Internal server error' : (err.message || 'Internal server error')
  });
}

module.exports = errorHandler;
