import express from "express";
import { uploadCourses, searchCourses, getCourses } from "../controllers/courseController.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route — fetch all courses (used by home page)
router.get("/", getCourses);

// Protected routes
router.post("/upload", authMiddleware, upload.single("file"), uploadCourses);
router.get("/search", authMiddleware, searchCourses);

export default router;