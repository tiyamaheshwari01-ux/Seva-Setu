/**
 * SevaSetu – Mock Sales Data
 *
 * One complete financial year of realistic merchant sales data.
 * Structure is keyed by financial year so additional years can be added easily.
 *
 * Fields per month:
 *   month        - Display name
 *   shortMonth   - Abbreviated label for charts
 *   sales        - Total sales revenue (INR)
 *   transactions - Number of transactions
 *   expenses     - Total recorded expenses (INR)
 *   notes        - Optional business context
 */

export const FINANCIAL_YEARS = ["FY 2025-26"];

export const mockSalesData = {
  "FY 2025-26": [
    {
      month: "April 2025",
      shortMonth: "Apr",
      sales: 148500,
      transactions: 312,
      expenses: 68200,
      notes: "New financial year start, steady baseline sales.",
    },
    {
      month: "May 2025",
      shortMonth: "May",
      sales: 162300,
      transactions: 338,
      expenses: 72500,
      notes: "Slight uptick – summer beverages and snacks in demand.",
    },
    {
      month: "June 2025",
      shortMonth: "Jun",
      sales: 139800,
      transactions: 291,
      expenses: 65800,
      notes: "Monsoon season begins – walk-in footfall dips slightly.",
    },
    {
      month: "July 2025",
      shortMonth: "Jul",
      sales: 145200,
      transactions: 305,
      expenses: 67400,
      notes: "Monsoon staples (chai, cookies, comfort foods) perform well.",
    },
    {
      month: "August 2025",
      shortMonth: "Aug",
      sales: 178900,
      transactions: 376,
      expenses: 79200,
      notes: "Independence Day + Raksha Bandhan festive boost.",
    },
    {
      month: "September 2025",
      shortMonth: "Sep",
      sales: 156400,
      transactions: 329,
      expenses: 71300,
      notes: "Post-festival normalization; back-to-school purchases.",
    },
    {
      month: "October 2025",
      shortMonth: "Oct",
      sales: 234700,
      transactions: 492,
      expenses: 98600,
      notes: "Navratri + Dussehra – peak festive season begins.",
    },
    {
      month: "November 2025",
      shortMonth: "Nov",
      sales: 289500,
      transactions: 608,
      expenses: 118400,
      notes: "Diwali month – highest sales of the year.",
    },
    {
      month: "December 2025",
      shortMonth: "Dec",
      sales: 198600,
      transactions: 417,
      expenses: 87500,
      notes: "Post-Diwali cool-down; Christmas sweets pickup.",
    },
    {
      month: "January 2026",
      shortMonth: "Jan",
      sales: 152300,
      transactions: 320,
      expenses: 69800,
      notes: "Winter staples steady. New Year promotions help.",
    },
    {
      month: "February 2026",
      shortMonth: "Feb",
      sales: 144800,
      transactions: 304,
      expenses: 66200,
      notes: "Shortest month. Valentine's gifting packs add margin.",
    },
    {
      month: "March 2026",
      shortMonth: "Mar",
      sales: 186400,
      transactions: 391,
      expenses: 81700,
      notes: "Holi season + year-end purchases push sales up.",
    },
  ],
};

/**
 * Helper: Get annual summary for a given financial year
 */
export function getAnnualSummary(year = "FY 2025-26") {
  const months = mockSalesData[year] || [];
  const totalSales = months.reduce((sum, m) => sum + m.sales, 0);
  const totalTransactions = months.reduce((sum, m) => sum + m.transactions, 0);
  const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
  const estimatedProfit = totalSales - totalExpenses;
  const avgMonthlySales = Math.round(totalSales / months.length);

  const bestMonth = months.reduce((best, m) => (m.sales > best.sales ? m : best), months[0]);
  const worstMonth = months.reduce((worst, m) => (m.sales < worst.sales ? m : worst), months[0]);

  return {
    year,
    totalSales,
    totalTransactions,
    totalExpenses,
    estimatedProfit,
    avgMonthlySales,
    bestMonth,
    worstMonth,
    monthCount: months.length,
  };
}

export default mockSalesData;
