import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "category" }],
    priority: { type: Number, default: 0 },
    feature: { type: Boolean, default: false },
    action: { type: Boolean, default: false },
    locked: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const courseModel = mongoose.model("course", courseSchema);