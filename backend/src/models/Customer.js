import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    segment: {
      type: String,
      enum: ["VIP", "Regular", "At-Risk", "New"],
      default: "Regular",
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    visitCount: {
      type: Number,
      default: 1,
    },
    lastVisit: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", customerSchema);
