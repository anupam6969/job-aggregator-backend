// routes/adminRoutes.js
import express from "express";
import {
  getStats,
  getAllJobs,
  deleteJob,
  getAllUsers,
  banUser,
  fetchJobsManually
} from "../controllers/adminController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Dashboard
router.get("/stats", protect, isAdmin, getStats);

// Jobs
router.get("/jobs", protect, isAdmin, getAllJobs);
router.delete("/job/:id", protect, isAdmin, deleteJob);

// Users
router.get("/users", protect, isAdmin, getAllUsers);
router.put("/user/ban/:id", protect, isAdmin, banUser);

// Fetch Jobs
router.post("/fetch", protect, isAdmin, fetchJobsManually);

export default router;