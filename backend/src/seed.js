import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB, isDbConnected } from "./config/db.js";
import Customer from "./models/Customer.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import Campaign from "./models/Campaign.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");

async function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

async function seed() {
  console.log("🌱 Starting SevaSetu database seeder...");

  const connected = await connectDB();
  if (!connected) {
    console.log("❌ Cannot seed: MongoDB is not reachable.");
    console.log("💡 Ensure MongoDB is running locally or set MONGODB_URI in .env.");
    process.exit(1);
  }

  try {
    const customers = await loadJson("customers.json");
    const products = await loadJson("products.json");
    const transactions = await loadJson("transactions.json");

    // Clear existing data
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});

    console.log("🧹 Cleared existing database records.");

    // Insert new data
    await Customer.insertMany(customers);
    console.log(`✅ Seeded ${customers.length} customers.`);

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products.`);

    await Transaction.insertMany(transactions);
    console.log(`✅ Seeded ${transactions.length} transactions.`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();
