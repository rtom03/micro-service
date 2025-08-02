import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    createdAt: {
      type: Date.now,
      default: Date.now,
    },
  },
  { timestamps: true }
);

postSchema.index({ content: "text" });
