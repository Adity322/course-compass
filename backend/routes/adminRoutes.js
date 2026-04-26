import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
    adminId: req.admin.id,
  });
});

export default router;