import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"; // Note the .js extension
import { connectDB } from "./lib/db.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use("/api/auth", authRoutes);
app.use('/api/message', messageRoute);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});