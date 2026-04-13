import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  jobs,
  getLatestJobs,
} from "../controllers/jobController.js";
import { checkBan } from "../middlewares/checkBan.js";

const router = express.Router();

router.get("/", protect, checkBan, jobs);
router.get("/latest", protect, checkBan, getLatestJobs);

export default router;