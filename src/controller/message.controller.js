import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";


export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await userModel.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get messages between two users
 */
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 }); // Sort messages in ascending order

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Send a new message
 */
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = null;

        // Upload image to Cloudinary if provided
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, { resource_type: "auto" });
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload failed: ", uploadError);
                return res.status(500).json({ error: "Image upload failed" });
            }
        }

        // Create new message document
        const newMessage = new messageModel({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Emit message to receiver if online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};