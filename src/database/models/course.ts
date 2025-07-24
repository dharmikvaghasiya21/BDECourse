import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    categoryType: { type: mongoose.Schema.Types.ObjectId, ref: "category" },

    feature: { type: Boolean, default: false },
    action: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const courseModel = mongoose.model("course", courseSchema);