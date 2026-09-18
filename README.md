# SevaSetu — AI Merchant Teammate

Autonomous Multi-Agent Kirana & Merchant AI copilot.

---

## 🚀 Quick Start (1-Click)
Double-click `start.bat` in this folder. It will:
1. Start the Express Backend on `http://localhost:5000`
2. Start the Vite React Frontend on `http://localhost:5173`
3. Automatically open `http://localhost:5173` in your browser

---

## 🛠 Manual Start (Terminal Instructions)

### Terminal 1: Backend
```powershell
cd C:\Users\Tiya\OneDrive\Desktop\sevasetu\backend
npm start
```
*Runs on http://localhost:5000*

### Terminal 2: Frontend
```powershell
cd C:\Users\Tiya\OneDrive\Desktop\sevasetu\frontend
npm run dev
```
*Runs on http://localhost:5173*

---

## 🎯 Demo Walkthrough for Judges
1. **Dashboard Tab**:
   - Shows store revenue (₹82,450), orders (1,284), active customers (642), and interactive 7d/14d/30d sales chart.
2. **Autonomous Multi-Agent AI**:
   - Click a quick goal like **"📉 Boost Weekend Sales"** or type a custom goal in the prompt box.
   - Click **"Analyze Goal"**.
   - Watch the 5 agents activate in pipeline:
     1. **Business Analyst Agent**: Identifies the 39% Saturday sales dip.
     2. **Strategy Agent**: Formulates high-margin bundle (Chai + Cardamom Cookies).
     3. **Campaign Agent**: Generates personalized WhatsApp promotional copy.
     4. **Execution Agent**: Verifies profit margin guardrails.
     5. **Monitoring Agent**: Locks pre-campaign revenue baselines.
3. **Human-in-the-Loop Governance**:
   - Scroll down to the **Approval Card**.
   - Click **"Approve & Broadcast via WhatsApp"**.
   - Generates simulated Paytm coupon voucher (`SEVA15`) and WhatsApp Cloud API dispatch receipt.
4. **Analytics Tab**:
   - Shows real-time closed-loop telemetry, post-campaign sales lift (+24.1%), conversion funnel (80%), and product velocity lift.
5. **Campaigns & Customers Tabs**:
   - Filter and search live campaigns and customer segments (VIP, Regular, At-Risk).
   - Click "Target At-Risk Customers" to trigger targeted AI flows.

---

## 🧩 Incomplete Areas & Next Steps (To Continue Building)
- **Live WhatsApp Business Webhooks**: Connect Meta WhatsApp Cloud API credentials to receive incoming customer replies.
- **Paytm Production Merchant Gateway**: Replace simulated Paytm vouchers with real Paytm POS / Dynamic UPI QR codes.
- **MongoDB Atlas Cloud DB**: If offline JSON mode is turned off, connect a MongoDB Atlas connection URI in `backend/.env`.
- **Gemini Live Key**: Add your `GEMINI_API_KEY` in `backend/.env` to switch from local deterministic engine to live LLM generation.
