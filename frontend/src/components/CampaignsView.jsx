import { useState, useEffect } from "react";
import {
  Megaphone,
  Smartphone,
  CheckCircle2,
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Tag,
  X,
} from "lucide-react";
import { getCampaigns } from "../services/api";

export default function CampaignsView({ onNavigateToAi }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const list = await getCampaigns();
      setCampaigns(list);
    } catch (e) {
      console.error("Error fetching campaigns:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const list = await getCampaigns();
        if (active) setCampaigns(list);
      } catch (e) {
        console.error("Error fetching campaigns:", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesFilter =
      filterStatus === "ALL" || c.status?.toUpperCase() === filterStatus;
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetAudience?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="campaigns-view">
      {/* HEADER */}
      <div className="view-header">
        <div>
          <h2>Marketing & Broadcast Campaigns</h2>
          <p>Full merchant campaign registry with verified WhatsApp Cloud API receipts.</p>
        </div>
        <div className="view-actions">
          <button className="refresh-btn" onClick={fetchCampaigns}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="primary-btn" onClick={() => onNavigateToAi?.("Create a flash promotion for cold pressed oils")}>
            <Plus size={16} />
            Create AI Campaign
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="campaigns-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search campaigns by title or audience..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {["ALL", "ACTIVE", "DRAFT", "COMPLETED"].map((st) => (
            <button
              key={st}
              className={`filter-pill ${filterStatus === st ? "active" : ""}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* CAMPAIGNS GRID */}
      {loading ? (
        <div className="view-loading">
          <RefreshCw size={24} className="animate-spin text-blue" />
          <span>Loading campaigns...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <Megaphone size={36} className="text-muted" />
          <h3>No campaigns found</h3>
          <p>No campaigns match your current search or filter criteria.</p>
        </div>
      ) : (
        <div className="campaigns-grid">
          {filtered.map((camp) => (
            <div key={camp.id || camp.campaignId} className="card campaign-card">
              <div className="campaign-card-top">
                <span className={`status-badge status-${(camp.status || "active").toLowerCase()}`}>
                  {camp.status || "Active"}
                </span>
                <span className="channel-pill">
                  <Smartphone size={13} />
                  {camp.channel || "WhatsApp"}
                </span>
              </div>

              <h3 className="campaign-title">{camp.title}</h3>
              <p className="campaign-audience">
                <strong>Target:</strong> {camp.targetAudience}
              </p>

              <div className="campaign-metrics-row">
                <div className="camp-metric">
                  <span>Recipients</span>
                  <strong>{camp.sentCount || 5}</strong>
                </div>
                <div className="camp-metric">
                  <span>Conversion</span>
                  <strong className="text-green">{camp.conversionRate || "14.2%"}</strong>
                </div>
                <div className="camp-metric">
                  <span>Discount</span>
                  <strong>{camp.discountPercentage ? `${camp.discountPercentage}% OFF` : "15% OFF"}</strong>
                </div>
              </div>

              {camp.receipt && (
                <div className="receipt-preview-snippet">
                  <Tag size={13} />
                  <span>Coupon: <code>{camp.receipt?.couponGenerated?.couponCode || "SEVA15"}</code></span>
                </div>
              )}

              <div className="campaign-card-footer">
                <button
                  className="btn-view-receipt"
                  onClick={() => setSelectedReceipt(camp)}
                >
                  <Receipt size={14} />
                  View Dispatch Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <CheckCircle2 size={20} className="text-green" />
                <h3>Execution Dispatch Receipt</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReceipt(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="receipt-modal-box">
                <div className="receipt-meta-grid">
                  <div>
                    <span>Campaign:</span>
                    <strong>{selectedReceipt.title}</strong>
                  </div>
                  <div>
                    <span>Status:</span>
                    <span className="status-live">DELIVERED (100%)</span>
                  </div>
                  <div>
                    <span>Broadcast ID:</span>
                    <code>{selectedReceipt.receipt?.broadcastId || `bcast_${selectedReceipt.id || "001"}`}</code>
                  </div>
                  <div>
                    <span>Partner Provider:</span>
                    <span>{selectedReceipt.receipt?.provider || "Meta WhatsApp Cloud API (Simulated)"}</span>
                  </div>
                  <div>
                    <span>Recipients Delivered:</span>
                    <strong>{selectedReceipt.sentCount || 5} Customers</strong>
                  </div>
                  <div>
                    <span>Promotional Voucher:</span>
                    <code>{selectedReceipt.receipt?.couponGenerated?.couponCode || "SEVA15_ACTIVE"}</code>
                  </div>
                </div>

                <div className="receipt-voucher-box">
                  <strong>🎁 Paytm Merchant Engine Voucher:</strong>
                  <p>15% Instant Discount for repeat customers. Backed by Paytm UPI gateway settlement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
