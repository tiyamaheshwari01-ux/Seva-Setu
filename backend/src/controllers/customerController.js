/**
 * Customer Controller
 */

import { getCustomers } from "../services/analyticsService.js";

/**
 * GET /api/customers
 * Returns customer directory with segments, spend, and communication status
 */
export const listCustomers = async (req, res, next) => {
  try {
    const rawCustomers = await getCustomers();
    const enriched = rawCustomers.map((c) => ({
      ...c,
      optInWhatsApp: true,
      preferredChannel: "WhatsApp",
      avgOrderValue: c.visitCount ? Math.round(c.totalSpend / c.visitCount) : 450,
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};
