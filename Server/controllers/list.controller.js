import { List } from "../models/list.js";
import { Board } from "../models/board.js";
import { Card } from "../models/card.js";

export const createList = async (req, res) => {
    try {
        const { title } = req.body;
        const { boardId } = req.params;

        if (!title) {
            return res.status(400).json({ message: "Title is required", success: false });
        }

        if (!boardId) {
            return res.status(400).json({ message: "Board ID is required", success: false });
        }

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(400).json({ message: "Board not found", success: false });
        }

        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        }

        const existingListsCount = await List.countDocuments({ boardId });
        const newList = await List.create({
            title,
            boardId,
            order: existingListsCount
        });

        return res.status(201).json({
            message: "List created successfully",
            success: true,
            list: newList
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const updateList = async (req, res) => {
    try {
        const { listId, boardId } = req.params;
        const { title, order } = req.body;

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }

        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        };

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: "List not found", success: false });
        }

        if (list.boardId.toString() !== boardId) {
            return res.status(404).json({ message: "This list doesn't belong to this board", success: false });
        }

        if (title !== undefined) list.title = title;
        if (order !== undefined) list.order = order;
        await list.save();

        return res.status(200).json({ message: "List updated successfully", success: true, list });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const removeList = async (req, res) => {
    try {
        const { listId, boardId } = req.params;

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }
        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        }

        const list = await List.findById({ listId });
        if (!list) {
            return res.status(404).json({ message: "List not found", success: false });
        }

        if (list.boardId.toString() !== boardId) {
            return res.status(404).json({ message: "This list doesn't belong to this board", success: false });
        }

        await Card.deleteMany({ listId });
        await List.findByIdAndDelete(listId);

        return res.status(200).json({ message: "List deleted successfully", success: true });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}