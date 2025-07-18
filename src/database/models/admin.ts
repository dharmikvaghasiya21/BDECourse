// models/user.model.ts
import { required } from "joi";
import mongoose from "mongoose";
import { ADMIN_ROLES } from "../../common";

const adminSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },

    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: ADMIN_ROLES, default: 'admin' },
},
    { timestamps: true, versionKey: false });

export const adminModel = mongoose.model("admin", adminSchema);
