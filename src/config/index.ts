import express from "express";
import type { Express, Request, Response } from "express";
import logger from "morgan";
import cors from "cors";

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware configuration
export const config = (app: Express) => {
  app.set("trust proxy", 1);

  // Allow browser requests from the frontend.
  app.use(
    cors({
      origin: [FRONTEND_URL],
    }),
  );

  // Keep tokens and OAuth codes in query strings out of request logs.
  logger.token<Request, Response>("path", (req) => req.originalUrl.split("?")[0]);
  app.use(logger(":method :path :status :response-time ms"));

  // Read JSON and form fields from request bodies.
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
