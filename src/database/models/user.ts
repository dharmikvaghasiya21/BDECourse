import mongoose from "mongoose";
import { USER_ROLE } from "../../common";
import { required } from "joi";

const studentsSchema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },

    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(USER_ROLE), default: 'user' },
}, { timestamps: true, versionKey: false });

export const studentsModel = mongoose.model("students", studentsSchema);
