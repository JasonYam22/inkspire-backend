import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma.js";
import { sendEmail } from "../config/mailer.js";
import googleClient from "../config/google.js";
import { DEMO_EMAIL } from "../config/demo.js";

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
const passwordError =
  "Password not strong enough. 10 characters, one uppercase, one lowercase, and one number needed.";
const googleRedirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  process.env.GOOGLE_REDIRECT_URL ||
  `http://localhost:${process.env.PORT || 5005}/api/auth/google/callback`;

// Create an account and send a link to confirm the email address.
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, username, role = "USER" } = req.body ?? {};

  if (
    typeof email !== "string" ||
    !email ||
    typeof password !== "string" ||
    !password
  ) {
    res
      .status(400)
      .json({ errorMessage: "Both email and password are mandatory." });
    return;
  }

  if (!passwordRegex.test(password)) {
    res.status(400).json({
      errorMessage: passwordError,
      field: "password",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res
      .status(400)
      .json({ errorMessage: "Please provide a valid email address." });
    return;
  }

  if (email.toLowerCase() === DEMO_EMAIL) {
    res
      .status(400)
      .json({ errorMessage: "This email is reserved for the demo account." });
    return;
  }

  // Only accept the two account types shown on the signup form.
  if (role !== "USER" && role !== "ARTIST") {
    res.status(400).json({ errorMessage: "Choose a valid account type." });
    return;
  }

  try {
    const foundUser = await prisma.user.findUnique({ where: { email } });
    if (foundUser) {
      res
        .status(400)
        .json({ errorMessage: "User already exists with this email." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      newUser.email,
      "Verify your Inkspire account",
      `<p>Welcome to Inkspire! Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    );

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

// Check the email and password, then send back a login token.
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    !email ||
    typeof password !== "string" ||
    !password
  ) {
    res
      .status(400)
      .json({ errorMessage: "Both email and password are required." });
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

    if (!foundUser.isEmailVerified) {
      res.status(403).json({
        errorMessage: "Please verify your email address before logging in.",
      });
      return;
    }

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
};

// Confirm the email address using the link sent during signup.
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      res
        .status(400)
        .json({ errorMessage: "Invalid or expired verification token." });
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
};

// Return the user details from the checked login token.
export const verifySession = (req: Request, res: Response) => {
  res.status(200).json({ payload: req.payload });
};

// Send a password reset link if the account exists.
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body ?? {};

  if (typeof email !== "string" || !email) {
    res.status(400).json({ errorMessage: "Email is required" });
    return;
  }

  try {
    const foundUser = await prisma.user.findUnique({ where: { email } });
    if (!foundUser || foundUser.email === DEMO_EMAIL) {
      res
        .status(200)
        .json({ message: "We sent a reset link to the email, if it exists" });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendEmail(
      foundUser.email,
      "Reset your password",
      `<p>Click here to reset your password. It will expire in 1 hour</p> 
      <a href="${resetUrl}">Reset Password</a>`,
    );

    res
      .status(200)
      .json({ message: "We sent a reset link to the email, if it exists" });
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ message: "We sent a reset link to the email, if it exists" });
  }
};

// Check the reset link, save the new password, and clear the reset token.
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password, token } = req.body ?? {};

  if (
    typeof password !== "string" ||
    !password ||
    typeof token !== "string" ||
    !token
  ) {
    res.status(400).json({ message: "Password and token are required" });
    return;
  }

  if (!passwordRegex.test(password)) {
    res.status(400).json({
      errorMessage: passwordError,
      field: "password",
    });
    return;
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const foundUser = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!foundUser) {
      res
        .status(400)
        .json({ errorMessage: "This link is invalid or expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: foundUser.id,
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { gt: new Date() },
      },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    res
      .status(200)
      .json({ message: "Password got updated. You can log in now" });
  } catch (error) {
    next(error);
  }
};

// Send the browser to Google to sign in.
export const googleAuth = (req: Request, res: Response) => {
  const authorizeUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile"],
    redirect_uri: googleRedirectUri,
  });
  res.redirect(authorizeUrl);
};

// Check Google's response and send the user back to Inkspire.
export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).json({ errorMessage: "Authorization code not found." });
    return;
  }

  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: googleRedirectUri,
    });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const username = payload?.name;

    if (!email) {
      res
        .status(400)
        .json({ errorMessage: "The google account does not provide an email" });
      return;
    }

    if (!payload.email_verified) {
      res.status(400).json({ errorMessage: "Google email is not verified" });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username: username || "Google User",
          password: "",
          isEmailVerified: true,
        },
      });
    } else if (!user.isEmailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          password: "",
          resetPasswordExpiry: null,
          resetPasswordToken: null,
        },
      });
    }

    const jwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const authToken = jwt.sign(jwtPayload, process.env.TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    res.redirect(`${process.env.CLIENT_URL}/login?token=${authToken}`);
  } catch (error) {
    next(error);
  }
};
