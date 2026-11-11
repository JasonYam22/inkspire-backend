import rateLimit from "express-rate-limit";

const skipInTesting = () =>
  process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true";

// Limit how many API requests can come from one IP address.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  skip: skipInTesting,
  message: { errorMessage: "Too many requests, please try again later." },
});

// Slow down repeated login attempts.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  skip: skipInTesting,
  message: {
    errorMessage: "Too many login attempts, please try again in 15 minutes.",
  },
});

// Limit requests to signup and forgot password.
export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  limit: 15,
  skip: skipInTesting,
  message: {
    errorMessage: "Too many email requests, please try again in 30 minutes.",
  },
});
