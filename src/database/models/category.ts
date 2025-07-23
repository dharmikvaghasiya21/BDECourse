import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  image: { type: String },
  categoryName: { type: String, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  feature: { type: String, enum: ["regular", "trending", "new"], default: "regular" },
  action: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const categoryModel = mongoose.model("category", categorySchema);
