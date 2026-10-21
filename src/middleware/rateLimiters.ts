import rateLimit from "express-rate-limit";

const skipInTesting = () =>
  process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: skipInTesting,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again in 15 minutes." },
  skip: skipInTesting,
});

// Routes that send an email (forgot password, resend verification)
export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Too many email requests, please try again in 30 minutes." },
  skip: skipInTesting,
});