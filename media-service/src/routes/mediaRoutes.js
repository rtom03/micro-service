import express from "express";
import multer from "multer";
import authenticateRequest from "../middleware/authMiddleware.js";
import { getAllMedia, iUploadMedia } from "../controller/mediaController.js";

const router = express.Router();

//configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

router.post(
  "/upload",
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err);
        return res
          .status(400)
          .json({ success: false, message: "Multer error" });
      } else if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Unknown error occured" });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file found!" });
      }
      next();
    });
  },
  iUploadMedia
);

router.get("/get-media", authenticateRequest, getAllMedia);
export default router;
