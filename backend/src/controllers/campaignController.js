/**
 * Campaign Controller - Manages marketing campaigns and merchant governance
 */

import Campaign from "../models/Campaign.js";
import { isDbConnected } from "../config/db.js";
import { mockPaytmService } from "../services/mockPaytmService.js";

const mockCampaigns = [
  {
    id: "camp_001",
    title: "Weekend Sweet Treats 15% Off",
    status: "Active",
    channel: "WhatsApp",
    targetAudience: "Repeat Customers (Last 30 Days)",
    sentCount: 340,
    conversionRate: "14.2%",
  },
  {
    id: "camp_002",
    title: "Monsoon Special Chai Combo",
    status: "Draft",
    channel: "SMS",
    targetAudience: "Nearby Walk-in Shoppers",
    sentCount: 0,
    conversionRate: "0%",
  },
];

/**
 * GET /api/campaigns
 * Returns list of merchant campaigns
 */
export const getCampaigns = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const dbCampaigns = await Campaign.find().sort({ createdAt: -1 });
      if (dbCampaigns && dbCampaigns.length > 0) {
        return res.status(200).json({
          success: true,
          data: dbCampaigns,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: mockCampaigns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/campaigns/approve
 * Human-in-the-loop: Approves an AI-generated campaign and executes mock dispatch
 */
export const approveCampaign = async (req, res, next) => {
  try {
    const {
      ticketId,
      title = "AI Merchant Boost Campaign",
      channel = "WhatsApp",
      targetAudience = "Repeat Shoppers",
      targetCount = 5,
      messageDraft = "",
      expectedLift = "+20%",
    } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Missing ticketId for campaign approval.",
      });
    }

    console.log(`\n📢 [Campaign Controller] Approving campaign ticket: ${ticketId}`);

    // Trigger mock broadcast service (WhatsApp Cloud API + Paytm Coupon)
    const receipt = await mockPaytmService.executeBroadcast({
      ticketId,
      title,
      channel,
      targetAudience,
      targetCount,
      messageDraft,
    });

    const campaignData = {
      campaignId: `camp_${Date.now()}`,
      title,
      channel: "WhatsApp",
      status: "Active",
      targetAudience,
      messageContent: messageDraft,
      discountPercentage: 15,
      sentCount: targetCount || 5,
      conversionRate: "Pending (Monitoring)",
      budget: (targetCount || 5) * 0.48,
      roi: expectedLift || "+20%",
    };

    // Save to MongoDB if connected
    if (isDbConnected()) {
      try {
        const savedCampaign = await Campaign.create(campaignData);
        campaignData._id = savedCampaign._id;
      } catch (dbErr) {
        console.warn("Could not persist to MongoDB, using fallback memory store:", dbErr.message);
      }
    }

    // Always update in-memory store for immediate display
    mockCampaigns.unshift({
      id: campaignData.campaignId,
      title: campaignData.title,
      status: "Active",
      channel: campaignData.channel,
      targetAudience: campaignData.targetAudience,
      sentCount: campaignData.sentCount,
      conversionRate: "Tracking...",
      receipt,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign approved and broadcasted successfully via WhatsApp!",
      data: {
        campaign: campaignData,
        receipt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/campaigns/reject
 * Human-in-the-loop: Merchant declines or cancels the campaign proposal
 */
export const rejectCampaign = async (req, res, next) => {
  try {
    const { ticketId, reason = "Dismissed by merchant" } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "Missing ticketId for campaign rejection.",
      });
    }

    console.log(`❌ [Campaign Controller] Merchant rejected ticket: ${ticketId}. Reason: ${reason}`);

    return res.status(200).json({
      success: true,
      message: "Campaign proposal dismissed safely.",
      data: {
        ticketId,
        status: "REJECTED",
        reason,
        dismissedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
