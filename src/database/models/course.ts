import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: { type: String },
    image: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    categoryType: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    feature: { type: Boolean, default: false },
    action: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const courseModel = mongoose.model("course", courseSchema);