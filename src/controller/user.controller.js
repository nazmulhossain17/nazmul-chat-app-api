import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({ name, email, password: hashedPassword });
        if (user) {
            generateToken(user._id, res);
            await user.save();
            res.status(201).json({ message: "User created successfully", user: { _id: user._id, name: user.name, email: user.email } });
        } else {
            res.status(400).json({ error: "User not created" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }
        generateToken(user._id, res);
        res.status(200).json({ message: "User logged in successfully", user: { _id: user._id, name: user.name, email: user.email, profilePic: user.profilePic } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            return res.status(400).json({ error: "Profile picture is required" });
        }
        const updateResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await userModel.findByIdAndUpdate(userId, { profilePic: updateResponse.secure_url }, { new: true });

        res.status(200).json({ message: "User profile updated successfully", user: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, profilePic: updatedUser.profilePic } });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}