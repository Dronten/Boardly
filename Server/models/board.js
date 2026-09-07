import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            required: true
        }
    }]
}, { timestamps: true });

export const Board = mongoose.model("Board", boardSchema);