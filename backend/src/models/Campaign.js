import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaignId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      enum: ["WhatsApp", "SMS", "Email"],
      default: "WhatsApp",
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Active", "Completed", "Cancelled"],
      default: "Draft",
    },
    targetAudience: {
      type: String,
      default: "All Customers",
    },
    messageContent: {
      type: String,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: String,
      default: "0%",
    },
    budget: {
      type: Number,
      default: 0,
    },
    roi: {
      type: String,
      default: "0x",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Campaign", campaignSchema);
