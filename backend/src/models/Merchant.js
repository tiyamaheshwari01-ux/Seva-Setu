import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      default: "Retail & Groceries",
    },
    currency: {
      type: String,
      default: "INR",
    },
    settings: {
      autoCampaigns: { type: Boolean, default: false },
      dailySummary: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Merchant", merchantSchema);
