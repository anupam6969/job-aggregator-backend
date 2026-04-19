import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  jobs,
  getLatestJobs,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", protect, jobs);
router.get("/latest", protect, getLatestJobs);

export default router;
