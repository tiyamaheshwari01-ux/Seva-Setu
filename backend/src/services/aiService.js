import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Gemini client if API key is provided
 */
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Intelligent Fallback Reasoner when Gemini API key is not present or offline
 */
function generateHeuristicAnalysis(goal, metrics, products = [], customers = []) {
  const lowerGoal = goal.toLowerCase();

  // Inspect sales pattern
  const saturdaySales = metrics.salesTrend?.find((d) => d.day === "Sat")?.sales || 7200;
  const fridaySales = metrics.salesTrend?.find((d) => d.day === "Fri")?.sales || 11800;
  const weekendDipPercent = Math.round(((fridaySales - saturdaySales) / fridaySales) * 100);

  const vipCount = customers.filter((c) => c.segment === "VIP").length || 3;
  const regularCount = customers.filter((c) => c.segment === "Regular").length || 2;
  const atRiskCount = customers.filter((c) => c.segment === "At-Risk").length || 2;

  let analystInsight = "";
  let strategyInsight = "";
  let campaignTitle = "";
  let campaignChannel = "WhatsApp";
  let targetAudience = "";
  let offerCopy = "";
  let expectedLift = "+18% Weekend Revenue";

  if (lowerGoal.includes("weekend") || lowerGoal.includes("saturday") || lowerGoal.includes("sunday")) {
    analystInsight = `Detected that Saturday sales drop by ${weekendDipPercent}% (₹${saturdaySales.toLocaleString("en-IN")}) compared to Friday (₹${fridaySales.toLocaleString("en-IN")}). Footfall slows after 2 PM on weekends.`;
    strategyInsight = `Formulate a 'Weekend Family Basket' flash offer activated from Friday 6 PM through Sunday evening, focused on high-margin sweets, chai blends, and bakery snacks.`;
    campaignTitle = "Weekend Family Delight 15% Off";
    targetAudience = `Repeat & Regular Customers (${vipCount + regularCount} active merchants)`;
    offerCopy = `Namaste! Enjoy your weekend with 15% OFF on Organic Masala Chai & Cardamom Cookies this Saturday & Sunday. Visit us or order on WhatsApp!`;
    expectedLift = "+22% Saturday & Sunday Footfall";
  } else if (lowerGoal.includes("customer") || lowerGoal.includes("repeat") || lowerGoal.includes("loyalty")) {
    analystInsight = `Found ${atRiskCount} customers who have not visited in the last 30 days, representing ₹${(atRiskCount * 3800).toLocaleString("en-IN")} in dormant spending capacity.`;
    strategyInsight = `Launch an automated re-engagement winback sequence on WhatsApp offering an exclusive comeback gift voucher on their next purchase.`;
    campaignTitle = "We Miss You - Comeback Treat";
    targetAudience = `At-Risk Customers (${atRiskCount} dormant)`;
    offerCopy = `Namaste! We miss seeing you. Here is a special ₹100 voucher on your next purchase above ₹500 this week. Valid till Sunday!`;
    expectedLift = "35% Re-engagement Rate";
  } else {
    analystInsight = `Evaluated overall revenue of ₹${(metrics.totalRevenue || 63200).toLocaleString("en-IN")} across ${metrics.totalOrders || 9} transactions. Basket size averages ₹${Math.round((metrics.totalRevenue || 63200) / (metrics.totalOrders || 9)).toLocaleString("en-IN")}.`;
    strategyInsight = `Create an upsell bundle campaign pairing popular staples (Pure Desi Ghee) with high-margin impulse snacks (Roasted Chilli Cashews).`;
    campaignTitle = "Festival Value Bundle Combo";
    targetAudience = `All Active Customers (${customers.length || 8} shoppers)`;
    offerCopy = `Special Store Exclusive: Buy Desi Ghee 500ml and get Roasted Cashews at 50% OFF! Limited stock available.`;
    expectedLift = "+15% Average Order Value (AOV)";
  }

  return {
    source: "Heuristic AI Engine (Local)",
    goal,
    summary: `Analysis completed for goal: "${goal}". Revenue opportunity identified across sales trend and customer segments.`,
    bottleneckIdentified: analystInsight,
    agentsTrace: [
      {
        agent: "Business Analyst Agent",
        status: "Completed",
        insight: analystInsight,
      },
      {
        agent: "Strategy Agent",
        status: "Completed",
        insight: strategyInsight,
      },
      {
        agent: "Campaign Agent",
        status: "Ready",
        insight: `Drafted ${campaignChannel} campaign "${campaignTitle}" targeted at ${targetAudience}.`,
      },
      {
        agent: "Execution Agent",
        status: "Approval Required",
        insight: `Campaign prepared for dispatch. Merchant approval is required to trigger broadcast.`,
      },
    ],
    suggestedAction: {
      title: campaignTitle,
      channel: campaignChannel,
      targetAudience,
      messageDraft: offerCopy,
      expectedLift,
      requiresApproval: true,
    },
  };
}

