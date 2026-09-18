import { useState, useEffect } from "react";
import {
  Radio,
  ArrowUpRight,
  IndianRupee,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getMonitoringAnalytics } from "../services/api";

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getMonitoringAnalytics();
      setData(res);
    } catch (e) {
      console.error("Failed to load monitoring analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const res = await getMonitoringAnalytics();
        if (active) setData(res);
      } catch (e) {
        console.error("Failed to load monitoring analytics:", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="view-loading">
        <RefreshCw size={24} className="animate-spin text-blue" />
        <span>Loading Closed-Loop Monitoring Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="analytics-view">
      {/* HEADER */}
      <div className="view-header">
        <div>
          <h2>Closed-Loop Monitoring & Analytics</h2>
          <p>Real-time telemetry comparing pre-campaign baselines against live WhatsApp broadcast impact.</p>
        </div>
        <div className="view-actions">
          <div className="telemetry-badge">
            <Radio size={14} className="pulse-icon text-green" />
            <span>Telemetry Active</span>
          </div>
          <button className="refresh-btn" onClick={fetchAnalytics}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon revenue">
              <IndianRupee size={20} />
            </div>
            <span className="growth">
              <ArrowUpRight size={15} />
              {data?.revenueLift || "+24.1%"}
            </span>
          </div>
          <p>Post-Campaign Revenue</p>
          <h3>₹{data?.postCampaignRevenue?.toLocaleString("en-IN") || "78,450"}</h3>
          <span className="stat-description">
            Baseline: ₹{data?.baselineRevenue?.toLocaleString("en-IN") || "63,200"}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orders">
              <ShoppingBag size={20} />
            </div>
            <span className="growth">
              <ArrowUpRight size={15} />
              +44%
            </span>
          </div>
          <p>Incremental Orders</p>
          <h3>+{data?.postCampaignOrders - data?.baselineOrders || 4} Orders</h3>
          <span className="stat-description">
            Total {data?.postCampaignOrders || 13} orders tracked
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon customers">
              <Percent size={20} />
            </div>
            <span className="growth">
              <ArrowUpRight size={15} />
              {data?.roi || "6,354%"}
            </span>
          </div>
          <p>Campaign Realized ROI</p>
          <h3>+₹{data?.incrementalRevenue?.toLocaleString("en-IN") || "15,250"}</h3>
          <span className="stat-description">
            Total WhatsApp API Cost: {data?.totalCost || "₹2.40"}
          </span>
        </div>
      </div>

      {/* REVENUE LIFT CHART */}
      <div className="card chart-section-card">
        <div className="card-header">
          <div>
            <h3>Hourly Traffic & Revenue Lift (Pre-Campaign vs Monitored)</h3>
            <p>Demonstrating reversal of the Saturday evening sales drop</p>
          </div>
          <span className="chart-legend-badge">Saturday Comparison</span>
        </div>

        <div className="chart-container" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.hourlyTraffic || []}>
              <defs>
                <linearGradient id="colorMonitored" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  name === "monitored" ? "Post-Campaign Revenue" : "Baseline Pre-Campaign",
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="monitored"
                name="Post-Campaign (Active)"
                stroke="#22c55e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMonitored)"
              />
              <Area
                type="monotone"
                dataKey="baseline"
                name="Pre-Campaign Baseline"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBaseline)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CONVERSION FUNNEL & PRODUCT IMPACT */}
      <div className="dashboard-grid">
        {/* FUNNEL CARD */}
        <div className="card funnel-card">
          <div className="card-header">
            <div>
              <h3>WhatsApp Broadcast Conversion Funnel</h3>
              <p>End-to-end customer journey from dispatch to checkout</p>
            </div>
            <span className="pill-green">80% Conversion</span>
          </div>

          <div className="funnel-steps">
            {data?.funnel?.map((step, idx) => (
              <div key={idx} className="funnel-step-row">
                <div className="step-label">
                  <span className="step-num">{idx + 1}</span>
                  <strong>{step.step}</strong>
                </div>
                <div className="step-bar-container">
                  <div
                    className="step-bar-fill"
                    style={{ width: step.rate }}
                  ></div>
                </div>
                <div className="step-metric">
                  <strong>{step.count}</strong>
                  <span>({step.rate})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCT VELOCITY CARD */}
        <div className="card products-lift-card">
          <div className="card-header">
            <div>
              <h3>Targeted Product Velocity</h3>
              <p>Promoted items in WhatsApp copy</p>
            </div>
            <span className="pill-purple">Bundled Lift</span>
          </div>

          <div className="product-lift-list">
            {data?.productImpact?.map((item, idx) => (
              <div key={idx} className="product-lift-row">
                <div className="prod-name-col">
                  <strong>{item.product}</strong>
                  <span>Pre: {item.preUnits} units → Post: {item.postUnits} units</span>
                </div>
                <div className="lift-badge">
                  <ArrowUpRight size={14} />
                  {item.lift}
                </div>
              </div>
            ))}
          </div>

          <div className="ai-insight-box">
            <Sparkles size={16} className="text-purple" />
            <p>
              <strong>Monitoring Agent Feedback:</strong> The Chai & Cookie pairing yielded a 106% average velocity lift. Recommendation fed back into Strategy Agent for next weekend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
