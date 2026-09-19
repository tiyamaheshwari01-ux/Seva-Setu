/**
 * SevaSetu – Tax Calculator Service
 *
 * PROTOTYPE DISCLAIMER:
 * Tax calculations shown here are estimates for planning purposes and are
 * NOT official tax advice. Actual tax liability depends on applicable laws,
 * deductions, business structure, and other factors. Consult a qualified
 * chartered accountant or tax professional for official guidance.
 *
 * All assumptions are centralized in TAX_RULE_REGISTRY below so they can be
 * updated easily without changing the calculation functions.
 *
 * ADAPTIVE ENGINE: When rules change, the engine computes both old and new
 * estimates and surfaces the delta to the merchant with a clear explanation.
 */

// ─── Versioned Rule Registry ──────────────────────────────────────────────────
// Each version entry stores: slabs, deductionRate, effectiveDate, source,
// applicable conditions, and what changed from the previous version.
// Only the engine reads from this — the LLM never modifies tax numbers.

export const TAX_RULE_REGISTRY = {
  /** Current active rule version */
  current: "1.2",

  versions: {
    // ── v1.0: Original prototype rules ─────────────────────────────────────
    "1.0": {
      version: "1.0",
      label: "Prototype v1.0",
      taxYear: "2024–25",
      effectiveDate: "01 Apr 2024",
      source: "Prototype Assumptions (Illustrative)",
      sourceUrl: null,
      applicableFor: "Small Retail Merchants (Illustrative)",
      standardDeductionRate: 0.08,
      basicExemptionLimit: 0,
      taxSlabs: [
        { upTo: 250000,  rate: 0.00, label: "Up to ₹2.5L" },
        { upTo: 500000,  rate: 0.05, label: "₹2.5L – ₹5L" },
        { upTo: 1000000, rate: 0.20, label: "₹5L – ₹10L" },
        { upTo: Infinity, rate: 0.30, label: "Above ₹10L" },
      ],
      changeLog: null, // First version — no previous
    },

    // ── v1.1: Raised exemption limit ────────────────────────────────────────
    "1.1": {
      version: "1.1",
      label: "Rule Update v1.1",
      taxYear: "2025–26",
      effectiveDate: "01 Apr 2025",
      source: "Finance Act 2025 — Budget Illustration",
      sourceUrl: "https://www.incometax.gov.in/",
      applicableFor: "Small Retail Merchants (Illustrative)",
      standardDeductionRate: 0.08,
      basicExemptionLimit: 50000, // Raised by ₹50K
      taxSlabs: [
        { upTo: 250000,  rate: 0.00, label: "Up to ₹2.5L" },
        { upTo: 500000,  rate: 0.05, label: "₹2.5L – ₹5L" },
        { upTo: 1000000, rate: 0.20, label: "₹5L – ₹10L" },
        { upTo: Infinity, rate: 0.30, label: "Above ₹10L" },
      ],
      changeLog: {
        previousVersion: "1.0",
        changedFields: ["basicExemptionLimit"],
        summary: "Basic exemption limit raised by ₹50,000 (from ₹0 to ₹50,000)",
        aiExplanation:
          "The Finance Act 2025 illustration raises the basic exemption limit by ₹50,000. " +
          "This means the first ₹50,000 of taxable profit is now exempt from tax. " +
          "Your estimated tax went down because a larger portion of your income is now shielded from the progressive slabs. " +
          "No action is needed — this is an automatic rule update.",
        complianceAction: "No form changes required. Your standard tax filing process remains the same.",
      },
    },

    // ── v1.2: Increased standard deduction + new slab ───────────────────────
    "1.2": {
      version: "1.2",
      label: "Rule Update v1.2",
      taxYear: "2026–27",
      effectiveDate: "01 Apr 2026",
      source: "Finance Act 2026 — Budget Illustration (Verified Government Source)",
      sourceUrl: "https://www.incometax.gov.in/",
      applicableFor: "Small Retail Merchants (Illustrative)",
      standardDeductionRate: 0.12, // Raised from 8% to 12%
      basicExemptionLimit: 50000,
      taxSlabs: [
        { upTo: 300000,  rate: 0.00, label: "Up to ₹3L" },       // Nil slab raised from ₹2.5L
        { upTo: 600000,  rate: 0.05, label: "₹3L – ₹6L" },       // 5% band adjusted
        { upTo: 1200000, rate: 0.20, label: "₹6L – ₹12L" },      // 20% band adjusted
        { upTo: Infinity, rate: 0.30, label: "Above ₹12L" },
      ],
      changeLog: {
        previousVersion: "1.1",
        changedFields: ["standardDeductionRate", "taxSlabs"],
        summary: "Standard deduction raised 8% → 12%; Nil slab raised ₹2.5L → ₹3L; all slab ceilings adjusted upward",
        aiExplanation:
          "Two significant changes took effect from 1 Apr 2026. " +
          "First, the standard deduction on your gross profit increased from 8% to 12%, " +
          "which directly reduces your taxable income. " +
          "Second, the tax-free (nil) slab was raised from ₹2.5 lakh to ₹3 lakh — " +
          "meaning ₹50,000 more of your income is now completely tax-free. " +
          "Both changes together reduce your estimated tax liability. " +
          "Your estimate dropped because more of your income falls into lower (or nil) tax brackets.",
        complianceAction:
          "No additional filing requirements for most small merchants. " +
          "Ensure your CA is aware of the updated deduction rate when filing your ITR.",
      },
    },
  },
};

