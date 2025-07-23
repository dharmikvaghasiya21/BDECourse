import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: { type: String },
    image: { type: String, required: true },
    youtubeLink: { type: String },
    isDeleted: { type: Boolean, default: false },
    action: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

export const bannerModel = mongoose.model("banner", bannerSchema);
