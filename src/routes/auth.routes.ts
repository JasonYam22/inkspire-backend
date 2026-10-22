import { Router } from "express";
import {
  signup,
  login,
  verifyEmail,
  verifySession,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
} from "../controller/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { loginLimiter, emailLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/signup", emailLimiter, signup);
router.post("/login", loginLimiter, login);
router.get("/verify-email", verifyEmail);
router.get("/verify", isAuthenticated, verifySession);
router.post("/forgot-password", emailLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;