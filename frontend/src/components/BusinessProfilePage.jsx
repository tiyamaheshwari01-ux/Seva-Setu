import { useState } from "react";
import {
  Store, Clock, IndianRupee, CreditCard, Laptop, Building2,
  ChevronRight, Plus, Trash2, CheckCircle2
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  { id: "retail",       label: "Retail",             emoji: "🛒" },
  { id: "grocery",      label: "Grocery",            emoji: "🥦" },
  { id: "restaurant",   label: "Restaurant / Food",  emoji: "🍽️" },
  { id: "clothing",     label: "Clothing",           emoji: "👗" },
  { id: "electronics",  label: "Electronics",        emoji: "📱" },
  { id: "salon",        label: "Salon / Beauty",     emoji: "💇" },
  { id: "pharmacy",     label: "Pharmacy",           emoji: "💊" },
  { id: "manufacturing",label: "Manufacturing",      emoji: "🏭" },
  { id: "wholesale",    label: "Wholesale",          emoji: "📦" },
  { id: "ecommerce",    label: "E-commerce",         emoji: "🛍️" },
  { id: "services",     label: "Services",           emoji: "🔧" },
  { id: "education",    label: "Education",          emoji: "📚" },
  { id: "transport",    label: "Transport / Delivery",emoji: "🚚" },
  { id: "agriculture",  label: "Agriculture",        emoji: "🌾" },
  { id: "other",        label: "Other",              emoji: "🏷️" },
];

const OPERATING_DURATIONS = [
  "Less than 6 months", "6 months – 1 year",
  "1 – 3 years", "3 – 5 years", "5 – 10 years", "Over 10 years",
];

const REVENUE_RANGES = [
  "Under ₹50K/month", "₹50K – ₹1L/month", "₹1L – ₹5L/month",
  "₹5L – ₹20L/month", "₹20L – ₹50L/month", "Over ₹50L/month",
];

const PAYMENT_METHODS = [
  { id: "cash",   label: "Cash",   emoji: "💵" },
  { id: "upi",    label: "UPI",    emoji: "📲" },
  { id: "card",   label: "Card",   emoji: "💳" },
  { id: "online", label: "Online", emoji: "🌐" },
  { id: "mixed",  label: "Mixed",  emoji: "🔀" },
];

const BLANK_PROFILE = {
  businessName: "",
  businessType: "",
  operatingDuration: "",
  revenueRange: "",
  paymentMethods: [],
  usesSoftware: "",
};

