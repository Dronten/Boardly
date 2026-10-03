import { Card } from "../models/card.js";
import { List } from "../models/list.js";
import { Board } from "../models/board.js";

export const createCard = async (req, res) => {
    try {
        const { title, description = "" } = req.body;
        const { listId } = req.params;
        if (!title) {
            return res.status(400).json({ message: "Title is required", success: false });
        }

        if (!listId) {
            return res.status(400).json({ message: "List Id is required", success: false });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(400).json({ message: "List not found", success: false });
        }

        const board = await Board.findById(list.boardId);
        if (!board) {
            return res.status(400).json({ message: "Board not found", success: false });
        }

        const isMember = board.members.some((member) => member.userId.toString() === req.userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied", success: false });
        }

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

        const board = await Board.findById(list.boardId);
        if (!board) {
            return res.status(400).json({ message: "Board not found", success: false });
        }

        const isMember = board.members.some((member) => member.userId.toString() === req.userId)
        if (!isMember) {
            return res.status(403).json({ message: "Access denied", success: false });
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
        const { cardId, listId } = req.params;
        const { destinationListId, order: newOrder } = req.body;

        if (newOrder === undefined) {
            return res.status(400).json({ message: "Order is required", success: false });
        };

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

        const board = await Board.findById(list.boardId);
        if (!board) {
            return res.status(400).json({ message: "Board not found", success: false });
        }

        const isMember = board.members.some((member) => member.userId.toString() === req.userId)
        if (!isMember) {
            return res.status(403).json({ message: "Access denied", success: false });
        }

        // start here
        const oldOrder = card.order;
        const targetListId = destinationListId || listId;

        if (targetListId !== listId) {
            const destinationList = await List.findById(targetListId);
            if (!destinationList) {
                return res.status(404).json({ message: "Destination list not found", success: false });
            }
            if (destinationList.boardId.toString() !== list.boardId.toString()) {
                return res.status(400).json({ message: "Cannot move a card to a list on a different board", success: false });
            }
        };

        if (targetListId === listId) {

            //Same List re-order
            if (newOrder > oldOrder) {
                await Card.updateMany(
                    { listId, order: { $gt: oldOrder, $lte: newOrder } }, { $inc: { order: -1 } }
                );
            } else if (newOrder < oldOrder) {
                await Card.updateMany(
                    { listId, order: { $gte: newOrder, $lt: oldOrder } }, { $inc: { order: 1 } }
                );
            }
        } else {
            //moving remaining cards up on older list
            await Card.updateMany(
                { listId, order: { $gt: oldOrder } }, { $inc: { order: -1 } }
            );
            //moving cards down on new list
            await Card.updateMany(
                { listId: targetListId, order: { $gte: newOrder } }, { $inc: { order: 1 } }
            );
            card.listId = targetListId;
        }

        card.order = newOrder;
        await card.save();

        return res.status(200).json({ message: "Card moved successfully", success: true, card });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export const deleteCard = async (req, res) => {
    try {
        const { cardId, listId } = req.params;

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

        const board = await Board.findById(list.boardId);
        if (!board) {
            return res.status(400).json({ message: "Board not found", success: false });
        }

        const isMember = board.members.some((member) => member.userId.toString() === req.userId)
        if (!isMember) {
            return res.status(403).json({ message: "Access denied", success: false });
        }

        await Card.findByIdAndDelete(cardId);
        await Card.updateMany(
            { listId: card.listId, order: { $gt: card.order } },
            { $inc: { order: -1 } }
        );

        return res.status(200).json({ message: "Card deleted successfully", success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}