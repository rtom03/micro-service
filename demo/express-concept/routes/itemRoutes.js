import express from "express";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";

const items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
];

const router = express.Router();

router.get(
  "/items",
  asyncHandler(async (req, res) => {
    res.json(items);
  })
);

router.post(
  "/create-item",
  asyncHandler(async (req, res) => {
    if (!req.body.name) throw new ApiError("Item name is required", 400);
    const newItems = {
      id: items.length + 1,
      name: req.body.name,
    };
    items.push(newItems);
    res.status(201).json(newItems);
  })
);

export default router;
