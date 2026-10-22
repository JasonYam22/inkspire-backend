
import "dotenv/config";
import express from "express";
import { config } from "./config/index.js";
import authRouter from "./routes/auth.routes.js"
import ideaRouter from "./routes/tattoo-idea.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler, notFoundHandler } from "./error-handling/index.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import cookieParser from "cookie-parser";

const app = express();
config(app)
const PORT = process.env.PORT || 5005;
app.use(cookieParser())

app.use("/api", globalLimiter);
app.use("/api/auth", authRouter)
app.use("/api/ideas", ideaRouter)
app.use("/api/users", userRouter)

// Test route
app.get("/", (req, res) => {
    res.json({message: "Server is running!"})
})

// set up custom error handling
app.use(notFoundHandler);
app.use(errorHandler)

export default app;