import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createCard, updateCard, moveCard, deleteCard } from "../controllers/card.controller.js";

const router = express.Router();

router.post("/:listId", isAuthenticated, createCard);
router.patch("/:listId/:cardId", isAuthenticated, updateCard);
router.post("/:listId/:cardId/move", isAuthenticated, moveCard);
router.delete("/:listId/:cardId", isAuthenticated, deleteCard);

export default router;