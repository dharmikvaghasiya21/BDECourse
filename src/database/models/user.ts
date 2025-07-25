import mongoose from "mongoose";
import { USER_ROLE } from "../../common";
import { required } from "joi";

const userSchema = new mongoose.Schema({

    image: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },

    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },

    
    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: 'user' },
}, { timestamps: true, versionKey: false });

export const userModel = mongoose.model("user", userSchema);
