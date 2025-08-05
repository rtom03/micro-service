import express from "express";
import { searcPostController } from "../controllers/searchController.js";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateRequest);

router.get("/posts", searcPostController);

export default router;
