import express from "express";
import { loginUser, registerUser } from "../controllers/identity-controlerr.js";

export const router = express.Router();

router.post("/sign-up", registerUser);
router.post("/sign-in", loginUser);
