import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Smartphone,
  Save,
  CheckCircle2,
  RefreshCw,
  Store,
} from "lucide-react";
import { getSettings, updateSettings } from "../services/api";

export default function SettingsView() {
  const [settings, setSettings] = useState({
    storeName: "SevaSetu Gourmet Kirana",
    merchantName: "Merchant Owner",
    storeCity: "Mumbai, MH",
    whatsappNumber: "+91 98200 00123",
    whatsappStatus: "Connected (Verified Business)",
    paytmMerchantId: "PAYTM_SEVA_8831",
    paytmUpiId: "sevasetu@paytm",
    maxDiscountLimit: 20,
    maxWeeklyBroadcastsPerCustomer: 2,
    governanceMode: "Human-in-the-Loop Approval Required",
    aiModelEngine: "Gemini 3.8 Flash (Orchestrated)",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        if (data) setSettings(data);
      } catch (e) {
        console.error("Error loading settings:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert("Failed to save settings: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="view-loading">
        <RefreshCw size={24} className="animate-spin text-blue" />
        <span>Loading Merchant Settings...</span>
      </div>
    );
  }

  return (
    <div className="settings-view">
      <div className="view-header">
        <div>
          <h2>Merchant Profile & AI Safety Guardrails</h2>
          <p>Configure business identities, integration credentials, and autonomous agent safety limits.</p>
        </div>
        <div className="view-actions">
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="toast-success">
          <CheckCircle2 size={18} className="text-green" />
          <span>Settings and AI safety guardrails saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-grid">
        {/* CARD 1: STORE PROFILE */}
        <div className="card settings-card">
          <div className="card-header">
            <div>
              <h3>Store Profile</h3>
              <p>Business identity and location</p>
            </div>
            <Store size={20} className="text-blue" />
          </div>

          <div className="form-group">
            <label>Store / Business Name</label>
            <input
              type="text"
              value={settings.storeName || ""}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Merchant Contact Name</label>
            <input
              type="text"
              value={settings.merchantName || ""}
              onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Operating City</label>
            <input
              type="text"
              value={settings.storeCity || ""}
              onChange={(e) => setSettings({ ...settings, storeCity: e.target.value })}
            />
          </div>
        </div>

        {/* CARD 2: PARTNER INTEGRATIONS */}
        <div className="card settings-card">
          <div className="card-header">
            <div>
              <h3>Partner Integrations</h3>
              <p>Meta WhatsApp Business & Paytm Merchant</p>
            </div>
            <Smartphone size={20} className="text-green" />
          </div>

          <div className="form-group">
            <label>WhatsApp Cloud API Number</label>
            <input
              type="text"
              value={settings.whatsappNumber || ""}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
            />
            <span className="field-hint text-green">Status: Verified Business Account</span>
          </div>

          <div className="form-group">
            <label>Paytm Merchant ID</label>
            <input
              type="text"
              value={settings.paytmMerchantId || ""}
              onChange={(e) => setSettings({ ...settings, paytmMerchantId: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Paytm UPI Settlement ID</label>
            <input
              type="text"
              value={settings.paytmUpiId || ""}
              onChange={(e) => setSettings({ ...settings, paytmUpiId: e.target.value })}
            />
          </div>
        </div>

        {/* CARD 3: AI SAFETY GUARDRAILS */}
        <div className="card settings-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <div>
              <h3>Autonomous AI Safety Guardrails</h3>
              <p>Strict boundaries enforced across Strategy, Campaign, and Execution Agents</p>
            </div>
            <ShieldCheck size={22} className="text-purple" />
          </div>

          <div className="guardrails-row">
            <div className="form-group slider-group">
              <div className="slider-label-row">
                <label>Max Promotional Discount Limit</label>
                <strong>{settings.maxDiscountLimit}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="5"
                value={settings.maxDiscountLimit || 20}
                onChange={(e) =>
                  setSettings({ ...settings, maxDiscountLimit: Number(e.target.value) })
                }
              />
              <span className="field-hint">
                AI agents are barred from proposing discounts exceeding {settings.maxDiscountLimit}%.
              </span>
            </div>

            <div className="form-group slider-group">
              <div className="slider-label-row">
                <label>Weekly Customer Contact Frequency</label>
                <strong>Max {settings.maxWeeklyBroadcastsPerCustomer} messages / week</strong>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={settings.maxWeeklyBroadcastsPerCustomer || 2}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxWeeklyBroadcastsPerCustomer: Number(e.target.value),
                  })
                }
              />
              <span className="field-hint">
                Prevents audience fatigue by throttling repeat broadcasts.
              </span>
            </div>
          </div>

          <div className="governance-status-box">
            <ShieldCheck size={20} className="text-green" />
            <div>
              <strong>Human-in-the-Loop Governance: ACTIVE</strong>
              <p>
                Execution Agent requires merchant confirmation before any external WhatsApp or Paytm dispatch occurs.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
