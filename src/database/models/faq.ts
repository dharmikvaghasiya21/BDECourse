import { FAQ_CATEGORIES } from "../../common";

const mongoose = require('mongoose')

const faqSchema: any = new mongoose.Schema({
    question: { type: String },
    answer: { type: String },
    priority: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const faqModel = mongoose.model('faq', faqSchema);
