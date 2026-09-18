import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB with graceful fallback for local development
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/sevasetu";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Fail fast if local MongoDB is not active
    });

    isConnected = true;
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️  MongoDB not reachable at ${uri}.`);
    console.log(`💡 Running with local JSON dataset fallback (Phase 3 offline mode).`);
    return false;
  }
};

export const isDbConnected = () => isConnected;
