import { chown } from 'fs';
import mongoose from 'mongoose'

const studentsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const studentsModel = mongoose.model("students", studentsSchema)