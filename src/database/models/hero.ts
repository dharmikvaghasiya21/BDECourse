// models/user.model.ts
import { required } from "joi";
import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
    title: { type: String },
    image: { type: String, required: true },
    youtubeLink: { type: String },
    isDeleted: { type: Boolean, default: false },
    action: { type: String, enum: ['active', 'inactive'], default: 'inactive', },
}, { timestamps: true, versionKey: false });

export const heroModel = mongoose.model("hero", heroSchema);
