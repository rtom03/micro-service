import express from "express";
import { registerUser } from "../controllers/identity-controlerr.js";

export const router = express.Router();

router.post("/sign-up", registerUser);
