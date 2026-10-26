import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { quotesApi } from "../api/quotesApi";
import { machinesApi } from "../api/machinesApi";

const FALLBACK_QUOTE = {
  _id: "6ada08890b6fa3f6be851fd6",
  quoteNumber: "QUO-2026-1541",
  customerName: "David Vance",
  customerCompany: "Apex Precision Engineering Ltd",
  customerEmail: "customer@machinesystems.com",
  customerCountry: "United States",
  representativeName: "Alexander Sterling",
  machineName: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
  machineCode: "MS-LC-4000-FIBER",
  configurationSubtitle: "2 configured options",
  pricingBreakdown: {
    basePrice: 228000,
    optionsTotal: 36500,
    discountAmount: 2500,
    finalTotal: 262000,
  },
  validUntil: "2026-11-21T12:58:49.836Z",
  termsAndConditions: "30% advance with order, 70% delivery. 24 mo enterprise warranty.",
  status: "accepted",
  options: [
    { name: "High-Pressure Coolant (70 Bar)", code: "OPT-COOL-70B", priceDelta: 8500 },
    { name: "Automatic Robotic Arm Workpiece Loading", code: "OPT-AUTO-ROBOT", priceDelta: 28000 },
  ],
};

const QuoteDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawId = location.hash.replace("#", "").trim();

  const [quote, setQuote] = useState(FALLBACK_QUOTE);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  // Editable fields
  const [terms, setTerms] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("accepted");
  const [finalPrice, setFinalPrice] = useState("");

  // Create new quote modal state
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState({
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerCountry: "United States",
    machineName: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
    machineCode: "MS-LC-4000-FIBER",
    basePrice: 228000,
    validDays: 30,
    terms: "Payment terms: 30% advance with order, 60% before dispatch, 10% commissioning. Warranty: 24 months.",
  });

  const loadQuote = (targetId) => {
    setLoading(true);
    quotesApi
      .getQuoteById(targetId)
      .then((res) => {
        const q = res?.data || res;
        if (q) {
          setQuote(q);
          setTerms(q.termsAndConditions || "");
          setSelectedStatus(q.status || "accepted");
          setValidUntil(
            q.validUntil ? new Date(q.validUntil).toISOString().slice(0, 10) : ""
          );
          setFinalPrice(
            q.pricingBreakdown?.finalTotal || q.pricingBreakdown?.total || q.totalAmount || ""
          );
        }
      })
      .catch((err) => {
        console.warn("Using offline quote fallback:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const targetId = rawId || "6ada08890b6fa3f6be851fd6";
    loadQuote(targetId);
  }, [rawId]);

  const handleUpdateQuote = async () => {
    setSaving(true);
    setFeedback({ error: "", success: "" });

    try {
      // 1. PUT /api/v1/quotes/{id}
      const payload = {
        termsAndConditions: terms,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        pricingBreakdown: {
          ...(quote.pricingBreakdown || {}),
          finalTotal: Number(finalPrice) || quote.pricingBreakdown?.finalTotal || 262000,
        },
      };

      await quotesApi.updateQuote(quote._id, payload);

      // 2. PATCH /api/v1/quotes/{id}/status if changed
      if (selectedStatus !== quote.status) {
        await quotesApi.updateStatus(quote._id, {
          status: selectedStatus,
        });
      }

      setFeedback({ success: "Quotation updated successfully!", error: "" });
      setEditMode(false);
      loadQuote(quote._id);
    } catch (err) {
      setFeedback({ error: err.message || "Failed to update quotation.", success: "" });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      // GET /api/v1/quotes/{id}/pdf
      await quotesApi.downloadPdf(quote._id, quote.quoteNumber);
    } catch (err) {
      setFeedback({ error: err.message || "Could not generate PDF.", success: "" });
    }
  };

  const handleDeleteQuote = async () => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quote.quoteNumber}?`)) {
      return;
    }
    try {
      // DELETE /api/v1/quotes/{id}
      await quotesApi.deleteQuote(quote._id);
      navigate("/quotes");
    } catch (err) {
      setFeedback({ error: err.message || "Failed to delete quote.", success: "" });
    }
  };

  const handleCreateQuoteSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ error: "", success: "" });

    try {
      // POST /api/v1/quotes
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + Number(newQuoteData.validDays || 30));

      const payload = {
        customerName: newQuoteData.customerName,
        customerCompany: newQuoteData.customerCompany,
        customerEmail: newQuoteData.customerEmail,
        customerCountry: newQuoteData.customerCountry,
        machineName: newQuoteData.machineName,
        machineCode: newQuoteData.machineCode,
        pricingBreakdown: {
          basePrice: Number(newQuoteData.basePrice) || 228000,
          optionsTotal: 0,
          discountAmount: 0,
          finalTotal: Number(newQuoteData.basePrice) || 228000,
        },
        validUntil: validityDate.toISOString(),
        termsAndConditions: newQuoteData.terms,
        status: "in_preparation",
      };

      const res = await quotesApi.createQuote(payload);
      const created = res?.data || res;
      setIsNewQuoteModalOpen(false);
      setFeedback({ success: `Quotation ${created.quoteNumber || ""} created successfully!`, error: "" });
      if (created._id) {
        navigate(`/quote-details#${created._id}`);
        loadQuote(created._id);
      }
    } catch (err) {
      setFeedback({ error: err.message || "Failed to create quote.", success: "" });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = (
    <>
      <Link to="/quotes">Quotes</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>{quote.quoteNumber || "Quote details"}</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalAmount =
    quote.pricingBreakdown?.finalTotal ||
    quote.pricingBreakdown?.total ||
    quote.totalAmount ||
    262000;

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>COMMERCIAL QUOTATION
            </div>
            <h1>{quote.quoteNumber || "Commercial Quote"}</h1>
            <p className="welcome-subtitle">
              Formal machinery proposal for {quote.customerName || "Customer"} ({quote.customerCompany || "Company"}).
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => setIsNewQuoteModalOpen(true)}
            >
              <i className="bi bi-plus-lg"></i> New quotation (POST /quotes)
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={handleDownloadPdf}
            >
              <i className="bi bi-file-earmark-pdf"></i> Download PDF (GET /pdf)
            </button>
            <button
              className={`btn ${editMode ? "btn-outline" : "btn-accent"}`}
              type="button"
              onClick={() => setEditMode(!editMode)}
            >
              <i className="bi bi-pencil"></i> {editMode ? "Cancel edit" : "Edit quote (PUT /quotes/:id)"}
            </button>
            <button
              className="btn btn-outline text-danger"
              type="button"
              onClick={handleDeleteQuote}
              title="Delete this quote"
            >
              <i className="bi bi-trash"></i>
            </button>
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

        {/* Edit Form Card */}
        {editMode && (
          <div className="panel p-4 mb-4" style={{ background: "rgba(39, 98, 76, 0.05)", border: "1px solid var(--accent, #27624c)", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>
              <i className="bi bi-sliders me-2"></i> Update Quote Details
            </h3>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Workflow Status (PATCH /status)
                </label>
                <select
                  className="form-control"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="in_preparation">In preparation</option>
                  <option value="sent">Sent to customer</option>
                  <option value="accepted">Accepted / Approved</option>
                  <option value="declined">Declined</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Validity Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Commercial Total (USD)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Terms &amp; Conditions
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={handleUpdateQuote}
                  disabled={saving}
                >
                  {saving ? "Saving changes..." : "Save Quote Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quote Sheet Preview */}
        <section className="record-grid">
          <article className="record-card quote-sheet p-4" style={{ background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border, #eee)" }}>
            <header className="quote-sheet-header d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="brand-type" style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "1px" }}>
                  MACHINE<small style={{ color: "var(--accent)" }}>SYSTEMS</small>
                </span>
                <span style={{ display: "block", fontSize: "12px", color: "gray" }}>INDUSTRIAL MANUFACTURING WORKSPACE</span>
              </div>
              <div className="text-end">
                <span style={{ fontSize: "11px", color: "gray", display: "block" }}>COMMERCIAL PROPOSAL</span>
                <strong style={{ fontSize: "18px" }}>{quote.quoteNumber}</strong>
                <small style={{ display: "block", color: "gray" }}>
                  {quote.validUntil ? `Valid until ${new Date(quote.validUntil).toLocaleDateString()}` : "Standard 30 Days"}
                </small>
              </div>
            </header>
            <hr />

            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <span style={{ fontSize: "11px", fontWeight: "700", color: "gray" }}>PREPARED FOR</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600" }}>{quote.customerName || "Customer Name"}</p>
                <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>{quote.customerCompany || "Company"}</p>
                <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>{quote.customerCountry || "Global"}</p>
                <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>{quote.customerEmail || ""}</p>
              </div>
              <div className="col-md-4">
                <span style={{ fontSize: "11px", fontWeight: "700", color: "gray" }}>ISSUED BY</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600" }}>{quote.representativeName || "Regional Sales Representative"}</p>
                <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>MACHINE Systems Direct Sales Team</p>
                <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>Global Industrial Division</p>
              </div>
              <div className="col-md-4 text-md-end">
                <span style={{ fontSize: "11px", fontWeight: "700", color: "gray" }}>STATUS</span>
                <div style={{ marginTop: "4px" }}>
                  <span className="badge bg-success" style={{ fontSize: "13px", padding: "6px 12px", textTransform: "capitalize" }}>
                    {quote.status?.replace("_", " ") || "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="panel p-3 mb-4" style={{ background: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span style={{ fontSize: "11px", color: "gray", fontWeight: "600" }}>PROPOSED MACHINERY CELL</span>
                  <h3 style={{ fontSize: "18px", margin: "4px 0 2px" }}>
                    {quote.machineName || quote.machine?.name || "MS Industrial Platform"}
                  </h3>
                  <small style={{ color: "gray" }}>
                    SKU: {quote.machineCode || quote.machine?.sku || "MS-SYS"} · {quote.configurationSubtitle || "Custom production setup"}
                  </small>
                </div>
                <strong style={{ fontSize: "20px" }}>
                  {formatPrice(quote.pricingBreakdown?.basePrice || 228000)}
                </strong>
              </div>
            </div>

            {/* Configured Line Items */}
            {Array.isArray(quote.options) && quote.options.length > 0 && (
              <div className="mb-4">
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>
                  Selected Automation &amp; Production Options
                </h4>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>UPGRADE MODULE</th>
                      <th>CODE</th>
                      <th className="text-end">PRICE (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.options.map((opt, i) => (
                      <tr key={opt._id || i}>
                        <td>{opt.name}</td>
                        <td><code>{opt.code}</code></td>
                        <td className="text-end">+{formatPrice(opt.priceDelta)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Summary */}
            <div className="d-flex justify-content-end mb-4">
              <div style={{ minWidth: "280px" }}>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: "13px" }}>
                  <span>Base Machine:</span>
                  <span>{formatPrice(quote.pricingBreakdown?.basePrice || 228000)}</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: "13px" }}>
                  <span>Options &amp; Tooling:</span>
                  <span>+{formatPrice(quote.pricingBreakdown?.optionsTotal || 36500)}</span>
                </div>
                <hr style={{ margin: "8px 0" }} />
                <div className="d-flex justify-content-between py-1" style={{ fontSize: "16px", fontWeight: "700" }}>
                  <span>Commercial Total:</span>
                  <span style={{ color: "var(--accent, #27624c)" }}>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div style={{ background: "rgba(0,0,0,0.02)", padding: "12px 16px", borderRadius: "6px", fontSize: "12px", color: "gray" }}>
              <strong>Commercial Terms &amp; Conditions:</strong>
              <p style={{ margin: "4px 0 0" }}>
                {quote.termsAndConditions || "Standard delivery and payment terms apply."}
              </p>
            </div>
          </article>
        </section>

        {/* New Quote Modal */}
        {isNewQuoteModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "#fff",
                maxWidth: "560px",
                width: "100%",
                borderRadius: "8px",
                padding: "24px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
                  Create &amp; Issue Commercial Quote
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-subtle"
                  onClick={() => setIsNewQuoteModalOpen(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleCreateQuoteSubmit}>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                    Customer Name *
                  </label>
                  <input
                    required
                    className="form-control"
                    placeholder="e.g. David Vance"
                    value={newQuoteData.customerName}
                    onChange={(e) =>
                      setNewQuoteData({ ...newQuoteData, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                    Company Name *
                  </label>
                  <input
                    required
                    className="form-control"
                    placeholder="e.g. Apex Precision Engineering Ltd"
                    value={newQuoteData.customerCompany}
                    onChange={(e) =>
                      setNewQuoteData({ ...newQuoteData, customerCompany: e.target.value })
                    }
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                      Customer Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. customer@machinesystems.com"
                      value={newQuoteData.customerEmail}
                      onChange={(e) =>
                        setNewQuoteData({ ...newQuoteData, customerEmail: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                      Country / Region
                    </label>
                    <input
                      className="form-control"
                      placeholder="e.g. United States"
                      value={newQuoteData.customerCountry}
                      onChange={(e) =>
                        setNewQuoteData({ ...newQuoteData, customerCountry: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                    Machine Model
                  </label>
                  <input
                    className="form-control"
                    value={newQuoteData.machineName}
                    onChange={(e) =>
                      setNewQuoteData({ ...newQuoteData, machineName: e.target.value })
                    }
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                      Commercial Value (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newQuoteData.basePrice}
                      onChange={(e) =>
                        setNewQuoteData({ ...newQuoteData, basePrice: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={newQuoteData.validDays}
                      onChange={(e) =>
                        setNewQuoteData({ ...newQuoteData, validDays: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsNewQuoteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent" disabled={saving}>
                    {saving ? "Issuing quote..." : "Issue & Save Quotation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default QuoteDetails;
