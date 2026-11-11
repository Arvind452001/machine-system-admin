import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { quotesApi } from "../api/quotesApi";
import Pagination from "../components/Pagination";
import StatSpinner from "../components/StatSpinner";

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const loadQuotes = () => {
    setLoading(true);
    quotesApi
      .getQuotes()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setQuotes(list);
      })
      .catch((err) => {
        console.warn("Could not load quotes from API:", err.message);
        setQuotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    setFeedback({ error: "", success: "" });
    try {
      // GET /api/v1/quotes/export-csv
      await quotesApi.exportCsv();
      setFeedback({ success: "Quotes exported successfully to CSV!", error: "" });
    } catch (err) {
      setFeedback({ error: err.message || "Failed to export quotes.", success: "" });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteQuote = async (id, quoteNumber) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quoteNumber}?`)) {
      return;
    }
    try {
      // DELETE /api/v1/quotes/{id}
      await quotesApi.deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q._id !== id));
      setFeedback({ success: `Quotation ${quoteNumber} deleted successfully.`, error: "" });
    } catch (err) {
      setFeedback({ error: err.message || "Failed to delete quote.", success: "" });
    }
  };

  const handleDownloadPdf = async (id, quoteNumber) => {
    try {
      // GET /api/v1/quotes/{id}/pdf
      await quotesApi.downloadPdf(id, quoteNumber);
    } catch (err) {
      setFeedback({ error: err.message || "Could not generate PDF.", success: "" });
    }
  };

  const breadcrumb = (
    <>
      <span>Sales</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Quotes</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredQuotes = quotes.filter((q) => {
    const qNum = q.quoteNumber || "";
    const cust = q.customerName || q.customer?.name || "";
    const comp = q.customerCompany || q.customer?.company || "";
    const mach = q.machineName || q.machine?.name || "";
    const status = (q.status || "").toLowerCase();

    const matchesSearch =
      qNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mach.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" ||
      status === statusFilter.toLowerCase().replace(" ", "_") ||
      (statusFilter === "In preparation" && (status.includes("prep") || status.includes("draft"))) ||
      (statusFilter === "Sent" && status.includes("sent")) ||
      (statusFilter === "Accepted" && status.includes("accept"));

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("accept")) return <span className="table-status">Accepted</span>;
    if (s.includes("sent")) return <span className="table-status status-review">Sent</span>;
    if (s.includes("prep") || s.includes("draft"))
      return <span className="table-status status-draft">In preparation</span>;
    if (s.includes("decline") || s.includes("reject"))
      return <span className="table-status status-closed">Declined</span>;
    return <span className="table-status">{status || "Active"}</span>;
  };

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>QUOTATION WORKSPACE
            </div>
            <h1>Quotes</h1>
            <p className="welcome-subtitle">
              Issue commercial quotations, export pipeline records, review client approvals, and manage PDFs.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-outline"
              type="button"
              onClick={handleExportCsv}
              disabled={exporting}
            >
              <i className="bi bi-file-earmark-spreadsheet"></i>{" "}
              {exporting ? "Exporting CSV..." : "Export CSV (GET /export-csv)"}
            </button>
            <Link className="btn btn-accent" to="/quote-details">
              <i className="bi bi-plus-lg"></i> Issue quotation
            </Link>
          </div>
        </section>

        {feedback.error && (
          <div className="alert alert-danger mb-3" style={{ background: "#fde8e8", color: "#9b1c1c", padding: "12px 16px", borderRadius: "6px" }}>
            <i className="bi bi-exclamation-triangle me-2"></i> {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="alert alert-success mb-3" style={{ background: "#def7ec", color: "#03543f", padding: "12px 16px", borderRadius: "6px" }}>
            <i className="bi bi-check-circle me-2"></i> {feedback.success}
          </div>
        )}

        <section className="summary-strip">
          <div className="summary-item">
            <span>Total quotations</span>
            <strong>{loading ? <StatSpinner /> : quotes.length}</strong>
            <small>{loading ? "Loading..." : "Active in database"}</small>
          </div>
          <div className="summary-item">
            <span>Accepted / Won</span>
            <strong>
              {loading ? (
                <StatSpinner />
              ) : (
                quotes.filter((q) => (q.status || "").toLowerCase().includes("accept")).length
              )}
            </strong>
            <small>{loading ? "Loading..." : "Signed proposals"}</small>
          </div>
          <div className="summary-item">
            <span>In negotiation</span>
            <strong>
              {loading ? (
                <StatSpinner />
              ) : (
                quotes.filter(
                  (q) =>
                    (q.status || "").toLowerCase().includes("sent") ||
                    (q.status || "").toLowerCase().includes("prep")
                ).length
              )}
            </strong>
            <small>{loading ? "Loading..." : "Awaiting customer approval"}</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search quotes"
                placeholder="Search by quote #, customer, company, or machine"
                type="search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter by status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option>All statuses</option>
              <option>In preparation</option>
              <option>Sent</option>
              <option>Accepted</option>
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>QUOTE #</th>
                  <th>MACHINE PLATFORM</th>
                  <th>CUSTOMER &amp; COMPANY</th>
                  <th>COMMERCIAL TOTAL</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-muted, #85867f)" }}>
                      <i className="bi bi-arrow-repeat me-2" style={{ display: "inline-block", animation: "spin 1s linear infinite" }}></i>
                      Loading quotations...
                    </td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px" }}>
                      <div style={{ maxWidth: "360px", margin: "0 auto", textAlign: "center" }}>
                        <i className="bi bi-file-earmark-text" style={{ fontSize: "32px", color: "#c5c6bf", display: "block", marginBottom: "12px" }}></i>
                        <strong style={{ display: "block", marginBottom: "6px", fontSize: "15px" }}>
                          Data is not found
                        </strong>
                        <p style={{ color: "#85867f", fontSize: "12px", marginBottom: "0" }}>
                          {searchTerm || statusFilter !== "All statuses"
                            ? "No commercial quotations match the selected filters."
                            : "No commercial quotations currently recorded in the system."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((q) => {
                    const qNum = q.quoteNumber || "Quote";
                    const mach = q.machineName || q.machine?.name || "Machinery System";
                    const cust = q.customerName || q.customer?.name || "Valued Customer";
                    const comp = q.customerCompany || q.customer?.company || "Direct account";
                    const total =
                      q.pricingBreakdown?.finalTotal ||
                      q.pricingBreakdown?.total ||
                      q.totalAmount ||
                      q.value ||
                      0;

                    return (
                      <tr key={q._id || qNum}>
                        <td>
                          <strong>{qNum}</strong>
                          <span className="cell-sub">
                            {q.validUntil ? `Valid to ${new Date(q.validUntil).toLocaleDateString()}` : "Active"}
                          </span>
                        </td>
                        <td>
                          <strong>{mach}</strong>
                          <span className="cell-sub">Rep: {q.representativeName || "Regional Sales"}</span>
                        </td>
                        <td>
                          <strong>{cust}</strong>
                          <span className="cell-sub">{comp}</span>
                        </td>
                        <td>
                          <strong>{formatPrice(total)}</strong>
                        </td>
                        <td>{getStatusBadge(q.status)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Link
                              aria-label={`View details of ${qNum}`}
                              className="table-action"
                              to={`/quote-details#${q._id || qNum}`}
                              title="View quote details"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                            <button
                              type="button"
                              className="table-action btn-link border-0 p-0"
                              onClick={() => handleDownloadPdf(q._id, qNum)}
                              title="Download PDF"
                            >
                              <i className="bi bi-file-earmark-pdf"></i>
                            </button>
                            <button
                              type="button"
                              className="table-action btn-link border-0 p-0 text-danger"
                              onClick={() => handleDeleteQuote(q._id, qNum)}
                              title="Delete quotation"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalItems={filteredQuotes.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} itemName="quotes" />
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Quotes;
