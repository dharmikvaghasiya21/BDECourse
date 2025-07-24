import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  image: { type: String, required: true },
  categoryName: { type: String, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  // priority: { type: Number, default: 0 },
  feature: { type: Boolean, default: false },
  action: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const categoryModel = mongoose.model("category", categorySchema);
