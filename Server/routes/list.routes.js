import express from "express";
import { createList, updateList, removeList } from "../controllers/list.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/:boardId", isAuthenticated, createList);
router.patch("/:boardId/:listId", isAuthenticated, updateList);
router.delete("/:boardId/:listId", isAuthenticated, removeList);

export default router;