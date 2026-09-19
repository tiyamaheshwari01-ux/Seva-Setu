/**
 * SevaSetu – AI Service
 *
 * Routes merchant questions to the appropriate handler using the sales data.
 * Currently uses deterministic pattern matching for the prototype.
 *
 * TO CONNECT A REAL LLM API (e.g. Gemini):
 *   1. Install the SDK: npm install @google/genai
 *   2. Set up a backend proxy endpoint to keep API keys server-side
 *   3. Replace the `generateResponse` function body with an API call
 *   4. Keep the same return type: { text: string, data?: object }
 */

import { getAnnualSummary, mockSalesData } from "../data/mockSalesData.js";
import { runTaxCalculation } from "./taxCalculator.js";

// ─── Response Generator ───────────────────────────────────────────────────────

/**
 * Process a merchant's question and return a response.
 * @param {string} query       - The user's question text
 * @param {string} selectedYear - Financial year key (e.g. "FY 2025-26")
 * @returns {{ text: string, data?: object }}
 */
export function processQuery(query, selectedYear = "FY 2025-26") {
  const q = query.toLowerCase().trim();
  const summary = getAnnualSummary(selectedYear);
  const months = mockSalesData[selectedYear] || [];
  const taxResult = runTaxCalculation(summary.totalSales, summary.totalExpenses);

  // ── Total / Annual Sales ──────────────────────────────────────────────────
  if (matchAny(q, ["total sales", "how much did i sell", "annual sales", "yearly sales", "total revenue", "annual revenue", "how much revenue"])) {
    return {
      text: `Your total sales for ${selectedYear} were ₹${fmt(summary.totalSales)}. That's across ${summary.totalTransactions.toLocaleString("en-IN")} transactions over 12 months.`,
      data: { totalSales: summary.totalSales },
    };
  }

  // ── Best / Highest Month ──────────────────────────────────────────────────
  if (matchAny(q, ["best month", "highest sales", "highest month", "most sales", "which month was highest", "which month was best", "top month", "peak month"])) {
    return {
      text: `Your best performing month in ${selectedYear} was ${summary.bestMonth.month} with sales of ₹${fmt(summary.bestMonth.sales)} (${summary.bestMonth.transactions} transactions). ${summary.bestMonth.notes}`,
      data: { bestMonth: summary.bestMonth },
    };
  }

  // ── Worst / Lowest Month ──────────────────────────────────────────────────
  if (matchAny(q, ["worst month", "lowest month", "lowest sales", "least sales", "weakest month", "slowest month"])) {
    return {
      text: `Your lowest performing month in ${selectedYear} was ${summary.worstMonth.month} with sales of ₹${fmt(summary.worstMonth.sales)}. ${summary.worstMonth.notes}`,
      data: { worstMonth: summary.worstMonth },
    };
  }

  // ── Average Monthly Sales ─────────────────────────────────────────────────
  if (matchAny(q, ["average", "avg", "monthly average", "average sales", "average revenue", "average monthly"])) {
    return {
      text: `Your average monthly sales for ${selectedYear} were ₹${fmt(summary.avgMonthlySales)}. Your best was ${summary.bestMonth.shortMonth} (₹${fmt(summary.bestMonth.sales)}) and your lowest was ${summary.worstMonth.shortMonth} (₹${fmt(summary.worstMonth.sales)}).`,
      data: { avgMonthlySales: summary.avgMonthlySales },
    };
  }

  // ── Total Expenses ────────────────────────────────────────────────────────
  if (matchAny(q, ["expenses", "how much did i spend", "total expenses", "spending", "costs", "how much spent"])) {
    const expenseRatio = ((summary.totalExpenses / summary.totalSales) * 100).toFixed(1);
    return {
      text: `Your total recorded expenses for ${selectedYear} were ₹${fmt(summary.totalExpenses)}, which is ${expenseRatio}% of your revenue.`,
      data: { totalExpenses: summary.totalExpenses },
    };
  }

  // ── Profit ────────────────────────────────────────────────────────────────
  if (matchAny(q, ["profit", "net profit", "earnings", "how much profit", "gross profit"])) {
    const profitMargin = ((summary.estimatedProfit / summary.totalSales) * 100).toFixed(1);
    return {
      text: `Your estimated gross profit for ${selectedYear} is ₹${fmt(summary.estimatedProfit)} (a ${profitMargin}% margin on your ₹${fmt(summary.totalSales)} revenue after ₹${fmt(summary.totalExpenses)} in expenses).`,
      data: { profit: summary.estimatedProfit },
    };
  }

  // ── Tax Questions ─────────────────────────────────────────────────────────
  if (matchAny(q, ["tax", "how much tax", "estimated tax", "income tax", "tax liability", "taxable"])) {
    return {
      text: `Based on your ${selectedYear} data, your estimated tax is approximately ₹${fmt(taxResult.totalTax)}. This is calculated on a taxable amount of ₹${fmt(taxResult.taxableAmount)} (after applying a standard deduction to your ₹${fmt(summary.estimatedProfit)} profit). ⚠️ This is only a prototype estimate — please consult a chartered accountant for actual tax advice.`,
      data: { tax: taxResult },
    };
  }

  // ── Total Transactions ────────────────────────────────────────────────────
  if (matchAny(q, ["transactions", "how many orders", "how many sales", "order count", "number of transactions"])) {
    return {
      text: `You completed ${summary.totalTransactions.toLocaleString("en-IN")} transactions in ${selectedYear}. Your busiest month was ${summary.bestMonth.month} with ${summary.bestMonth.transactions} transactions.`,
      data: { transactions: summary.totalTransactions },
    };
  }

  // ── What-if: Discount / Offer Scenario ───────────────────────────────────
  const discountMatch = q.match(/(\d+)\s*%\s*(discount|off|offer|coupon|deal)/i);
  const isDiscountQuery = discountMatch || matchAny(q, [
    "discount", "give off", "offer", "coupon", "deal", "sale off",
    "reduce price", "price cut", "price reduction"
  ]);

  if (isDiscountQuery) {
    const discountPct = discountMatch ? parseInt(discountMatch[1]) : 10;
    const baseRevenue = summary.totalSales;
    const baseProfit  = summary.estimatedProfit;
    const baseOrders  = summary.totalTransactions;
    const baseMargin  = (baseProfit / baseRevenue) * 100;

    // Discount elasticity model: every 1% discount → ~1.2% more orders (diminishing)
    const orderLiftPct     = Math.min(discountPct * 1.2, 35);
    const revenueNetPct    = (1 + orderLiftPct / 100) * (1 - discountPct / 100) - 1;
    const marginImpactPct  = -(discountPct * 0.7); // margin always erodes
    const newMargin        = Math.max(baseMargin + marginImpactPct, 0);

    const projRevenueLow   = Math.round(baseRevenue * (1 + revenueNetPct * 0.8));
    const projRevenueHigh  = Math.round(baseRevenue * (1 + revenueNetPct * 1.2));
    const projOrdersLow    = Math.round(baseOrders  * (1 + orderLiftPct * 0.8 / 100));
    const projOrdersHigh   = Math.round(baseOrders  * (1 + orderLiftPct * 1.2 / 100));
    const marginLow        = (newMargin * 0.9).toFixed(1);
    const marginHigh       = (newMargin * 1.1).toFixed(1);

    // Risk level
    let riskLevel, riskText;
    if (discountPct <= 5) {
      riskLevel = "low";
      riskText  = "Low risk. Small discount is unlikely to significantly harm margins if order volume increases moderately.";
    } else if (discountPct <= 15) {
      riskLevel = "medium";
      riskText  = `⚠️ Moderate risk. A ${discountPct}% discount will reduce your margin unless order volumes increase by at least ${Math.round(discountPct * 1.5)}%. Monitor closely.`;
    } else {
      riskLevel = "high";
      riskText  = `🔴 High risk. A ${discountPct}% discount may significantly erode profit even if orders increase. Consider a smaller discount or bundle offer instead.`;
    }

    // AI recommendation
    let recommendation;
    if (discountPct <= 5) {
      recommendation = "This is a safe discount level. Consider running it on your slowest 2–3 weekday slots rather than all week to drive targeted traffic without giving revenue away unnecessarily.";
    } else if (discountPct <= 15) {
      recommendation = `Instead of a flat ${discountPct}% discount for everyone, consider targeting returning customers only (via WhatsApp). This protects your margins and rewards loyalty, while still increasing order volume.`;
    } else {
      recommendation = `A ${discountPct}% discount across the board is aggressive. Try a lower discount (8–12%) on a bundle (e.g. Chai + Cookie combo) instead — bundles increase order value while limiting margin loss.`;
    }

    return {
      text: `📊 Scenario Simulation (Estimates Only — Not Guarantees)\n\nIf you offer a ${discountPct}% discount, here's what the model projects based on your ${selectedYear} data:`,
      scenarioResult: {
        type: "discount",
        inputs: { discount: discountPct, baseRevenue, baseOrders, baseMargin: baseMargin.toFixed(1) },
        metrics: [
          {
            label: "Estimated Revenue Impact",
            rangeLow: revenueNetPct >= 0 ? `+${fmt(projRevenueLow - baseRevenue)}` : fmt(projRevenueLow - baseRevenue),
            rangeHigh: revenueNetPct >= 0 ? `+${fmt(projRevenueHigh - baseRevenue)}` : fmt(projRevenueHigh - baseRevenue),
            pctLow: `${revenueNetPct >= 0 ? "+" : ""}${(revenueNetPct * 80).toFixed(1)}%`,
            pctHigh: `${revenueNetPct >= 0 ? "+" : ""}${(revenueNetPct * 120).toFixed(1)}%`,
            color: revenueNetPct >= 0 ? "green" : "red",
            icon: revenueNetPct >= 0 ? "📈" : "📉",
          },
          {
            label: "Estimated Orders",
            pctLow: `+${(orderLiftPct * 0.8).toFixed(0)}%`,
            pctHigh: `+${(orderLiftPct * 1.2).toFixed(0)}%`,
            rangeLow: `+${projOrdersLow - baseOrders} orders`,
            rangeHigh: `+${projOrdersHigh - baseOrders} orders`,
            color: "blue",
            icon: "🛒",
          },
          {
            label: "Estimated Profit Margin",
            pctLow: `${marginLow}%`,
            pctHigh: `${marginHigh}%`,
            rangeLow: `was ${baseMargin.toFixed(1)}%`,
            rangeHigh: "after discount",
            color: newMargin < baseMargin * 0.7 ? "red" : "orange",
            icon: "💰",
          },
        ],
        riskLevel,
        riskText,
        recommendation,
        disclaimer: "These are rough projections using a simplified elasticity model. Actual results depend on customer behavior, seasonality, and product mix. Always test on a small segment first.",
      },
    };
  }

  // ── What-if: Revenue Increase ─────────────────────────────────────────────
  const whatIfMatch = q.match(/(\d+)\s*%\s*(increase|growth|more|rise|up)/i);
  if (whatIfMatch || matchAny(q, ["what if", "increase by", "what happens if", "if my sales", "simulate", "scenario", "next year"])) {
    const pct = whatIfMatch ? parseInt(whatIfMatch[1]) : 20;
    const projectedRevenue = Math.round(summary.totalSales * (1 + pct / 100));
    const projectedProfit  = Math.round(summary.estimatedProfit * (1 + pct / 100));
    const projectedTax     = runTaxCalculation(projectedRevenue, summary.totalExpenses);
    const extraRevenue     = projectedRevenue - summary.totalSales;

    return {
      text: `📊 Scenario Simulation (Estimates Only — Not Guarantees)\n\nIf your sales grow by ${pct}% in ${selectedYear}:`,
      scenarioResult: {
        type: "revenue_increase",
        inputs: { growthPct: pct, baseRevenue: summary.totalSales },
        metrics: [
          {
            label: "Projected Annual Revenue",
            pctLow: `+${pct}%`,
            pctHigh: null,
            rangeLow: `₹${fmt(projectedRevenue)}`,
            rangeHigh: `+₹${fmt(extraRevenue)} extra`,
            color: "green",
            icon: "📈",
          },
          {
            label: "Estimated Gross Profit",
            pctLow: `+${pct}%`,
            pctHigh: null,
            rangeLow: `₹${fmt(projectedProfit)}`,
            rangeHigh: `up from ₹${fmt(summary.estimatedProfit)}`,
            color: "green",
            icon: "💰",
          },
          {
            label: "Estimated Tax Liability",
            pctLow: null,
            pctHigh: null,
            rangeLow: `≈ ₹${fmt(projectedTax.totalTax)}`,
            rangeHigh: "on projected income",
            color: "orange",
            icon: "🧾",
          },
        ],
        riskLevel: "low",
        riskText: "Revenue growth scenarios have low risk on their own. Ensure operating costs don't grow proportionally — keep expenses below 75% of revenue.",
        recommendation: `To achieve ${pct}% growth, focus on your peak months (Oct–Nov) with early promotions. Your festive season alone drives ~35% of annual revenue — a targeted WhatsApp campaign 2 weeks before Diwali could significantly move the needle.`,
        disclaimer: "This is a simplified projection. Actual results depend on market conditions, competition, and operational capacity.",
      },
    };
  }

  // ── Month-specific query ──────────────────────────────────────────────────
  const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const foundMonthName = monthNames.find((m) => q.includes(m));
  if (foundMonthName) {
    const monthData = months.find((m) => m.month.toLowerCase().includes(foundMonthName));
    if (monthData) {
      const profit = monthData.sales - monthData.expenses;
      return {
        text: `In ${monthData.month}: Sales were ₹${fmt(monthData.sales)} across ${monthData.transactions} transactions, with ₹${fmt(monthData.expenses)} in expenses (estimated profit: ₹${fmt(profit)}). ${monthData.notes}`,
        data: { month: monthData },
      };
    }
  }

  // ── Festive / Seasonal questions ──────────────────────────────────────────
  if (matchAny(q, ["diwali", "festival", "festive", "navratri", "holi", "seasonal"])) {
    const diwaliMonth = months.find((m) => m.month.includes("November 2025"));
    return {
      text: `Your festive season (October–November) was your strongest period. Diwali month (${diwaliMonth?.month}) alone generated ₹${fmt(diwaliMonth?.sales || 289500)} in sales — your highest month of the year!`,
      data: {},
    };
  }

  // ── Greeting / Help ───────────────────────────────────────────────────────
  if (matchAny(q, ["hello", "hi", "hey", "help", "what can you do", "what can you tell me"])) {
    return {
      text: `Hi! I'm SV, your AI business teammate. I can tell you about your total sales, best and worst months, expenses, profits, estimated tax, and even simulate what-if scenarios. Try asking me: "What were my total sales?" or "Which month was my best?" or "What's my estimated tax?"`,
    };
  }

  // ── Default fallback ──────────────────────────────────────────────────────
  return {
    text: `I currently have data for ${selectedYear}. I can answer questions about your sales totals, monthly performance, expenses, profit, estimated tax, and what-if scenarios. Try: "What were my total sales?" or "Which month was highest?"`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchAny(query, keywords) {
  return keywords.some((kw) => query.includes(kw));
}

function fmt(number) {
  return Number(number).toLocaleString("en-IN");
}
