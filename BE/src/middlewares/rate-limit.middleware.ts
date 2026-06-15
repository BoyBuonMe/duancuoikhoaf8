import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Limiter for login attempts. Returns 429 with a JSON body once the
 * limit is reached so the global error contract stays consistent.
 */
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

/**
 * Limiter for registration. Stricter window because we expect very
 * few legitimate calls per IP per hour.
 */
export const registerLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many registration attempts. Please try again later." },
});
