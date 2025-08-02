import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: "rtom",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadToMedia = (file) => {
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
