import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    image: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },

    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "course", default: null }],

    refrance: { type: String, },
    education: { type: String },
    dob: { type: Date },

    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },

    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: 'user' },
}, { timestamps: true, versionKey: false });

export const userModel = mongoose.model("user", userSchema);
