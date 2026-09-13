import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        // Extracting user details from the req.body
        const { userName, email, password, googleId } = req.body;
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        // Checking if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists", success: false });
        }

        // Hashing the password and creating a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
            googleId
        });

        // Assigning a JWT token and sending it as cookie in the response
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(201).cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" }).json({ message: "User created successfully", success: true });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Something is missing", success: false });
        };

        // Checking if the user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password", success: false });
        };

        // Checking if the password is correct
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect email or password", success: false });
        };

        // Assigning a JWT token and sending it as cookie in the response
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        user = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            googleId: user.googleId
        };

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" }).json({ message: "Login successful", success: true, user });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export const logout = async (req, res) => {
    try {
        // Clearing the token cookie to log the user out
        return res.status(200).cookie("token", '', { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}