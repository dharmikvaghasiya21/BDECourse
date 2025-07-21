import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: { type: String },
    image: { type: String },
    feature: { type: String, enum: ["regular", "trending", "new"], default: "regular" },
    categoryType: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    action: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const courseModel = mongoose.model("course", courseSchema);