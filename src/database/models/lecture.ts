import { required } from "joi";
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String },
    thumbnail: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    youtubeLink: { type: String, required:true},
    PDF:{ type: String, required:true},
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const courseModel = mongoose.model("course", courseSchema);