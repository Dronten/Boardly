import { User } from "../models/user.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
    try {
        const { userName, email, password, googleId } = req.body;
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            userName,
            email,
            password: hashedPassword,
            googleId
        });

        return res.status(201).json({ message: "User created successfully", success: true });

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

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password", success: false });
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect email or password", success: false });
        };

        user = {
            userName: user.userName,
            email: user.email,
            password: user.password,
            googleId: user.googleId
        };
        return res.status(200).json({ message: "Login successful", success: true, user });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export const logout = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}