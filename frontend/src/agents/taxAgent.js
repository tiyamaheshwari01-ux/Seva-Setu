/**
 * SevaSetu – Tax Agent
 *
 * Analyzes a financial year's sales data and produces a complete
 * tax analysis with financial insights.
 *
 * Consumed by: TaxAgentView.jsx
 * Uses: taxCalculator.js + mockSalesData.js
 */

import { getAnnualSummary, mockSalesData } from "../data/mockSalesData.js";
import { runTaxCalculation, TAX_RULES, TAX_RULE_REGISTRY, getRuleChangeSummary } from "../services/taxCalculator.js";


/**
 * Run a full tax and financial analysis for the given year.
 * @param {string} year - Financial year key (e.g. "FY 2025-26")
 * @returns {object} Complete analysis result
 */
export function analyzeTax(year = "FY 2025-26") {
  const summary = getAnnualSummary(year);
  const taxResult = runTaxCalculation(summary.totalSales, summary.totalExpenses);
  const months = mockSalesData[year] || [];

  // ── Generate financial insights ──────────────────────────────────────────
  const expenseRatio = ((summary.totalExpenses / summary.totalSales) * 100).toFixed(1);
  const profitMargin = ((summary.estimatedProfit / summary.totalSales) * 100).toFixed(1);

  // Find top 3 and bottom 3 months
  const sortedByRevenue = [...months].sort((a, b) => b.sales - a.sales);
  const top3 = sortedByRevenue.slice(0, 3);
  const bottom3 = sortedByRevenue.slice(-3).reverse();

  // Q1/Q2/Q3/Q4 breakdown (April–March FY)
  const quarters = [
    { label: "Q1 (Apr–Jun)", months: months.slice(0, 3) },
    { label: "Q2 (Jul–Sep)", months: months.slice(3, 6) },
    { label: "Q3 (Oct–Dec)", months: months.slice(6, 9) },
    { label: "Q4 (Jan–Mar)", months: months.slice(9, 12) },
  ].map((q) => ({
    label: q.label,
    sales: q.months.reduce((sum, m) => sum + m.sales, 0),
    expenses: q.months.reduce((sum, m) => sum + m.expenses, 0),
  }));

  const bestQuarter = quarters.reduce((best, q) => (q.sales > best.sales ? q : best), quarters[0]);

  const insights = [
    {
      icon: "🏆",
      title: "Best Month",
      text: `${summary.bestMonth.month} was your highest revenue month at ₹${fmt(summary.bestMonth.sales)}.`,
    },
    {
      icon: "📈",
      title: "Festive Season Boost",
      text: `${bestQuarter.label} was your strongest quarter with ₹${fmt(bestQuarter.sales)} in sales — driven by festive demand.`,
    },
    {
      icon: "💼",
      title: "Expense Ratio",
      text: `Your expenses represent ${expenseRatio}% of revenue. A ratio below 50% is generally healthy for small merchants.`,
    },
    {
      icon: "💰",
      title: "Profit Margin",
      text: `Your estimated gross profit margin is ${profitMargin}%. Improving margins can meaningfully reduce your taxable income.`,
    },
    {
      icon: "📉",
      title: "Off-Season Months",
      text: `${bottom3.map((m) => m.shortMonth).join(", ")} were your weakest months — consider targeted promotions during these periods.`,
    },
    {
      icon: "🧾",
      title: "Tax Planning Tip",
      text: `Recording all eligible business expenses accurately can help reduce your estimated taxable amount. Consult a CA for eligible deductions.`,
    },
  ];

  // ── Calculation explanation steps ────────────────────────────────────────
  const calculationSteps = [
    {
      step: 1,
      title: "Total Annual Revenue",
      value: `₹${fmt(summary.totalSales)}`,
      explanation: "Sum of all 12 months of sales recorded in your business data.",
    },
    {
      step: 2,
      title: "Total Recorded Expenses",
      value: `₹${fmt(summary.totalExpenses)}`,
      explanation: "Sum of all monthly expenses (cost of goods, operational costs).",
    },
    {
      step: 3,
      title: "Gross Profit",
      value: `₹${fmt(summary.estimatedProfit)}`,
      explanation: "Revenue minus Expenses = Your estimated gross profit.",
    },
    {
      step: 4,
      title: "Standard Deduction Applied",
      value: `₹${fmt(taxResult.standardDeduction)} (${(TAX_RULES.standardDeductionRate * 100).toFixed(0)}% of profit)`,
      explanation: `A standard deduction of ${(TAX_RULES.standardDeductionRate * 100).toFixed(0)}% is applied to your gross profit as an illustrative allowance. This is a prototype assumption — actual deductions depend on your business structure and applicable laws.`,
    },
    {
      step: 5,
      title: "Estimated Taxable Amount",
      value: `₹${fmt(taxResult.taxableAmount)}`,
      explanation: "Gross Profit minus Standard Deduction = Estimated Taxable Amount.",
    },
    {
      step: 6,
      title: "Estimated Tax (Progressive Slabs)",
      value: `₹${fmt(taxResult.totalTax)}`,
      explanation: "Tax calculated using illustrative progressive slabs (Nil up to ₹2.5L, 5% up to ₹5L, 20% up to ₹10L, 30% above). These are prototype assumption slabs, not official tax rates.",
    },
  ];

  return {
    year,
    summary,
    taxResult,
    quarters,
    top3,
    bottom3,
    insights,
    calculationSteps,
    disclaimer: TAX_RULES.disclaimer,
    rules: TAX_RULES,
  };
}

function fmt(number) {
  return Number(number).toLocaleString("en-IN");
}
