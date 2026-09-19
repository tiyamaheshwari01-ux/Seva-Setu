import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, IndianRupee, TrendingDown, DollarSign } from "lucide-react";
import { mockSalesData, getAnnualSummary, FINANCIAL_YEARS } from "../data/mockSalesData.js";

const fmt = (n) => Number(n).toLocaleString("en-IN");
const fmtShort = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
};

function SalesRevenueView({ selectedYear, onYearChange }) {
  const [chartType, setChartType] = useState("bar");
  const months = mockSalesData[selectedYear] || [];
  const summary = useMemo(() => getAnnualSummary(selectedYear), [selectedYear]);

  const chartData = months.map((m) => ({
    name: m.shortMonth,
    Sales: m.sales,
    Expenses: m.expenses,
    Profit: m.sales - m.expenses,
  }));

  const overviewCards = [
    {
      label: "Total Annual Sales",
      value: `₹${fmt(summary.totalSales)}`,
      icon: <IndianRupee size={20} />,
      colorClass: "revenue",
      sub: `${summary.monthCount} months`,
    },
    {
      label: "Total Transactions",
      value: fmt(summary.totalTransactions),
      icon: <ShoppingBag size={20} />,
      colorClass: "orders",
      sub: `Avg ${Math.round(summary.totalTransactions / 12)}/month`,
    },
    {
      label: "Avg Monthly Sales",
      value: `₹${fmt(summary.avgMonthlySales)}`,
      icon: <TrendingUp size={20} />,
      colorClass: "customers",
      sub: `Best: ${summary.bestMonth.shortMonth}`,
    },
    {
      label: "Total Expenses",
      value: `₹${fmt(summary.totalExpenses)}`,
      icon: <TrendingDown size={20} />,
      colorClass: "red",
      sub: `${((summary.totalExpenses / summary.totalSales) * 100).toFixed(1)}% of revenue`,
    },
    {
      label: "Estimated Gross Profit",
      value: `₹${fmt(summary.estimatedProfit)}`,
      icon: <DollarSign size={20} />,
      colorClass: "green",
      sub: `${((summary.estimatedProfit / summary.totalSales) * 100).toFixed(1)}% margin`,
    },
  ];

  return (
    <div className="sales-revenue-view">
      {/* Header Row */}
      <div className="sr-header">
        <div>
          <h2 className="sr-title">Sales &amp; Revenue</h2>
          <p className="sr-subtitle">Full financial year overview with monthly breakdown</p>
        </div>
        <div className="sr-year-selector">
          <label>Financial Year</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
          >
            {FINANCIAL_YEARS.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Annual Overview Cards */}
      <section className="sr-overview-grid">
        {overviewCards.map((card) => (
          <div key={card.label} className="sr-overview-card">
            <div className={`sr-card-icon ${card.colorClass}`}>{card.icon}</div>
            <div className="sr-card-body">
              <p className="sr-card-label">{card.label}</p>
              <h3 className="sr-card-value">{card.value}</h3>
              <span className="sr-card-sub">{card.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Monthly Chart */}
      <section className="card sr-chart-card">
        <div className="card-header">
          <div>
            <h3>Monthly Sales Chart</h3>
            <p>Sales vs Expenses vs Profit — {selectedYear}</p>
          </div>
          <div className="period-toggle-group">
            <button
              className={`period-button ${chartType === "bar" ? "active" : ""}`}
              onClick={() => setChartType("bar")}
            >
              Bar
            </button>
            <button
              className={`period-button ${chartType === "line" ? "active" : ""}`}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
          </div>
        </div>

        <div className="chart-container" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtShort}
                  fontSize={11}
                  width={55}
                />
                <Tooltip
                  formatter={(value, name) => [`₹${fmt(value)}`, name]}
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                />
                <Legend />
                <Bar dataKey="Sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtShort}
                  fontSize={11}
                  width={55}
                />
                <Tooltip
                  formatter={(value, name) => [`₹${fmt(value)}`, name]}
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                />
                <Legend />
                <Line type="monotone" dataKey="Sales" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Expenses" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Profit" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Breakdown Table */}
      <section className="card sr-table-card">
        <div className="card-header">
          <div>
            <h3>Monthly Breakdown</h3>
            <p>Detailed month-by-month financial data for {selectedYear}</p>
          </div>
        </div>

        <div className="sr-table-wrapper">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-right">Sales</th>
                <th className="text-right">Transactions</th>
                <th className="text-right">Expenses</th>
                <th className="text-right">Est. Profit</th>
                <th className="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => {
                const profit = m.sales - m.expenses;
                const margin = ((profit / m.sales) * 100).toFixed(1);
                const isBest = m.month === summary.bestMonth.month;
                const isWorst = m.month === summary.worstMonth.month;
                return (
                  <tr
                    key={m.month}
                    className={isBest ? "row-best" : isWorst ? "row-worst" : ""}
                  >
                    <td>
                      {m.month}
                      {isBest && <span className="row-badge best">Best</span>}
                      {isWorst && <span className="row-badge worst">Lowest</span>}
                    </td>
                    <td className="text-right text-blue-val">₹{fmt(m.sales)}</td>
                    <td className="text-right">{m.transactions.toLocaleString("en-IN")}</td>
                    <td className="text-right text-orange-val">₹{fmt(m.expenses)}</td>
                    <td className="text-right text-green-val">₹{fmt(profit)}</td>
                    <td className="text-right">
                      <span className={`margin-pill ${parseFloat(margin) >= 40 ? "high" : parseFloat(margin) >= 30 ? "mid" : "low"}`}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="table-totals-row">
                <td><strong>Total</strong></td>
                <td className="text-right"><strong>₹{fmt(summary.totalSales)}</strong></td>
                <td className="text-right"><strong>{fmt(summary.totalTransactions)}</strong></td>
                <td className="text-right"><strong>₹{fmt(summary.totalExpenses)}</strong></td>
                <td className="text-right"><strong>₹{fmt(summary.estimatedProfit)}</strong></td>
                <td className="text-right">
                  <strong>{((summary.estimatedProfit / summary.totalSales) * 100).toFixed(1)}%</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SalesRevenueView;
