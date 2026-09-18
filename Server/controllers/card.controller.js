import { Card } from "../models/card.js";
import { List } from "../models/list.js";

export const createCard = async (req, res) => {
    try {
        const { title, description, listId } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required", success: false });
        }
        if (description === undefined) description = "";

        const existingCards = await Card.countDocuments({ listId });

        const newCard = await Card.create({
            title,
            description,
            listId,
            order: existingCards,
            createdBy: req.userId
        });
        return res.status(201).json({ message: "Card created successfully", success: true, card: newCard });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const updateCard = async (req, res) => {
    try {
        const { cardId, listId } = req.params;
        const { title, description } = req.body;

        const list = await List.findById(listId);
        if (!list) {
            return res.status(400).json({ message: "List not found", success: false });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(400).json({ message: "Card not found", success: false });
        }

        if (card.listId.toString() !== listId) {
            return res.status(400).json({ message: "This card doesn't belong to this list", success: false });
        }

        if (title !== undefined) card.title = title;
        if (description !== undefined) card.description = description;
        await card.save();

        return res.status(200).json({ message: "Card updated successfully", success: true, card });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export const moveCard = async (req, res) => {
    try {

    } catch (error) {

    }
}

export const deleteCard = async (req, res) => {
    try {

    } catch (error) {

    }
}