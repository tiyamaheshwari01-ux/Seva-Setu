import { Router } from "express";
import {
  getCampaigns,
  approveCampaign,
  rejectCampaign,
} from "../controllers/campaignController.js";

const router = Router();

router.get("/", getCampaigns);
router.post("/approve", approveCampaign);
router.post("/reject", rejectCampaign);

export default router;
