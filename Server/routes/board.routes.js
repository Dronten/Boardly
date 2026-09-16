import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createBoard, getBoards, getBoardById, updateBoard, addMember, removeMember, deleteBoard } from "../controllers/board.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createBoard);
router.get("/", isAuthenticated, getBoards);
router.get("/:boardId", isAuthenticated, getBoardById);
router.patch("/:boardId", isAuthenticated, updateBoard);
router.delete("/:boardId", isAuthenticated, deleteBoard);
router.post("/:boardId/members", isAuthenticated, addMember);
router.delete("/:boardId/members/:userId", isAuthenticated, removeMember);

export default router;