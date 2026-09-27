import express from "express";
import morgan from "morgan";
import prisma from "./prisma.js";
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({origin: process.env.CLIENT_URL}))
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.use("/api/auth", authRouter)

app.get("/", (req, res) => {
    res.json({message: "Server is running!"})
})

app.listen(PORT, () => {

console.clear();

    console.log(`Server is running on http://localhost:${PORT}`)
})