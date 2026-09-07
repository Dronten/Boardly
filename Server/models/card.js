import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    title: { required: true, type: String },
    description: { required: false, type: String },
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
        required: true
    },
    order: { type: Number, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });

export const Card = mongoose.model("Card", cardSchema);