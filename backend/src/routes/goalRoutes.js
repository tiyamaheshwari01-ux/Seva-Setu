import { Router } from "express";
import { getDashboardMetrics, analyzeGoal } from "../controllers/goalController.js";

const router = Router();

// Routes
router.get("/metrics", getDashboardMetrics);
router.post("/analyze", analyzeGoal);

export default router;
