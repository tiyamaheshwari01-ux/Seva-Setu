import "./App.css";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Users,
  Settings,
  Bell,
  Send,
  CheckCircle2,
  Clock3,
  Bot,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  UserRound,
  ArrowUpRight,
  ArrowDown,
  Sparkles,
  Loader2,
  Activity,
  Radio,
  ExternalLink,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getDashboardMetrics,
  analyzeGoal,
  approveCampaign,
  rejectCampaign,
} from "./services/api";

import ApprovalCard from "./components/ApprovalCard";
import AnalyticsView from "./components/AnalyticsView";
import CampaignsView from "./components/CampaignsView";
import CustomersView from "./components/CustomersView";
import SettingsView from "./components/SettingsView";
import NotificationsModal from "./components/NotificationsModal";

const salesPeriods = {
  "7d": [
    { day: "Mon", sales: 8200 },
    { day: "Tue", sales: 9400 },
    { day: "Wed", sales: 7800 },
    { day: "Thu", sales: 10200 },
    { day: "Fri", sales: 11800 },
    { day: "Sat", sales: 7200 },
    { day: "Sun", sales: 8600 },
  ],
  "14d": [
    { day: "W1 Mon", sales: 7600 },
    { day: "W1 Wed", sales: 8200 },
    { day: "W1 Fri", sales: 10900 },
    { day: "W1 Sun", sales: 8100 },
    { day: "W2 Tue", sales: 9400 },
    { day: "W2 Thu", sales: 10200 },
    { day: "W2 Sat", sales: 11500 },
    { day: "W2 Sun", sales: 12200 },
  ],
  "30d": [
    { day: "Week 1", sales: 54000 },
    { day: "Week 2", sales: 61000 },
    { day: "Week 3", sales: 58500 },
    { day: "Week 4", sales: 78450 },
  ],
};

