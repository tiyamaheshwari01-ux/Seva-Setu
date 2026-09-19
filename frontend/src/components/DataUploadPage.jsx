import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, FileSpreadsheet, Image, Receipt,
  Landmark, PenLine, Plug, ChevronRight, X,
  CheckCircle2, Loader2, ArrowRight, ChevronLeft
} from "lucide-react";

// ── Upload source options ──────────────────────────────────────────────────────
const SOURCE_OPTIONS = [
  {
    id: "excel",
    icon: <FileSpreadsheet size={22} />,
    label: "Excel / CSV",
    desc: "Spreadsheets with sales, expenses, inventory",
    accept: ".xlsx,.xls,.csv",
    color: "green",
  },
  {
    id: "pdf",
    icon: <FileText size={22} />,
    label: "PDF",
    desc: "GST returns, audit reports, statements",
    accept: ".pdf",
    color: "red",
  },
  {
    id: "photo",
    icon: <Image size={22} />,
    label: "Photo / Scan",
    desc: "Paper records, ledger photos, handwritten notes",
    accept: "image/*",
    color: "purple",
  },
  {
    id: "bills",
    icon: <Receipt size={22} />,
    label: "Bills / Invoices",
    desc: "Purchase bills, GST invoices, receipts",
    accept: ".pdf,image/*",
    color: "orange",
  },
  {
    id: "bank",
    icon: <Landmark size={22} />,
    label: "Bank Statement",
    desc: "Monthly bank CSV / PDF statements",
    accept: ".pdf,.csv",
    color: "blue",
  },
  {
    id: "manual",
    icon: <PenLine size={22} />,
    label: "Manual Entry",
    desc: "Enter key figures directly — no file needed",
    accept: null,
    color: "teal",
    noFile: true,
  },
  {
    id: "connect",
    icon: <Plug size={22} />,
    label: "Connect a Data Source",
    desc: "Tally, Busy, QuickBooks, Zoho Books (Coming soon)",
    accept: null,
    color: "indigo",
    comingSoon: true,
  },
];

// ── Processing stage labels ────────────────────────────────────────────────────
const PROCESSING_STAGES = [
  { key: "upload",   label: "File received",       icon: "📥" },
  { key: "detect",   label: "Data detected",        icon: "🔍" },
  { key: "extract",  label: "Fields extracted",     icon: "⚙️" },
  { key: "ready",    label: "Ready to use",         icon: "✅" },
];

