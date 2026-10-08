import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { sendVerificationEmail } from "../config/mailer";

const router = Router();

// POST "/api/auth/signup" => receive user credentials and create the document in the DB
router.post("/signup", async (req: Request, res: Response, next) => {
  const { email, password, username, role } = req.body;

  // Server validators
  if (!email || !password) {
    res.status(400).json({ errorMessage: "Both email and password are mandatory." });
    return;
  }

  // Password strength
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      errorMessage: "Password not strong enough. 8 characters, one uppercase, one lowercase, and one number needed.",
      field: "password",
    });
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ errorMessage: "Please provide a valid email address." });
    return;
  }

  try {
    // Unique email check
    const foundUser = await prisma.user.findUnique({ where: { email } });
    if (foundUser) {
      res.status(400).json({ errorMessage: "User already exists with this email." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token and expiry (24h)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(newUser.email, verificationUrl);

    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (error) {
    next(error);
  }
});

// POST "/api/auth/login" => validate user credentials and create the JWT
router.post("/login", async (req: Request, res: Response, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ errorMessage: "Both email and password are required." });
    return;
  }

  try {
    const foundUser = await prisma.user.findUnique({ where: { email } });
    if (!foundUser) {
      res.status(400).json({ errorMessage: "Invalid email or password." });
      return;
    }

    const passwordCorrect = await bcrypt.compare(password, foundUser.password);
    if (!passwordCorrect) {
      res.status(400).json({ errorMessage: "Invalid email or password." });
      return;
    }

    // Optional: Block login if email is unverified
    // if (!foundUser.isEmailVerified) {
    //   res.status(403).json({ errorMessage: "Please verify your email address before logging in." });
    //   return;
    // }

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
      role: foundUser.role,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    res.status(200).json({ authToken, payload });
  } catch (error) {
    next(error);
  }
});

// GET "/api/auth/verify-email" => verify token from email link
router.get("/verify-email", async (req: Request, res: Response, next) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ errorMessage: "Verification token is required." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ errorMessage: "Invalid or expired verification token." });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
});

// GET "/api/auth/verify" => validate JWT token for active session
router.get("/verify", isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ payload: req.payload });
});

export default router;