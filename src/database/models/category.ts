import { required, string } from "joi";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  priority: { type: Number, default: 0 },
  feature: { type: Boolean, default: false },
  action: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const categoryModel = mongoose.model("category", categorySchema);
