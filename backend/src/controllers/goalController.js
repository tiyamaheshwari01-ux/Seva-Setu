/**
 * Goal Controller - Handles merchant goal analysis and dashboard metrics
 */

import {
  calculateDashboardMetrics,
  getProducts,
  getCustomers,
  getTransactions,
} from "../services/analyticsService.js";
import { runMultiAgentPipeline } from "../orchestrator/orchestrator.js";

/**
 * GET /api/goals/metrics
 * Fetches dashboard summary statistics and sales graph data calculated from database/transactions
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await calculateDashboardMetrics();
    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/goals/analyze
 * Receives merchant goal and initiates the Multi-Agent Pipeline
 */
export const analyzeGoal = async (req, res, next) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== "string" || goal.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "A valid business goal is required.",
      });
    }

    const trimmedGoal = goal.trim();

    // Fetch store context
    const [metrics, products, customers, transactions] = await Promise.all([
      calculateDashboardMetrics(),
      getProducts(),
      getCustomers(),
      getTransactions(),
    ]);

    // Run Multi-Agent Workflow
    const pipelineResult = await runMultiAgentPipeline({
      goal: trimmedGoal,
      metrics,
      products,
      customers,
      transactions,
    });

    const analysisResponse = {
      goalId: `goal_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      status: "Pipeline Completed",
      ...pipelineResult,
    };

    return res.status(200).json({
      success: true,
      message: "Multi-agent pipeline completed successfully.",
      data: analysisResponse,
    });
  } catch (error) {
    next(error);
  }
};
