import express from "express";
import { upgradePlan } from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/upgrade", protect, upgradePlan);

export default router;