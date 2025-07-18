import mongoose from "mongoose";
import { ADMIN_ROLES } from "../../common";

const usersSchema = new mongoose.Schema({

    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String, unique: true },
    address: { type: String },
    email: { type: String, unique: true },
    type: { type: String },
    link: { type: String },
    role: { type: String, enum: ADMIN_ROLES, default: 'user' },

    isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const userModel = mongoose.model("users", usersSchema);
