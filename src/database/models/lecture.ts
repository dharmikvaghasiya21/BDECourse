import { required } from "joi";
import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String, required: true    },
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "course" },
    youtubeLink: { type: String, required: true },
    priority: { type: Number, default: 0 },
    PDF: { type: String},
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const lectureModel = mongoose.model("lecture", lectureSchema);
