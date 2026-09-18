import { Board } from "../models/board.js";
import { User } from "../models/user.js";
import { List } from "../models/list.js";
import { Card } from "../models/card.js";

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

            // the 3 default list will be added later
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getBoards = async (req, res) => {
    try {
        const boards = await Board.find({ "members.userId": req.userId });
        res.status(200).json({ message: "Board fetched successfully", success: true, boards });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getBoardById = async (req, res) => {
    try {
        const { boardId } = req.params;

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }

        const isMember = board.members.some((member) => member.userId.toString() === req.userId);
        if (!isMember) {
            return res.status(403).json({ message: "Access denied — you are not a member of this board", success: false });
        }
        return res.status(200).json({ success: true, board });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const updateBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required", success: false });
        }

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }

        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        };

        board.title = title;
        await board.save();

        return res.status(200).json({ message: "Board updated successfully", success: true, board });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const addMember = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false });
        }

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }

        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        };

        const userToBeAdded = await User.findOne({ email });
        if (!userToBeAdded) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const alreadyMember = board.members.some((member) => member.userId.toString() === userToBeAdded._id.toString());
        if (alreadyMember) {
            return res.status(400).json({ message: "User is already a member", success: false });
        }

        board.members.push({ userId: userToBeAdded._id, role: "member" });
        await board.save();

        return res.status(200).json({ message: "Member added successfully", success: true, board });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const removeMember = async (req, res) => {
    try {
        const { boardId, userId } = req.params;
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }

        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        };

        const isMember = board.members.some((member) => member.userId.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ message: "User is not a member", success: false });
        }

        board.members = board.members.filter((member) => member.userId.toString() !== userId);
        await board.save();

        return res.status(200).json({ message: "Member removed successfully", success: true, board });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const deleteBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found", success: false });
        }
        const isAdmin = board.members.some((member) => member.userId.toString() === req.userId && member.role === "admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin Access denied", success: false });
        }

        const lists = await List.find({ boardId });
        const listIds = lists.map((list) => list._id);

        await Card.deleteMany({ listId: { $in: listIds } });
        await List.deleteMany({ boardId });
        await Board.findByIdAndDelete(boardId);

        res.status(200).json({ message: "Board deleted successfully", success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}