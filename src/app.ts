
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors"
import { config } from "./config/index.js";
import authRouter from "./routes/auth.routes.js"
import ideaRouter from "./routes/tattoo-idea.routes.js"
import { errorHandler, notFoundHandler } from "./error-handling/index.js";



const app = express();
config(app)
const PORT = process.env.PORT || 5005;

app.use("/api/auth", authRouter)
app.use("/api/ideas", ideaRouter)

// Test route
app.get("/", (req, res) => {
    res.json({message: "Server is running!"})
})

// set up custom error handling
app.use(notFoundHandler);
app.use(errorHandler)

app.listen(PORT, () => {

console.clear();

    console.log(`Server is running on http://localhost:${PORT}`)
})