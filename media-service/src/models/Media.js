import mongoose from "mongoose";

const mediaSchema = mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserActivation,
      required: true,
    },
  },
  { timeStamp: true }
);

export const Media = mongoose.model("Media", mediaSchema);
