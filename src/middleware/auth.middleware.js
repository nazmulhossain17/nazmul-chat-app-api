import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // Get the token from the request cookies
        if (!token) {
            return res.status(401).json({ message: "Not authorized, token not found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Not authorized, token invalid" });
        }

        const user = await userModel.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}