import express from "express";
import { getMessages, getUsersForSidebar, sendMessage } from "../controller/message.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";
const message = express.Router();

message.get("/users", protectRoute, getUsersForSidebar);
message.get("/:id", protectRoute, getMessages);

message.post("/send/:id", protectRoute, sendMessage);

export default message;