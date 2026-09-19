import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { analyzeTax } from "../agents/taxAgent.js";

const fmt = (n) => Number(n).toLocaleString("en-IN");

function TaxAgentView({ selectedYear }) {
  const [showCalculation, setShowCalculation] = useState(false);
  const analysis = useMemo(() => analyzeTax(selectedYear), [selectedYear]);
  const { summary, taxResult, insights, calculationSteps, quarters, disclaimer } = analysis;

  return (
    <div className="tax-agent-view">
      {/* Agent Header */}
      <div className="ta-agent-header">
        <div className="ta-agent-avatar">SV</div>
        <div className="ta-agent-identity">
          <h2>SV Tax Agent</h2>
          <span className="ta-status-pill">● Analysis Complete</span>
        </div>
      </div>

      {/* Agent Greeting Message */}
      <div className="ta-greeting-bubble">
        <div className="ta-bubble-inner">
          <strong>Hi! I've analyzed your sales for {selectedYear}.</strong>
          <p>
            Here's a complete financial and tax overview based on your recorded data.
            I've calculated your revenue, expenses, profit, and estimated tax using clearly stated prototype assumptions.
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="ta-disclaimer">
        <AlertTriangle size={18} className="ta-disclaimer-icon" />
        <p>{disclaimer}</p>
      </div>

      {/* Key Metric Cards */}
      <section className="ta-metrics-grid">
        <div className="ta-metric-card ta-metric-revenue">
          <span className="ta-metric-label">Revenue Analyzed</span>
          <h3 className="ta-metric-value">₹{fmt(summary.totalSales)}</h3>
          <span className="ta-metric-sub">Total annual sales</span>
        </div>
        <div className="ta-metric-card ta-metric-profit">
          <span className="ta-metric-label">Estimated Profit</span>
          <h3 className="ta-metric-value">₹{fmt(summary.estimatedProfit)}</h3>
          <span className="ta-metric-sub">After ₹{fmt(summary.totalExpenses)} expenses</span>
        </div>
        <div className="ta-metric-card ta-metric-taxable">
          <span className="ta-metric-label">Est. Taxable Amount</span>
          <h3 className="ta-metric-value">₹{fmt(taxResult.taxableAmount)}</h3>
          <span className="ta-metric-sub">After standard deduction</span>
        </div>
        <div className="ta-metric-card ta-metric-tax">
          <span className="ta-metric-label">Estimated Tax</span>
          <h3 className="ta-metric-value">₹{fmt(taxResult.totalTax)}</h3>
          <span className="ta-metric-sub">Effective rate: {taxResult.effectiveRate}%</span>
        </div>
      </section>

      {/* Quarterly Performance */}
      <section className="card ta-quarters-card">
        <div className="card-header">
          <div>
            <h3>Quarterly Performance</h3>
            <p>Sales breakdown by financial year quarter</p>
          </div>
        </div>
        <div className="ta-quarters-grid">
          {quarters.map((q) => {
            const qProfit = q.sales - q.expenses;
            const qMargin = ((qProfit / q.sales) * 100).toFixed(1);
            return (
              <div key={q.label} className="ta-quarter-card">
                <span className="ta-quarter-label">{q.label}</span>
                <div className="ta-quarter-sales">₹{fmt(q.sales)}</div>
                <div className="ta-quarter-details">
                  <span>Expenses: ₹{fmt(q.expenses)}</span>
                  <span>Profit: <strong>₹{fmt(qProfit)}</strong> ({qMargin}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tax Slab Breakdown */}
      {taxResult.slabBreakdown && taxResult.slabBreakdown.filter(s => s.taxableInSlab > 0).length > 0 && (
        <section className="card ta-slab-card">
          <div className="card-header">
            <div>
              <h3>Tax Slab Breakdown</h3>
              <p>How the estimated tax was distributed across slabs</p>
            </div>
          </div>
          <div className="ta-slab-table-wrapper">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Slab</th>
                  <th>Rate</th>
                  <th className="text-right">Taxable in Slab</th>
                  <th className="text-right">Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {taxResult.slabBreakdown.filter(s => s.taxableInSlab > 0).map((slab) => (
                  <tr key={slab.label}>
                    <td>{slab.label}</td>
                    <td>{(slab.rate * 100).toFixed(0)}%</td>
                    <td className="text-right">₹{fmt(slab.taxableInSlab)}</td>
                    <td className="text-right text-blue-val">₹{fmt(slab.taxAmount)}</td>
                  </tr>
                ))}
                <tr className="table-totals-row">
                  <td colSpan={3}><strong>Total Estimated Tax</strong></td>
                  <td className="text-right"><strong>₹{fmt(taxResult.totalTax)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Financial Insights */}
      <section className="card ta-insights-card">
        <div className="card-header">
          <div>
            <h3>Financial Insights</h3>
            <p>Key observations from your {selectedYear} data</p>
          </div>
        </div>
        <div className="ta-insights-list">
          {insights.map((insight) => (
            <div key={insight.title} className="ta-insight-item">
              <span className="ta-insight-icon">{insight.icon}</span>
              <div>
                <strong>{insight.title}</strong>
                <p>{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expandable Calculation Steps */}
      <section className="card ta-calc-card">
        <button
          className="ta-calc-toggle"
          onClick={() => setShowCalculation((prev) => !prev)}
          aria-expanded={showCalculation}
        >
          <span>🧮 How did I calculate this?</span>
          {showCalculation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showCalculation && (
          <div className="ta-calc-steps">
            {calculationSteps.map((step) => (
              <div key={step.step} className="ta-calc-step">
                <div className="ta-step-number">{step.step}</div>
                <div className="ta-step-content">
                  <div className="ta-step-header">
                    <strong>{step.title}</strong>
                    <span className="ta-step-value">{step.value}</span>
                  </div>
                  <p className="ta-step-explanation">{step.explanation}</p>
                </div>
              </div>
            ))}

            <div className="ta-calc-assumptions">
              <h4>Prototype Assumptions Used</h4>
              <ul>
                <li>Standard deduction of <strong>{(taxResult.rules.standardDeductionRate * 100).toFixed(0)}%</strong> applied to gross profit</li>
                <li>Progressive tax slabs: Nil (up to ₹2.5L) → 5% (₹2.5L–₹5L) → 20% (₹5L–₹10L) → 30% (above ₹10L)</li>
                <li>These are illustrative assumptions — <strong>not official Indian tax rules</strong></li>
                <li>Actual tax depends on business structure, eligible deductions, and applicable law</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default TaxAgentView;
