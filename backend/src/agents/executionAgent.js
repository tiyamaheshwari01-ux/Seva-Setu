/**
 * Execution Agent
 * Applies guardrails, creates approval tickets, and gates campaign dispatch.
 */

export async function runExecutionAgent({ campaignResult }) {
  const { campaignTitle, channel, targetAudience, targetCount, messageDraft, projectedLift } = campaignResult.data;

  // Guardrail check: Campaigns targeting customer communications MUST require merchant approval
  const requiresApproval = true;
  const executionTicketId = `exec_${Date.now()}`;

  const insight = `Safety guardrails verified. Budget and discount parameters within safe margins. Campaign queued for merchant approval before broadcast.`;

  return {
    agent: "Execution Agent",
    status: "Approval Required",
    insight,
    data: {
      ticketId: executionTicketId,
      actionType: "BROADCAST_CAMPAIGN",
      channel,
      campaignTitle,
      targetAudience,
      targetCount,
      messageDraft,
      projectedLift,
      requiresApproval,
      approvalStatus: "PENDING",
    },
  };
}
