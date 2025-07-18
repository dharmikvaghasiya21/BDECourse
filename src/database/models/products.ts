import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({

    image: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }

}, { timestamps: true, versionKey: false });

export const productModel = mongoose.model("Products", productsSchema);