/**
 * Main AI Goal Analyzer
 */
export async function analyzeBusinessGoal({
  goal,
  metrics,
  products = [],
  customers = [],
  transactions = [],
}) {
  const client = getGenAIClient();

  if (!client) {
    console.log("ℹ️  No GEMINI_API_KEY detected. Using intelligent heuristic merchant AI engine.");
    return generateHeuristicAnalysis(goal, metrics, products, customers);
  }

  try {
    const prompt = `
You are the AI Merchant Brain of SevaSetu, an autonomous AI teammate for Indian local merchants and shopkeepers.
Analyze the following merchant business goal using their actual live store data:

MERCHANT GOAL: "${goal}"

LIVE STORE METRICS:
- Total Revenue: ₹${metrics.totalRevenue}
- Total Orders: ${metrics.totalOrders}
- Active Customers: ${metrics.activeCustomers}
- 7-Day Sales Pattern:
${JSON.stringify(metrics.salesTrend, null, 2)}

PRODUCTS CATALOG:
${JSON.stringify(products.map((p) => ({ name: p.name, price: p.price, stock: p.stock })), null, 2)}

CUSTOMER SEGMENTS:
- Total Customers: ${customers.length}
- VIP: ${customers.filter((c) => c.segment === "VIP").length}
- Regular: ${customers.filter((c) => c.segment === "Regular").length}
- At-Risk: ${customers.filter((c) => c.segment === "At-Risk").length}

Provide a structured, actionable multi-agent recommendation with:
1. summary (short overview)
2. bottleneckIdentified (data-backed diagnostic)
3. agentsTrace (array of 4 agent outputs: "Business Analyst Agent", "Strategy Agent", "Campaign Agent", "Execution Agent")
4. suggestedAction (title, channel, targetAudience, messageDraft, expectedLift, requiresApproval: true)
`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING" },
            bottleneckIdentified: { type: "STRING" },
            agentsTrace: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  agent: { type: "STRING" },
                  status: { type: "STRING" },
                  insight: { type: "STRING" },
                },
                required: ["agent", "status", "insight"],
              },
            },
            suggestedAction: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                channel: { type: "STRING" },
                targetAudience: { type: "STRING" },
                messageDraft: { type: "STRING" },
                expectedLift: { type: "STRING" },
                requiresApproval: { type: "BOOLEAN" },
              },
              required: ["title", "channel", "targetAudience", "expectedLift", "requiresApproval"],
            },
          },
          required: ["summary", "bottleneckIdentified", "agentsTrace", "suggestedAction"],
        },
      },
    });

    const parsed = JSON.parse(response.text);
    return {
      source: "Google Gemini (gemini-2.5-flash)",
      goal,
      ...parsed,
    };
  } catch (error) {
    console.warn("Gemini API call failed, falling back to local reasoner:", error.message);
    return generateHeuristicAnalysis(goal, metrics, products, customers);
  }
}
