import { required } from "joi";
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    // status: { type: String, default: "Pending" },

}, { timestamps: true, versionKey: false });

export const orderModel = mongoose.model("Order", orderSchema);
