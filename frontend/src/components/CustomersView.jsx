import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { getCustomers } from "../services/api";

export default function CustomersView({ onTargetSegment, initialSegment = "ALL" }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [segmentFilter, setSegmentFilter] = useState(initialSegment || "ALL");
  const [search, setSearch] = useState("");
  const [prevInitialSegment, setPrevInitialSegment] = useState(initialSegment);

  if (initialSegment !== prevInitialSegment) {
    setPrevInitialSegment(initialSegment);
    setSegmentFilter(initialSegment || "ALL");
  }

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error("Error loading customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const data = await getCustomers();
        if (active) setCustomers(data);
      } catch (e) {
        console.error("Error loading customers:", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSegment =
      segmentFilter === "ALL" ||
      c.segment?.toUpperCase() === segmentFilter;
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    return matchesSegment && matchesSearch;
  });

  return (
    <div className="customers-view">
      {/* HEADER */}
      <div className="view-header">
        <div>
          <h2>Customer Directory & Segments</h2>
          <p>Live store customer database with WhatsApp opt-ins and spending profiles.</p>
        </div>
        <div className="view-actions">
          <button className="refresh-btn" onClick={fetchCustomers}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            className="primary-btn"
            onClick={() => onTargetSegment?.("Re-engage At-Risk customers who haven't visited in 30 days")}
          >
            <Sparkles size={16} />
            Target At-Risk Customers
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="campaigns-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {["ALL", "VIP", "REGULAR", "AT-RISK", "NEW"].map((seg) => (
            <button
              key={seg}
              className={`filter-pill ${segmentFilter === seg ? "active" : ""}`}
              onClick={() => setSegmentFilter(seg)}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMERS LIST / TABLE */}
      {loading ? (
        <div className="view-loading">
          <RefreshCw size={24} className="animate-spin text-blue" />
          <span>Loading customer directory...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <Users size={36} className="text-muted" />
          <h3>No customers found</h3>
          <p>Try clearing your search or selecting a different segment.</p>
        </div>
      ) : (
        <div className="customers-table-card card">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Segment</th>
                <th>Phone</th>
                <th>Total Spend</th>
                <th>Visits</th>
                <th>Last Visit</th>
                <th>WhatsApp Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.customerId || c.id}>
                  <td>
                    <div className="customer-cell-profile">
                      <div className="customer-avatar">
                        {c.name ? c.name.charAt(0) : "C"}
                      </div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`segment-tag segment-${(c.segment || "regular").toLowerCase()}`}>
                      {c.segment}
                    </span>
                  </td>
                  <td>
                    <span className="phone-text">{c.phone}</span>
                  </td>
                  <td>
                    <strong>₹{Number(c.totalSpend || 0).toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    <span>{c.visitCount || 0} visits</span>
                  </td>
                  <td>
                    <span className="text-muted">{c.lastVisit || "Recent"}</span>
                  </td>
                  <td>
                    <span className="badge-optin">
                      <CheckCircle2 size={13} className="text-green" />
                      Opted-in
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-quick-engage"
                      onClick={() => onTargetSegment?.(`Send a VIP loyalty reward to ${c.name}`)}
                    >
                      Engage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