// ── Single Business Form ────────────────────────────────────────────────────────
function SingleBusinessForm({ profile, index, onChange, onRemove, canRemove }) {
  const toggle = (field, value) => {
    const arr = profile[field] || [];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    onChange(index, { ...profile, [field]: next });
  };
  const set = (field, value) => onChange(index, { ...profile, [field]: value });

  return (
    <div className="bp-form-card">
      {canRemove && (
        <div className="bp-form-card-header">
          <span className="bp-biz-label">Business {index + 1}</span>
          <button className="bp-remove-btn" onClick={() => onRemove(index)} title="Remove this business">
            <Trash2 size={15} /> Remove
          </button>
        </div>
      )}

      {/* Business Name */}
      <div className="bp-field">
        <label className="bp-label">Business Name <span className="bp-optional">(optional)</span></label>
        <input
          className="bp-input"
          type="text"
          placeholder="e.g. Sharma General Store"
          value={profile.businessName}
          onChange={(e) => set("businessName", e.target.value)}
        />
      </div>

      {/* Business Type */}
      <div className="bp-field">
        <label className="bp-label"><Store size={14} /> What type of business do you have?</label>
        <div className="bp-type-grid">
          {BUSINESS_TYPES.map((t) => (
            <button
              key={t.id}
              className={`bp-type-chip ${profile.businessType === t.id ? "bp-type-chip--active" : ""}`}
              onClick={() => set("businessType", t.id)}
            >
              <span className="bp-type-emoji">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Operating Duration */}
      <div className="bp-field">
        <label className="bp-label"><Clock size={14} /> How long have you operated?</label>
        <div className="bp-pill-row">
          {OPERATING_DURATIONS.map((d) => (
            <button
              key={d}
              className={`bp-pill ${profile.operatingDuration === d ? "bp-pill--active" : ""}`}
              onClick={() => set("operatingDuration", d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Range */}
      <div className="bp-field">
        <label className="bp-label"><IndianRupee size={14} /> Approximate monthly revenue?</label>
        <div className="bp-pill-row">
          {REVENUE_RANGES.map((r) => (
            <button
              key={r}
              className={`bp-pill ${profile.revenueRange === r ? "bp-pill--active" : ""}`}
              onClick={() => set("revenueRange", r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bp-field">
        <label className="bp-label"><CreditCard size={14} /> Main payment methods used? <span className="bp-optional">(select all that apply)</span></label>
        <div className="bp-pill-row">
          {PAYMENT_METHODS.map((p) => (
            <button
              key={p.id}
              className={`bp-pill ${(profile.paymentMethods || []).includes(p.id) ? "bp-pill--active" : ""}`}
              onClick={() => toggle("paymentMethods", p.id)}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Software Usage */}
      <div className="bp-field">
        <label className="bp-label"><Laptop size={14} /> Do you use accounting software?</label>
        <div className="bp-pill-row">
          {["Yes", "No", "Partially"].map((opt) => (
            <button
              key={opt}
              className={`bp-pill ${profile.usesSoftware === opt ? "bp-pill--active" : ""}`}
              onClick={() => set("usesSoftware", opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BusinessProfilePage({ onComplete }) {
  const [profiles, setProfiles]     = useState([{ ...BLANK_PROFILE }]);
  const [multipleBusinesses, setMultipleBusinesses] = useState(null);
  const [errors, setErrors]         = useState([]);

  const handleChange = (index, updated) => {
    setProfiles((prev) => prev.map((p, i) => (i === index ? updated : p)));
  };

  const addProfile = () => {
    setProfiles((prev) => [...prev, { ...BLANK_PROFILE }]);
  };

  const removeProfile = (index) => {
    setProfiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMultiBiz = (answer) => {
    setMultipleBusinesses(answer);
    if (answer === "No" && profiles.length > 1) {
      setProfiles([profiles[0]]);
    }
  };

  const validate = () => {
    const errs = [];
    profiles.forEach((p, i) => {
      if (!p.businessType) errs.push(`Business ${i + 1}: Please select a business type.`);
    });
    if (multipleBusinesses === null) errs.push("Please answer the multiple businesses question.");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    onComplete({ profiles, multipleBusinesses });
  };

  const handleSkip = () => {
    onComplete({ profiles: [], multipleBusinesses: "No", skipped: true });
  };

  return (
    <div className="onboarding-page">
      {/* Header */}
      <div className="onboarding-header">
        <div className="ob-logo">SV</div>
        <div className="ob-brand">SevaSetu</div>
      </div>

      {/* Progress */}
      <div className="ob-progress">
        <div className="ob-step ob-step--active">
          <span className="ob-step-num">1</span>
          <span className="ob-step-label">Business Profile</span>
        </div>
        <div className="ob-step-line" />
        <div className="ob-step ob-step--inactive">
          <span className="ob-step-num">2</span>
          <span className="ob-step-label">Data Upload</span>
        </div>
        <div className="ob-step-line" />
        <div className="ob-step ob-step--inactive">
          <span className="ob-step-num">3</span>
          <span className="ob-step-label">Dashboard</span>
        </div>
      </div>

      <div className="ob-content">
        <div className="ob-title-block">
          <h1>Tell us about your business</h1>
          <p>SevaSetu personalizes your dashboard, AI insights, and tax estimates based on your business type.</p>
        </div>

        {/* Business forms */}
        {profiles.map((profile, idx) => (
          <SingleBusinessForm
            key={idx}
            index={idx}
            profile={profile}
            onChange={handleChange}
            onRemove={removeProfile}
            canRemove={profiles.length > 1}
          />
        ))}

        {/* Multiple businesses question */}
        <div className="bp-form-card">
          <div className="bp-field">
            <label className="bp-label"><Building2 size={14} /> Do you manage multiple businesses?</label>
            <div className="bp-pill-row">
              {["Yes", "No"].map((opt) => (
                <button
                  key={opt}
                  className={`bp-pill ${multipleBusinesses === opt ? "bp-pill--active" : ""}`}
                  onClick={() => handleMultiBiz(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            {multipleBusinesses === "Yes" && (
              <div className="bp-multi-biz-hint">
                <CheckCircle2 size={14} className="bp-hint-icon" />
                <span>You can add each business separately. SevaSetu will track them individually.</span>
              </div>
            )}
          </div>

          {multipleBusinesses === "Yes" && (
            <button className="bp-add-biz-btn" onClick={addProfile}>
              <Plus size={15} /> Add Another Business
            </button>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bp-errors">
            {errors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
          </div>
        )}

        {/* Actions */}
        <div className="ob-actions">
          <button className="ob-skip-btn" onClick={handleSkip}>Skip for now</button>
          <button className="ob-continue-btn" onClick={handleContinue}>
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
