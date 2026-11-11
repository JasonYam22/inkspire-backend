import "dotenv/config";
import express from "express";
import { config } from "./config/index.js";
import authRouter from "./routes/auth.routes.js";
import ideaRouter from "./routes/tattoo-idea.routes.js";
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import { errorHandler, notFoundHandler } from "./error-handling/index.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();
// Add security headers to API responses.
app.use(helmet());
config(app);
app.use(cookieParser());

// Limit requests and send each URL to the right group of routes.
app.use("/api", globalLimiter);
app.use("/api/auth", authRouter);
app.use("/api/ideas", ideaRouter);
app.use("/api/users", userRouter);
app.use("/api", commentRouter);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// set up custom error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
