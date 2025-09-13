import { required } from "joi";
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: { type: String },
    image: { type: String, required: true },
    youtubeLink: { type: String},
    action: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const bannerModel = mongoose.model("banner", bannerSchema);
   