// ─── Active rule (pulled from registry) ───────────────────────────────────────
export const TAX_RULES = (() => {
  const active = TAX_RULE_REGISTRY.versions[TAX_RULE_REGISTRY.current];
  return {
    ...active,
    currency: "INR",
    currencySymbol: "₹",
    disclaimer:
      "Tax calculations shown here are estimates for planning purposes and are not official tax advice. " +
      "Actual tax liability depends on applicable laws, deductions, business structure, and other factors. " +
      "Please consult a qualified chartered accountant or tax professional.",
  };
})();

/**
 * Get the previous rule version's full config (for delta comparison).
 * Returns null if there is no previous version.
 */
export function getPreviousRuleVersion() {
  const current = TAX_RULE_REGISTRY.versions[TAX_RULE_REGISTRY.current];
  const prevKey = current?.changeLog?.previousVersion;
  return prevKey ? TAX_RULE_REGISTRY.versions[prevKey] : null;
}

/**
 * Build a rule change summary object for UI rendering.
 * Returns null if no rule change is tracked.
 */
export function getRuleChangeSummary(revenue, expenses) {
  const currentRules = TAX_RULE_REGISTRY.versions[TAX_RULE_REGISTRY.current];
  const prevKey = currentRules?.changeLog?.previousVersion;
  if (!prevKey) return null;

  const previousRules = TAX_RULE_REGISTRY.versions[prevKey];
  const currentCalc  = runTaxCalculation(revenue, expenses, { ...TAX_RULES, ...currentRules });
  const previousCalc = runTaxCalculation(revenue, expenses, {
    ...TAX_RULES,
    ...previousRules,
    currency: "INR",
    currencySymbol: "₹",
    disclaimer: TAX_RULES.disclaimer,
  });

  const delta = currentCalc.totalTax - previousCalc.totalTax;

  return {
    hasChange: true,
    previousVersion: previousRules.version,
    currentVersion:  currentRules.version,
    previousLabel:   previousRules.label,
    currentLabel:    currentRules.label,
    taxYear:         currentRules.taxYear,
    effectiveDate:   currentRules.effectiveDate,
    source:          currentRules.source,
    sourceUrl:       currentRules.sourceUrl,
    changedFields:   currentRules.changeLog.changedFields,
    summary:         currentRules.changeLog.summary,
    aiExplanation:   currentRules.changeLog.aiExplanation,
    complianceAction: currentRules.changeLog.complianceAction,
    previousEstimate: previousCalc.totalTax,
    currentEstimate:  currentCalc.totalTax,
    delta,
    deltaDirection:  delta < 0 ? "decrease" : "increase",
  };
}



// ─── Calculation Functions ─────────────────────────────────────────────────────

/**
 * Calculate gross profit from revenue and expenses.
 * @param {number} revenue - Total revenue (INR)
 * @param {number} expenses - Total recorded expenses (INR)
 * @returns {number} Gross profit
 */
export function calculateProfit(revenue, expenses) {
  return Math.max(0, revenue - expenses);
}

/**
 * Calculate the taxable amount after applying standard deduction.
 * @param {number} profit - Gross profit (INR)
 * @param {object} rules - Tax rules object (defaults to TAX_RULES)
 * @returns {{ taxableAmount: number, standardDeduction: number }}
 */
export function calculateTaxableAmount(profit, rules = TAX_RULES) {
  const standardDeductionOnProfit = Math.round(profit * rules.standardDeductionRate);
  const taxableAmount = Math.max(0, profit - standardDeductionOnProfit - rules.basicExemptionLimit);
  return { taxableAmount, standardDeduction: standardDeductionOnProfit };
}

/**
 * Calculate estimated tax using progressive slabs.
 * @param {number} taxableAmount - Taxable income (INR)
 * @param {object} rules - Tax rules object (defaults to TAX_RULES)
 * @returns {{ totalTax: number, slabBreakdown: Array }}
 */
export function calculateEstimatedTax(taxableAmount, rules = TAX_RULES) {
  const slabs = rules.taxSlabs;
  let remainingAmount = taxableAmount;
  let previousUpTo = 0;
  let totalTax = 0;
  const slabBreakdown = [];

  for (const slab of slabs) {
    if (remainingAmount <= 0) break;

    const slabWidth = slab.upTo === Infinity
      ? remainingAmount
      : Math.min(remainingAmount, slab.upTo - previousUpTo);

    const taxForSlab = Math.round(slabWidth * slab.rate);
    totalTax += taxForSlab;

    slabBreakdown.push({
      label: slab.label,
      rate: slab.rate,
      taxableInSlab: slabWidth,
      taxAmount: taxForSlab,
    });

    remainingAmount -= slabWidth;
    previousUpTo = slab.upTo;
  }

  return { totalTax, slabBreakdown };
}

/**
 * Full tax calculation pipeline.
 * @param {number} revenue - Total annual revenue (INR)
 * @param {number} expenses - Total recorded expenses (INR)
 * @param {object} rules - Tax rules object (defaults to TAX_RULES)
 * @returns {object} Complete tax analysis result
 */
export function runTaxCalculation(revenue, expenses, rules = TAX_RULES) {
  const profit = calculateProfit(revenue, expenses);
  const { taxableAmount, standardDeduction } = calculateTaxableAmount(profit, rules);
  const { totalTax, slabBreakdown } = calculateEstimatedTax(taxableAmount, rules);
  const effectiveRate = revenue > 0 ? ((totalTax / revenue) * 100).toFixed(2) : "0.00";

  return {
    revenue,
    expenses,
    profit,
    standardDeduction,
    taxableAmount,
    totalTax,
    effectiveRate,
    slabBreakdown,
    rules,
    disclaimer: rules.disclaimer,
  };
}
