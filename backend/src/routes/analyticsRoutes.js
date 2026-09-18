import { Router } from "express";
import { getMonitoringAnalytics } from "../controllers/analyticsController.js";

const router = Router();

router.get("/monitoring", getMonitoringAnalytics);

export default router;
