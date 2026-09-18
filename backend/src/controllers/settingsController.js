/**
 * Settings Controller - Merchant Profile and AI Guardrails
 */

let merchantSettings = {
  storeName: "SevaSetu Gourmet Kirana",
  merchantName: "Merchant Owner",
  storeCity: "Mumbai, MH",
  whatsappNumber: "+91 98200 00123",
  whatsappStatus: "Connected (Verified Business)",
  paytmMerchantId: "PAYTM_SEVA_8831",
  paytmUpiId: "sevasetu@paytm",
  maxDiscountLimit: 20,
  maxWeeklyBroadcastsPerCustomer: 2,
  governanceMode: "Human-in-the-Loop Approval Required",
  aiModelEngine: "Gemini 3.8 Flash (Orchestrated)",
};

export const getSettings = (req, res) => {
  return res.status(200).json({
    success: true,
    data: merchantSettings,
  });
};

export const updateSettings = (req, res) => {
  merchantSettings = {
    ...merchantSettings,
    ...req.body,
  };
  return res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: merchantSettings,
  });
};
