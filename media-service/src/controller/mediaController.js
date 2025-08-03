import { Media } from "../models/Media.js";
import { uploadToMedia } from "../utils/cloudinary.js";

export const iUploadMedia = async (req, res) => {
  try {
    // console.log(req.file);
    if (!req.file) {
      return res.status(401).json({
        success: false,
        message: "No file found! Please add a file and try again",
      });
    }
    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;
    const cloudinaryUpload = await uploadToMedia(req.file);

    const newMedia = new Media({
      publicId: cloudinaryUpload.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUpload.secure_url,
      userId,
    });
    await newMedia.save();

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      mediaId: newMedia._id,
      url: newMedia.url,
    });
  } catch (error) {
    console.log(error);
  }
};
