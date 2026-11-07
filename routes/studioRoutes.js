
import express from "express";

import {
  getAllStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
} from "../controllers/studioController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getAllStudios);
router.get("/:id", getStudioById);

// Protected Routes
router.post("/", authMiddleware, createStudio);
router.patch("/:id", authMiddleware, updateStudio);
router.delete("/:id", authMiddleware, deleteStudio);

export default router;
