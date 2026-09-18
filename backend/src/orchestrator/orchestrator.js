/**
 * Multi-Agent Orchestrator
 * Coordinates the sequential execution of autonomous agents:
 * Analyst -> Strategy -> Campaign -> Execution -> Monitoring
 */

import { runAnalystAgent } from "../agents/analystAgent.js";
import { runStrategyAgent } from "../agents/strategyAgent.js";
import { runCampaignAgent } from "../agents/campaignAgent.js";
import { runExecutionAgent } from "../agents/executionAgent.js";
import { runMonitoringAgent } from "../agents/monitoringAgent.js";

/**
 * Execute full multi-agent pipeline for a merchant goal
 */
export async function runMultiAgentPipeline({
  goal,
  metrics,
  products = [],
  customers = [],
  transactions = [],
}) {
  const startTime = Date.now();
  console.log(`\n🤖 [Orchestrator] Starting Multi-Agent Pipeline for goal: "${goal}"`);

  // Step 1: Analyst Agent
  console.log("  1️⃣  Invoking Business Analyst Agent...");
  const analystResult = await runAnalystAgent({ goal, metrics, transactions, customers });

  // Step 2: Strategy Agent
  console.log("  2️⃣  Invoking Strategy Agent...");
  const strategyResult = await runStrategyAgent({ analystResult, products });

  // Step 3: Campaign Agent
  console.log("  3️⃣  Invoking Campaign Agent...");
  const campaignResult = await runCampaignAgent({ strategyResult, customers });

  // Step 4: Execution Agent
  console.log("  4️⃣  Invoking Execution Agent...");
  const executionResult = await runExecutionAgent({ campaignResult });

  // Step 5: Monitoring Agent
  console.log("  5️⃣  Invoking Monitoring Agent...");
  const monitoringResult = await runMonitoringAgent({ executionResult, metrics });

  const durationMs = Date.now() - startTime;
  console.log(`✅ [Orchestrator] Pipeline finished in ${durationMs}ms\n`);

  // Unified trace for frontend ActivityItem list
  const agentsTrace = [
    {
      agent: analystResult.agent,
      status: analystResult.status,
      insight: analystResult.insight,
    },
    {
      agent: strategyResult.agent,
      status: strategyResult.status,
      insight: strategyResult.insight,
    },
    {
      agent: campaignResult.agent,
      status: campaignResult.status,
      insight: campaignResult.insight,
    },
    {
      agent: executionResult.agent,
      status: executionResult.status,
      insight: executionResult.insight,
    },
    {
      agent: monitoringResult.agent,
      status: monitoringResult.status,
      insight: monitoringResult.insight,
    },
  ];

  // Action packet for approval
  const suggestedAction = {
    ticketId: executionResult.data.ticketId,
    title: executionResult.data.campaignTitle,
    channel: executionResult.data.channel,
    targetAudience: executionResult.data.targetAudience,
    targetCount: executionResult.data.targetCount,
    messageDraft: executionResult.data.messageDraft,
    expectedLift: executionResult.data.projectedLift,
    requiresApproval: executionResult.data.requiresApproval,
    approvalStatus: executionResult.data.approvalStatus,
  };

  return {
    source: "Multi-Agent Orchestrator Pipeline",
    goal,
    durationMs,
    summary: `Multi-agent workflow completed for goal: "${goal}". Strategy formed and campaign prepared for approval.`,
    bottleneckIdentified: analystResult.insight,
    agentsTrace,
    suggestedAction,
    monitoringBaseline: monitoringResult.data,
  };
}
