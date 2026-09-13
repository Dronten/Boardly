import { Board } from "../models/board.js";

export const createBoard = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required", success: false });
        };

        const newBoard = await Board.create({
            title,
            createdBy: req.userId,
            members: [{ userId: req.userId, role: "admin" }]
        });

        return res.status(201).json({
            message: "Board created successfully",
            success: true,
            board: newBoard
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getBoards = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getBoardById = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const updateBoard = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const addMember = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const removeMember = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const deleteBoard = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}