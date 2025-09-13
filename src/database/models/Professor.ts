import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema({

    image: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String, required: true },

    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },

    role: { type: String },
    refrance: { type: String, },
    education: { type: String },
    dob: { type: Date },

    isDeleted: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });

export const ProfessorModel = mongoose.model("Professor", ProfessorSchema);
