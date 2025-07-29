import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    senderId: { type: mongoose.Types.ObjectId, ref: "user" },
    receiverId: { type: mongoose.Types.ObjectId, ref: "user" },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const chatModel = mongoose.model("chat", chatSchema)
