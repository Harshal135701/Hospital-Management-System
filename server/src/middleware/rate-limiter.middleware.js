/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Provides rate limiting without external dependencies.
 */

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.maxRequests || 60;
  const keyGenerator = options.keyGenerator || ((req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
  const message = options.message || 'Too many requests. Please try again later.';

  const hits = new Map();

  // Periodic cleanup every minute
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = hits.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      hits.set(key, record);
    }

    record.count++;
    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        code: 'TOO_MANY_REQUESTS',
        message
      });
    }

    next();
  };
}

const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 5,      // 5 requests per minute per IP + account
  keyGenerator: (req) => `${req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || 'ip'}_${req.body?.email || 'email'}`,
  message: 'Too many login attempts. Please wait a minute before trying again.'
});

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.DB_NAME?.includes('test');
const globalApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: isTestEnv ? 5000 : 120,    // 120 requests per minute in prod, 5000 in test
  message: 'API rate limit exceeded. Please throttle your requests.'
});

module.exports = {
  createRateLimiter,
  loginRateLimiter,
  globalApiRateLimiter
};
