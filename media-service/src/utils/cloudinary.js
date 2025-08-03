import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "djnxc7hp4",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToMedia = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

export { uploadToMedia };
