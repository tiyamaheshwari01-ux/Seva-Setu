/**
 * Mock Partner Service - External Integrations Simulation
 * Simulates WhatsApp Business Cloud API & Paytm Merchant Promotional Coupons
 */

export const mockPaytmService = {
  /**
   * Generate a unique promotional coupon backed by Paytm Merchant Engine
   */
  generatePaytmCoupon: ({ campaignTitle = "Flash Sale", discountPercent = 15 } = {}) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `SEVA${discountPercent}_${randomSuffix}`;
    const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days validity

    return {
      couponCode: code,
      discount: `${discountPercent}% OFF`,
      provider: "Paytm Merchant Growth Engine",
      validUntil: expiryDate.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      minOrderValue: 250,
      cashbackEligible: true,
      terms: "Valid on orders above ₹250. Max discount ₹100 via Paytm UPI.",
    };
  },

  /**
   * Simulate bulk broadcast dispatch via Meta WhatsApp Business Cloud API
   */
  executeBroadcast: async ({
    ticketId,
    title,
    channel = "WhatsApp",
    targetAudience = "Repeat Customers",
    targetCount = 5,
    messageDraft,
  }) => {
    // Simulate short network latency for provider dispatch
    await new Promise((resolve) => setTimeout(resolve, 600));

    const broadcastId = `bcast_${Date.now()}`;
    const coupon = mockPaytmService.generatePaytmCoupon({ campaignTitle: title, discountPercent: 15 });

    return {
      success: true,
      broadcastId,
      ticketId,
      status: "DELIVERED",
      channel: channel === "WhatsApp" ? "WhatsApp Business Cloud API" : channel,
      provider: "Meta WhatsApp Cloud API (Simulated)",
      recipientsTargeted: targetCount || 5,
      recipientsDelivered: targetCount || 5,
      deliveryRate: "100%",
      readRate: "94.2%",
      costPerMessage: "₹0.48",
      totalCost: `₹${((targetCount || 5) * 0.48).toFixed(2)}`,
      couponGenerated: coupon,
      dispatchedAt: new Date().toISOString(),
      messageSnippet: messageDraft ? messageDraft.substring(0, 100) + "..." : "Promotional message broadcasted.",
    };
  },
};

export default mockPaytmService;
