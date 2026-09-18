import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB, isDbConnected } from "./config/db.js";
import goalRoutes from "./routes/goalRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Connect to Database (with fallback)
connectDB();

// Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SevaSetu API",
    database: isDbConnected() ? "connected" : "fallback_json_mode",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/goals", goalRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/settings", settingsRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 SevaSetu Backend is running on port ${PORT}`);
  console.log(`📡 Health:    http://localhost:${PORT}/api/health`);
  console.log(`🎯 Goals:     http://localhost:${PORT}/api/goals/metrics`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics/monitoring`);
  console.log(`👥 Customers: http://localhost:${PORT}/api/customers`);
  console.log(`⚙️  Settings:  http://localhost:${PORT}/api/settings`);
  console.log(`========================================`);
});

export default app;
