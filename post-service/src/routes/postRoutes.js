import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
} from "../controllers/postController.js";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateRequest);
router.post("/create-post", createPost);
router.get("/get-posts", getPosts);
router.get("/get-post/:id", getPost);
router.delete("/del-post/:id", deletePost);

export default router;
