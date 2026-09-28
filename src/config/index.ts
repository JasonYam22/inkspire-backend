import express from "express";
import type { Express } from "express";
import logger from "morgan";
import cors from "cors";

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware configuration
export const config = (app: Express) => {
  app.set("trust proxy", 1);

  // controls a very specific header to pass headers from the frontend
  app.use(
    cors({
      origin: [FRONTEND_URL],
    }),
  );

  // In development environment the app logs
  app.use(logger("dev"));

  // To have access to `body` property in the request
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  /* app.use(cookieParser()); */
};
