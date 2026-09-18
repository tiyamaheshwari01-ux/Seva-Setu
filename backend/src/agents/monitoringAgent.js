/**
 * Monitoring Agent
 * Establishes baseline metrics and defines post-execution monitoring criteria.
 */

export async function runMonitoringAgent({ executionResult, metrics }) {
  const { ticketId, campaignTitle, projectedLift } = executionResult.data;

  const baselineRevenue = metrics.totalRevenue || 63200;
  const baselineOrders = metrics.totalOrders || 9;

  return {
    agent: "Monitoring Agent",
    status: "Standing By",
    insight: `Baseline established (Revenue: ₹${baselineRevenue.toLocaleString("en-IN")}, Orders: ${baselineOrders}). Tracking readiness active for ${campaignTitle}.`,
    data: {
      ticketId,
      baselineRevenue,
      baselineOrders,
      targetMetric: projectedLift,
      activeTracking: false,
    },
  };
}
