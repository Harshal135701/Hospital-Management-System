
const ApiError = require('../utils/ApiError');
const { ZodError } = require('zod');

function errorHandler(err, req, res, next) {
  // Delegate if the response has already started.
  if (res.headersSent) {
    return next(err);
  }

  // 1. Zod validation errors
  if (err instanceof ZodError || err.name === 'ZodError' || err.issues) {
    const issues = err.issues || err.errors;

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Array.isArray(issues)
        ? issues.map((e) => ({
            path: Array.isArray(e.path) ? e.path.join('.') : '',
            message: e.message,
          }))
        : err.message,
    });
  }

  // 2. Custom application errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // 3. PostgreSQL errors
  if (err.code) {
    const isProd = process.env.NODE_ENV === 'production';

    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A record with this unique identifier already exists.',
        ...(!isProd ? { detail: err.detail } : {}),
      });
    }

    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'The referenced record does not exist.',
        ...(!isProd ? { detail: err.detail } : {}),
      });
    }

    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        message: isProd
          ? 'Database constraint failed.'
          : `Database constraint violation: ${err.message}`,
        ...(!isProd ? { constraint: err.constraint } : {}),
      });
    }

    if (err.code === '22P02') {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID or parameter format provided.',
      });
    }

    if (err.code === 'P0001') {
      return res.status(422).json({
        success: false,
        message: isProd
          ? 'The requested operation could not be completed.'
          : err.message,
        ...(!isProd && err.hint ? { hint: err.hint } : {}),
      });
    }
  }

  // 4. Unexpected errors
  console.error('[Unhandled Error]', err);

  const isProd = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    success: false,
    message: isProd
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
