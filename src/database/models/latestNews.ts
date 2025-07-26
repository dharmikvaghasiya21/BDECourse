import { title } from "process";

const mongoose = require('mongoose');

const latestNewsSchema = new mongoose.Schema({
    thumbnail: { type: String },
    image: { type: String },

    title: { type: String, required: true },
    subtitle: { type: String, required: true },

    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });

export const latestNewsModel = mongoose.model('latestNews', latestNewsSchema);