// ── Manual Entry Form ──────────────────────────────────────────────────────────
function ManualEntryForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    monthlySales: "", monthlyExpenses: "", topProduct: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: "manual", data: form });
  };

  return (
    <div className="du-manual-form">
      <h3>Enter your key figures</h3>
      <p className="du-manual-hint">Even rough estimates help SevaSetu personalize your insights.</p>
      <form onSubmit={handleSubmit}>
        <div className="du-field">
          <label>Average Monthly Sales (₹)</label>
          <input
            type="number"
            placeholder="e.g. 80000"
            value={form.monthlySales}
            onChange={(e) => set("monthlySales", e.target.value)}
          />
        </div>
        <div className="du-field">
          <label>Average Monthly Expenses (₹)</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={form.monthlyExpenses}
            onChange={(e) => set("monthlyExpenses", e.target.value)}
          />
        </div>
        <div className="du-field">
          <label>Top Product / Service <span className="du-optional">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. Masala Chai, Mobile Repairs"
            value={form.topProduct}
            onChange={(e) => set("topProduct", e.target.value)}
          />
        </div>
        <div className="du-manual-actions">
          <button type="button" className="ob-skip-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="ob-continue-btn">
            Save & Continue <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Processing animation ───────────────────────────────────────────────────────
function ProcessingView({ fileName, onDone }) {
  const [currentStage, setCurrentStage] = useState(0);

  // Auto-advance stages
  useCallback(() => {
    if (currentStage < PROCESSING_STAGES.length - 1) {
      const t = setTimeout(() => setCurrentStage((s) => s + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [currentStage, onDone])();

  return (
    <div className="du-processing">
      <Loader2 size={36} className="du-processing-spinner" />
      <h3>Processing your data…</h3>
      <p className="du-processing-file">📄 {fileName}</p>

      <div className="du-stages">
        {PROCESSING_STAGES.map((stage, i) => (
          <div
            key={stage.key}
            className={`du-stage ${
              i < currentStage ? "du-stage--done" :
              i === currentStage ? "du-stage--active" : "du-stage--pending"
            }`}
          >
            <span className="du-stage-icon">
              {i < currentStage ? <CheckCircle2 size={16} /> : stage.icon}
            </span>
            <span className="du-stage-label">{stage.label}</span>
            {i === currentStage && (
              <span className="du-stage-dots">
                <span /><span /><span />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Preview / Done View ────────────────────────────────────────────────────────
function PreviewView({ uploadedData, onContinue }) {
  const { fileName, type, data } = uploadedData;

  const detectedFields = type === "manual"
    ? [
        { field: "Monthly Sales",    value: data.monthlySales ? `₹${Number(data.monthlySales).toLocaleString("en-IN")}` : "Not provided" },
        { field: "Monthly Expenses", value: data.monthlyExpenses ? `₹${Number(data.monthlyExpenses).toLocaleString("en-IN")}` : "Not provided" },
        { field: "Top Product",      value: data.topProduct || "Not provided" },
      ]
    : [
        { field: "File Name",    value: fileName },
        { field: "File Type",    value: type.charAt(0).toUpperCase() + type.slice(1) },
        { field: "Status",       value: "Processed successfully" },
        { field: "Data Fields",  value: "Sales, expenses, products, dates" },
        { field: "Records",      value: `~${Math.floor(Math.random() * 200) + 50} rows detected` },
      ];

  return (
    <div className="du-preview">
      <div className="du-preview-success">
        <CheckCircle2 size={40} className="du-check-icon" />
        <h3>Your data is ready!</h3>
        <p>SevaSetu has processed your {type === "manual" ? "entries" : "file"} and will personalize your dashboard.</p>
      </div>

      <div className="du-preview-table">
        <div className="du-preview-header">📋 Extracted Data Preview</div>
        {detectedFields.map((row, i) => (
          <div key={i} className="du-preview-row">
            <span className="du-preview-field">{row.field}</span>
            <span className="du-preview-value">{row.value}</span>
          </div>
        ))}
      </div>

      <button className="ob-continue-btn du-continue-wide" onClick={onContinue}>
        Go to My Dashboard <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ── Main DataUploadPage ────────────────────────────────────────────────────────
export default function DataUploadPage({ businessProfile, onComplete, onBack }) {
  const [dragOver, setDragOver]         = useState(false);
  const [showManual, setShowManual]     = useState(false);
  const [processingFile, setProcessingFile] = useState(null);  // { name, type }
  const [processingDone, setProcessingDone] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const fileInputRef = useRef(null);

  // Simulate file processing
  const handleFile = useCallback((file, sourceType = "file") => {
    if (!file) return;
    setProcessingFile({ name: file.name, type: sourceType });
    setProcessingDone(false);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, detectSourceType(file));
  };

  const detectSourceType = (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) return "excel";
    if (name.endsWith(".pdf")) return "pdf";
    if (file.type.startsWith("image/")) return "photo";
    return "file";
  };

  const handleBrowse = (accept) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept || "*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file, detectSourceType(file));
    };
    input.click();
  };

  const handleManualSubmit = (data) => {
    setProcessingFile({ name: "Manual Entry", type: "manual" });
    setProcessingDone(false);
    // For manual, skip processing animation — go straight to done
    setTimeout(() => {
      setUploadedData({ fileName: "Manual Entry", type: "manual", data: data.data });
      setProcessingDone(true);
    }, 1500);
    setShowManual(false);
  };

  const handleProcessingDone = () => {
    const { name, type } = processingFile;
    setUploadedData({ fileName: name, type, data: {} });
    setProcessingDone(true);
  };

  const handleSkip = () => {
    onComplete({ skipped: true });
  };

  // ── After processing completes ──────────────────────────────────────────────
  if (processingDone && uploadedData) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-header">
          <div className="ob-logo">SV</div>
          <div className="ob-brand">SevaSetu</div>
        </div>
        <div className="ob-progress">
          <div className="ob-step ob-step--done"><span className="ob-step-num">✓</span><span className="ob-step-label">Business Profile</span></div>
          <div className="ob-step-line ob-step-line--done" />
          <div className="ob-step ob-step--active"><span className="ob-step-num">2</span><span className="ob-step-label">Data Upload</span></div>
          <div className="ob-step-line" />
          <div className="ob-step ob-step--inactive"><span className="ob-step-num">3</span><span className="ob-step-label">Dashboard</span></div>
        </div>
        <div className="ob-content">
          <PreviewView uploadedData={uploadedData} onContinue={() => onComplete({ uploadedData })} />
        </div>
      </div>
    );
  }

  // ── Processing animation ────────────────────────────────────────────────────
  if (processingFile && !processingDone) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-header">
          <div className="ob-logo">SV</div>
          <div className="ob-brand">SevaSetu</div>
        </div>
        <div className="ob-progress">
          <div className="ob-step ob-step--done"><span className="ob-step-num">✓</span><span className="ob-step-label">Business Profile</span></div>
          <div className="ob-step-line ob-step-line--done" />
          <div className="ob-step ob-step--active"><span className="ob-step-num">2</span><span className="ob-step-label">Data Upload</span></div>
          <div className="ob-step-line" />
          <div className="ob-step ob-step--inactive"><span className="ob-step-num">3</span><span className="ob-step-label">Dashboard</span></div>
        </div>
        <div className="ob-content">
          <ProcessingView
            fileName={processingFile.name}
            onDone={processingFile.type === "manual" ? () => {} : handleProcessingDone}
          />
        </div>
      </div>
    );
  }

  // ── Manual entry form ───────────────────────────────────────────────────────
  if (showManual) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-header">
          <div className="ob-logo">SV</div>
          <div className="ob-brand">SevaSetu</div>
        </div>
        <div className="ob-content">
          <ManualEntryForm onSubmit={handleManualSubmit} onCancel={() => setShowManual(false)} />
        </div>
      </div>
    );
  }

  // ── Main upload screen ──────────────────────────────────────────────────────
  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <div className="ob-logo">SV</div>
        <div className="ob-brand">SevaSetu</div>
      </div>

      <div className="ob-progress">
        <div className="ob-step ob-step--done"><span className="ob-step-num">✓</span><span className="ob-step-label">Business Profile</span></div>
        <div className="ob-step-line ob-step-line--done" />
        <div className="ob-step ob-step--active"><span className="ob-step-num">2</span><span className="ob-step-label">Data Upload</span></div>
        <div className="ob-step-line" />
        <div className="ob-step ob-step--inactive"><span className="ob-step-num">3</span><span className="ob-step-label">Dashboard</span></div>
      </div>

      <div className="ob-content">
        <div className="ob-title-block">
          <h1>Bring your business data to SevaSetu</h1>
          <p>Upload any existing records — spreadsheets, PDFs, photos, invoices, or bank statements. We'll extract the data automatically. You can always add more later.</p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`du-dropzone ${dragOver ? "du-dropzone--active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => handleBrowse("*")}
        >
          <Upload size={32} className="du-drop-icon" />
          <div className="du-drop-title">Drag & Drop your files here</div>
          <div className="du-drop-sub">or click to browse</div>
          <div className="du-drop-types">
            Supports: Excel, CSV, PDF, Images, Scans, Invoices, Bank Statements
          </div>
        </div>

        {/* Source tiles */}
        <div className="du-sources-label">Or choose what you have:</div>
        <div className="du-sources-grid">
          {SOURCE_OPTIONS.map((src) => (
            <button
              key={src.id}
              className={`du-source-tile du-source-tile--${src.color} ${src.comingSoon ? "du-source-tile--disabled" : ""}`}
              onClick={() => {
                if (src.comingSoon) return;
                if (src.noFile) { setShowManual(true); return; }
                handleBrowse(src.accept);
              }}
              disabled={src.comingSoon}
              title={src.comingSoon ? "Coming soon" : undefined}
            >
              <span className="du-src-icon">{src.icon}</span>
              <div className="du-src-body">
                <span className="du-src-label">{src.label}</span>
                <span className="du-src-desc">{src.desc}</span>
              </div>
              {src.comingSoon && <span className="du-src-soon">Soon</span>}
              {!src.comingSoon && !src.noFile && <ChevronRight size={16} className="du-src-arrow" />}
            </button>
          ))}
        </div>

        {/* Processing pipeline indicator */}
        <div className="du-pipeline-strip">
          {PROCESSING_STAGES.map((s, i) => (
            <div key={s.key} className="du-pipeline-item">
              <span className="du-pipeline-icon">{s.icon}</span>
              <span className="du-pipeline-label">{s.label}</span>
              {i < PROCESSING_STAGES.length - 1 && <ArrowRight size={14} className="du-pipeline-arrow" />}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="ob-actions">
          <button className="ob-back-btn" onClick={onBack}>
            <ChevronLeft size={16} /> Back
          </button>
          <button className="ob-skip-btn" onClick={handleSkip}>Skip for now</button>
          <button className="ob-continue-btn" onClick={handleSkip}>
            Continue without uploading <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
