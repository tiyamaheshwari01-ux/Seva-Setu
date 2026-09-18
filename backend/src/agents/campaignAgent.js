/**
 * Campaign Agent
 * Drafts localized marketing copies, selects channels (WhatsApp/SMS), and defines audiences.
 */

export async function runCampaignAgent({ strategyResult, customers }) {
  const { strategyTitle, selectedProductNames, projectedLift } = strategyResult.data;

  const channel = "WhatsApp";
  let targetAudience = "";
  let messageDraft = "";
  let targetCount = 0;

  if (strategyTitle.includes("Weekend")) {
    const active = customers.filter((c) => ["VIP", "Regular"].includes(c.segment));
    targetCount = active.length;
    targetAudience = `Repeat & Regular Shoppers (${targetCount} customers)`;
    messageDraft = `Namaste! 🙏 Make your weekend special with 15% OFF on our premium Organic Masala Chai and Cardamom Cookies. Show this message at checkout or reply 'ORDER' to get home delivery! ☕🍪 Valid Sat & Sun.`;
  } else if (strategyTitle.includes("Winback")) {
    const atRisk = customers.filter((c) => c.segment === "At-Risk");
    targetCount = atRisk.length;
    targetAudience = `At-Risk Customers (${targetCount} shoppers)`;
    messageDraft = `Namaste from SevaSetu Store! 🌟 We miss seeing you. Here is an exclusive ₹100 Welcome-Back Voucher on your next visit for orders above ₹500. Valid till this Sunday! ✨`;
  } else {
    targetCount = customers.length;
    targetAudience = `All Registered Customers (${targetCount} shoppers)`;
    messageDraft = `Special Store Deal! 🛒 Buy 500ml Pure Desi Ghee today and get our Roasted Chilli Cashews at 50% OFF! Limited festive stock available. Visit today! 🎁`;
  }

  return {
    agent: "Campaign Agent",
    status: "Completed",
    insight: `Generated ${channel} campaign "${strategyTitle}". Targeting ${targetAudience} with high-conversion promotional message.`,
    data: {
      campaignTitle: strategyTitle,
      channel,
      targetAudience,
      targetCount,
      messageDraft,
      projectedLift,
    },
  };
}
