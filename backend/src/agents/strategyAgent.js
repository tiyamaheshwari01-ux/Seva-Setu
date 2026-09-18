/**
 * Strategy Agent
 * Consumes analyst insights and product inventory to formulate commercial strategies.
 */

export async function runStrategyAgent({ analystResult, products }) {
  const { bottleneckCategory } = analystResult.data;

  let strategyTitle = "";
  let strategyInsight = "";
  let selectedProducts = [];
  let projectedLift = "";

  if (bottleneckCategory === "WEEKEND_SLUMP") {
    strategyTitle = "Weekend Family Basket Flash Sale";
    selectedProducts = products.filter((p) => ["Beverages", "Bakery", "Snacks"].includes(p.category));
    strategyInsight = `Formulate a 'Weekend Family Basket' flash offer running Friday 6 PM to Sunday 9 PM, focusing on high-margin evening items: ${selectedProducts.map((p) => p.name).join(", ")}.`;
    projectedLift = "+22% Weekend Revenue";
  } else if (bottleneckCategory === "CUSTOMER_CHURN") {
    strategyTitle = "VIP & Dormant Customer Winback Incentive";
    selectedProducts = products.slice(0, 2);
    strategyInsight = `Deploy an automated re-engagement incentive offering an exclusive ₹100 loyalty voucher for dormant customers returning within 7 days.`;
    projectedLift = "35% Inactive Customer Re-engagement";
  } else {
    strategyTitle = "High-Margin Staple + Snack Cross-Sell Bundle";
    selectedProducts = products.filter((p) => ["Dairy", "Snacks"].includes(p.category));
    strategyInsight = `Pair high-velocity Pure Desi Ghee with high-margin Roasted Chilli Cashews at a bundle discount of 12% to drive average basket value up.`;
    projectedLift = "+16% Average Order Value (AOV)";
  }

  return {
    agent: "Strategy Agent",
    status: "Completed",
    insight: strategyInsight,
    data: {
      strategyTitle,
      projectedLift,
      selectedProductNames: selectedProducts.map((p) => p.name),
    },
  };
}
