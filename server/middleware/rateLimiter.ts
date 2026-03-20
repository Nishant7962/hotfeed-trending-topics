import rateLimit from 'express-rate-limit';

// General API: 200 req/min (relaxed for page loads with many cards)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMITED' },
});

// Search: 30 req/min
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many search requests', code: 'RATE_LIMITED' },
});

// View: 120 req/min at the Express level (5-second average).
// Fine-grained dedup (1 view per IP per post per 60s) is enforced
// via Redis SET NX inside the route handler itself.
export const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'View rate limit exceeded', code: 'RATE_LIMITED' },
});
