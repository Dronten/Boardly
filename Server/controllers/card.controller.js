import { Card } from "../models/card.js";

export const createCard = async (req, res) => {
    try {
        const { title, description, listId } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required", success: false });
        }
        if (description === undefined) description = "";
        const newCard = await Card.create({
            title,
            description,
            listId,
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

    } catch (error) {

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