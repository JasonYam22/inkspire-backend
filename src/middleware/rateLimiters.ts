<<<<<<< Updated upstream
import rateLimit from "express-rate-limit";

const skipInTesting = () =>
  process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  skip: skipInTesting,
  message: { errorMessage: "Too many requests, please try again later." },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  skip: skipInTesting,
  message: {
    errorMessage: "Too many login attempts, please try again in 15 minutes.",
  },
});

// Routes that send an email (forgot password, resend verification)
export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, //
  limit: 15,
skip: skipInTesting,
  message: {
    errorMessage: "Too many email requests, please try again in an hour.",
  },
=======
import { rateLimit } from "express-rate-limit";

const skipInTests = () => process.env.NODE_ENV === "test";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 15,                
  message: { errorMessage: "Too many attempts, please try again in 15 minutes." },
  skip: skipInTests,
});

export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  limit: 15,              
  message: { errorMessage: "Too many requests, please try again later." },
  skip: skipInTests,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300, // generous: a normal user makes many requests per page
  message: { errorMessage: "Too many requests, please slow down." },
  skip: skipInTests,
>>>>>>> Stashed changes
});