function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'analytics' | 'campaigns' | 'customers' | 'settings'

  // Dashboard & Metrics State
  const [metrics, setMetrics] = useState({
    totalRevenue: 82450,
    revenueGrowth: 12.5,
    totalOrders: 1284,
    ordersGrowth: 8.2,
    activeCustomers: 642,
    customersGrowth: 5.4,
    salesTrend: salesPeriods["7d"],
  });

  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sevasetu_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sevasetu_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Goal & Multi-Agent state
  const [goal, setGoal] = useState("");
  const [submittedGoal, setSubmittedGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentTrace, setAgentTrace] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);

  // Phase 6 Approval State
  const [approvalStatus, setApprovalStatus] = useState("PENDING");
  const [campaignReceipt, setCampaignReceipt] = useState(null);

  // Fetch metrics on mount from Express Backend
  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getDashboardMetrics();
        if (data) {
          setMetrics(data);
          setServerOnline(true);
        }
      } catch (err) {
        console.warn("Backend not reached yet, using initial data.", err);
      }
    }
    loadMetrics();
  }, []);

  const handleAnalyze = async (overrideGoal) => {
    const goalToUse = typeof overrideGoal === "string" ? overrideGoal : goal;
    if (!goalToUse || !goalToUse.trim() || isLoading) return;

    setGoal(goalToUse);
    setIsLoading(true);
    setApprovalStatus("PENDING");
    setCampaignReceipt(null);

    try {
      const data = await analyzeGoal(goalToUse);
      setSubmittedGoal(goalToUse);
      setAgentTrace(data);

      // Smoothly scroll down so the user clearly sees the activity & approval card
      setTimeout(() => {
        document.getElementById("approval-card-anchor")?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } catch (error) {
      console.warn("Goal analysis error:", error.message);
      setSubmittedGoal(goalToUse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCampaign = async (payload) => {
    const response = await approveCampaign(payload);
    setApprovalStatus("APPROVED");
    setCampaignReceipt(response?.data?.receipt || null);
    return response;
  };

  const handleRejectCampaign = async (ticketId, reason) => {
    const response = await rejectCampaign(ticketId, reason);
    setApprovalStatus("REJECTED");
    return response;
  };

  const navigateToAiWithPrompt = (prompt) => {
    setActiveTab("dashboard");
    setGoal(prompt);
    handleAnalyze(prompt);
  };

  return (
    <div className="app-container" onClick={() => setShowNotifications(false)}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-section" onClick={() => setActiveTab("dashboard")}>
          <div className="logo-icon">S</div>
          <div>
            <h1>SevaSetu</h1>
            <span>AI Merchant Teammate</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 size={19} />
            <span>Analytics</span>
          </button>

          <button
            className={`nav-item ${activeTab === "campaigns" ? "active" : ""}`}
            onClick={() => setActiveTab("campaigns")}
          >
            <Megaphone size={19} />
            <span>Campaigns</span>
          </button>

          <button
            className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={19} />
            <span>Customers</span>
          </button>

          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div
            className="help-card"
            onClick={() => navigateToAiWithPrompt("Analyze best-selling inventory bundles for weekend sales")}
          >
            <Sparkles size={18} />
            <div>
              <strong>AI Teammate</strong>
              <p>Ready to help your business.</p>
            </div>
          </div>

          <div className="merchant-profile">
            <div className="profile-avatar">M</div>
            <div className="profile-info">
              <strong>Merchant</strong>
              <span>Business Account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h2>
              {activeTab === "dashboard" && "Good evening, Merchant 👋"}
              {activeTab === "analytics" && "Store Analytics & Monitoring 📊"}
              {activeTab === "campaigns" && "Campaign Registry 📢"}
              {activeTab === "customers" && "Customer Directory 👥"}
              {activeTab === "settings" && "Merchant Settings & Guardrails ⚙️"}
            </h2>
            <p>
              {activeTab === "dashboard" && "Here's what's happening with your business today."}
              {activeTab === "analytics" && "Closed-loop telemetry and post-broadcast sales lift."}
              {activeTab === "campaigns" && "Manage automated WhatsApp broadcasts and promotional vouchers."}
              {activeTab === "customers" && "Explore customer segments, frequency, and WhatsApp opt-in status."}
              {activeTab === "settings" && "Configure store credentials, discount boundaries, and AI governance."}
            </p>
          </div>

          <div className="topbar-actions" style={{ position: "relative" }}>
            {/* THEME TOGGLE BUTTON (LIGHT / DARK) */}
            <button
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle light and dark mode"
            >
              {theme === "dark" ? (
                <Sun size={19} className="theme-icon-sun" />
              ) : (
                <Moon size={19} className="theme-icon-moon" />
              )}
            </button>

            <button
              className="notification-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              title="View Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            <NotificationsModal
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />

            <div className="top-profile">
              <div className="profile-avatar small">M</div>
              <div>
                <strong>Merchant</strong>
                <span>Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* VIEW ROUTING */}
        {activeTab === "analytics" && <AnalyticsView />}

        {activeTab === "campaigns" && (
          <CampaignsView onNavigateToAi={navigateToAiWithPrompt} />
        )}

        {activeTab === "customers" && (
          <CustomersView onTargetSegment={navigateToAiWithPrompt} />
        )}

        {activeTab === "settings" && <SettingsView />}

        {/* DASHBOARD TAB VIEW */}
        {activeTab === "dashboard" && (
          <>
            {/* STATS CARDS */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon revenue">
                    <IndianRupee size={20} />
                  </div>
                  <span className="growth">
                    <ArrowUpRight size={15} />
                    {metrics.revenueGrowth}%
                  </span>
                </div>
                <p>Total Revenue</p>
                <h3>₹{metrics.totalRevenue.toLocaleString("en-IN")}</h3>
                <span className="stat-description">Compared to last month</span>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon orders">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="growth">
                    <ArrowUpRight size={15} />
                    {metrics.ordersGrowth}%
                  </span>
                </div>
                <p>Total Orders</p>
                <h3>{metrics.totalOrders.toLocaleString("en-IN")}</h3>
                <span className="stat-description">Compared to last month</span>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon customers">
                    <UserRound size={20} />
                  </div>
                  <span className="growth">
                    <ArrowUpRight size={15} />
                    {metrics.customersGrowth}%
                  </span>
                </div>
                <p>Customers</p>
                <h3>{metrics.activeCustomers.toLocaleString("en-IN")}</h3>
                <span className="stat-description">Active customers</span>
              </div>
            </section>

            {/* DASHBOARD GRID */}
            <section className="dashboard-grid">
              {/* SALES CHART */}
              <div className="card sales-card">
                <div className="card-header">
                  <div>
                    <h3>Sales Overview</h3>
                    <p>Revenue performance over time</p>
                  </div>
                  <div className="period-toggle-group">
                    {["7d", "14d", "30d"].map((period) => (
                      <button
                        key={period}
                        className={`period-button ${selectedPeriod === period ? "active" : ""}`}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period === "7d" && "7 Days"}
                        {period === "14d" && "14 Days"}
                        {period === "30d" && "30 Days"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesPeriods[selectedPeriod] || salesPeriods["7d"]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₹${Number(value).toLocaleString("en-IN")}`,
                          "Revenue",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI ASSISTANT CARD */}
              <div className="card ai-card">
                <div className="ai-header">
                  <div className="ai-title">
                    <div className="ai-icon">
                      <Bot size={22} />
                    </div>
                    <div>
                      <h3>AI Assistant</h3>
                      <p>Your autonomous business teammate</p>
                    </div>
                  </div>

                  <span className="online-status">
                    <span></span>
                    {agentTrace ? "Strategy Ready" : serverOnline ? "Backend Live" : "Online"}
                  </span>
                </div>

                {/* 1. LOADING STATE */}
                {isLoading && (
                  <div className="ai-executing-box">
                    <div className="exec-title-row">
                      <Loader2 size={18} className="animate-spin text-blue" />
                      <strong>Running 5 Autonomous Agents in Pipeline...</strong>
                    </div>
                    <div className="exec-steps-list">
                      <div className="exec-step active">
                        <Bot size={14} className="text-blue" />
                        <span>1. Business Analyst analyzing store sales trends...</span>
                      </div>
                      <div className="exec-step active">
                        <TrendingUp size={14} className="text-purple" />
                        <span>2. Strategy Agent evaluating margin safety & bundles...</span>
                      </div>
                      <div className="exec-step active">
                        <Megaphone size={14} className="text-green" />
                        <span>3. Campaign Agent drafting localized WhatsApp copy...</span>
                      </div>
                      <div className="exec-step active">
                        <Clock3 size={14} className="text-orange" />
                        <span>4. Execution Agent applying governance guardrails...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RESULT STATE (SHOWS RESULT DIRECTLY INSIDE THE CARD!) */}
                {!isLoading && agentTrace && (
                  <div className="ai-result-display">
                    <div className="user-prompt-bubble">
                      <span>Goal:</span>
                      <p>"{submittedGoal || goal}"</p>
                    </div>

                    <div className="ai-solution-card">
                      <div className="solution-header">
                        <div className="solution-header-left">
                          <Sparkles size={18} className="text-purple" />
                          <strong>Strategy Formulated by AI Teammate</strong>
                        </div>
                        <span className="pill-ready">Approval Required</span>
                      </div>

                      <div className="solution-body">
                        <div className="solution-fact">
                          <span className="fact-title">🔍 Diagnostic:</span>
                          <p>{agentTrace.bottleneckIdentified}</p>
                        </div>

                        <div className="solution-fact">
                          <span className="fact-title">🎯 Recommended Campaign:</span>
                          <p>
                            <strong>{agentTrace.suggestedAction?.title}</strong> ({agentTrace.suggestedAction?.expectedLift})
                          </p>
                        </div>
                      </div>

                      <div className="solution-cta-row">
                        <button
                          className="btn-scroll-to-approval"
                          onClick={() => {
                            document.getElementById("approval-card-anchor")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Review & Approve Broadcast
                          <ArrowDown size={15} />
                        </button>

                        <button
                          className="btn-ask-another"
                          onClick={() => {
                            setAgentTrace(null);
                            setGoal("");
                          }}
                          title="Ask another goal"
                        >
                          <RotateCcw size={14} />
                          New Goal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DEFAULT PROMPT INPUT STATE */}
                {!isLoading && !agentTrace && (
                  <>
                    <div className="ai-message">
                      <div className="bot-avatar">
                        <Bot size={18} />
                      </div>
                      <div className="message-bubble">
                        <strong>What would you like to achieve?</strong>
                        <p>
                          Enter your business goal or select a quick recommendation below.
                        </p>
                      </div>
                    </div>

                    {/* QUICK GOAL SUGGESTIONS */}
                    <div className="quick-suggestions">
                      <span className="quick-label">Quick Scenarios:</span>
                      <div className="chips-row">
                        <button
                          className="chip-btn"
                          onClick={() => handleAnalyze("My weekend sales are low. Increase them.")}
                          disabled={isLoading}
                        >
                          📉 Boost Weekend Sales
                        </button>
                        <button
                          className="chip-btn"
                          onClick={() => handleAnalyze("Re-engage at-risk customers with a 15% discount")}
                          disabled={isLoading}
                        >
                          🤝 Win-back At-Risk Buyers
                        </button>
                        <button
                          className="chip-btn"
                          onClick={() => handleAnalyze("Promote Monsoon Chai & Cardamom Cookie bundle")}
                          disabled={isLoading}
                        >
                          ☕ Chai & Cookie Combo
                        </button>
                      </div>
                    </div>

                    <div className="goal-input-container">
                      <textarea
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Example: My weekend sales are low. Increase them."
                        disabled={isLoading}
                      />

                      <button
                        className="analyze-button"
                        onClick={() => handleAnalyze()}
                        disabled={isLoading || !goal.trim()}
                      >
                        <Send size={17} />
                        Analyze Goal
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ANCHOR TO SCROLL TO RESULTS */}
            <div id="approval-card-anchor" style={{ scrollMarginTop: "24px" }}></div>

            {/* AGENT ACTIVITY */}
            <section className="card activity-card">
              <div className="card-header">
                <div>
                  <h3>Autonomous Multi-Agent Activity</h3>
                  <p>Step-by-step pipeline execution and governance</p>
                </div>

                <div className="live-indicator">
                  <span></span>
                  {agentTrace ? "Pipeline Complete" : "Live Pipeline"}
                </div>
              </div>

              <div className="activity-list">
                <ActivityItem
                  icon={<CheckCircle2 size={18} />}
                  title="System Initialized"
                  description={
                    agentTrace
                      ? `Goal received: "${agentTrace.goal}" (Completed in ${agentTrace.durationMs || 15}ms)`
                      : "SevaSetu ready to receive a business goal."
                  }
                  status="Completed"
                  completed={true}
                />

                <ActivityItem
                  icon={<Bot size={18} />}
                  title="1. Business Analyst Agent"
                  description={
                    agentTrace?.agentsTrace?.[0]?.insight ||
                    "Analyzes sales trends, basket sizes, and customer churn."
                  }
                  status={agentTrace ? "Completed" : "Waiting"}
                  completed={Boolean(agentTrace)}
                />

                <ActivityItem
                  icon={<TrendingUp size={18} />}
                  title="2. Strategy Agent"
                  description={
                    agentTrace?.agentsTrace?.[1]?.insight ||
                    "Identifies product bundling and timing opportunities."
                  }
                  status={agentTrace ? "Completed" : "Waiting"}
                  completed={Boolean(agentTrace)}
                />

                <ActivityItem
                  icon={<Megaphone size={18} />}
                  title="3. Campaign Agent"
                  description={
                    agentTrace?.agentsTrace?.[2]?.insight ||
                    "Drafts high-conversion localized copy for WhatsApp."
                  }
                  status={agentTrace ? "Completed" : "Waiting"}
                  completed={Boolean(agentTrace)}
                />

                <ActivityItem
                  icon={<Clock3 size={18} />}
                  title="4. Execution Agent"
                  description={
                    approvalStatus === "APPROVED"
                      ? `Campaign broadcast executed via WhatsApp Cloud API. Ticket ${agentTrace?.suggestedAction?.ticketId || ""} marked completed.`
                      : approvalStatus === "REJECTED"
                      ? `Proposal declined by merchant.`
                      : (agentTrace?.agentsTrace?.[3]?.insight || "Applies safety guardrails. Awaiting merchant authorization.")
                  }
                  status={
                    !agentTrace
                      ? "Waiting"
                      : approvalStatus === "APPROVED"
                      ? "Completed"
                      : approvalStatus === "REJECTED"
                      ? "Dismissed"
                      : "Approval Required"
                  }
                  completed={approvalStatus === "APPROVED"}
                />

                <ActivityItem
                  icon={<Activity size={18} />}
                  title="5. Monitoring Agent"
                  description={
                    approvalStatus === "APPROVED"
                      ? `Active tracking initialized. Baseline revenue ₹${agentTrace?.monitoringBaseline?.baselineRevenue?.toLocaleString("en-IN") || "63,200"} locked. Live conversion tracking in progress.`
                      : (agentTrace?.agentsTrace?.[4]?.insight || "Captures pre-campaign revenue baselines for ROI tracking.")
                  }
                  status={
                    !agentTrace
                      ? "Waiting"
                      : approvalStatus === "APPROVED"
                      ? "Active Monitoring"
                      : "Standing By"
                  }
                  completed={approvalStatus === "APPROVED"}
                />
              </div>
            </section>

            {/* PHASE 6: APPROVAL CARD */}
            {agentTrace?.suggestedAction && (
              <ApprovalCard
                actionPacket={agentTrace.suggestedAction}
                onApproved={handleApproveCampaign}
                onRejected={handleRejectCampaign}
              />
            )}

            {/* ACTIVE CAMPAIGN BANNER ONCE APPROVED */}
            {approvalStatus === "APPROVED" && (
              <section className="card active-campaign-banner">
                <div className="banner-icon-box">
                  <Radio size={24} className="pulse-icon text-green" />
                </div>
                <div className="banner-content">
                  <div className="banner-top-row">
                    <span className="live-tag">LIVE BROADCAST</span>
                    <h4>{agentTrace?.suggestedAction?.title || "Weekend Family Basket Flash Sale"}</h4>
                  </div>
                  <p>
                    Sent to <strong>{agentTrace?.suggestedAction?.targetCount || 5} customers</strong> via WhatsApp Business API with promotional Paytm coupon code{" "}
                    <code>{campaignReceipt?.couponGenerated?.couponCode || "SEVA15"}</code>.
                  </p>
                </div>
                <div className="banner-action-col">
                  <button
                    className="btn-monitor-switch"
                    onClick={() => setActiveTab("analytics")}
                  >
                    View Closed-Loop Analytics
                    <ExternalLink size={14} />
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ACTIVITY ITEM COMPONENT */
function ActivityItem({ icon, title, description, status, completed }) {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${completed ? "completed" : ""}`}>
        {icon}
      </div>

      <div className="activity-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <span className={`activity-status ${completed ? "completed-status" : ""}`}>
        {status}
      </span>
    </div>
  );
}

export default App;