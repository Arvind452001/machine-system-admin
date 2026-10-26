import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { enquiriesApi } from "../api/enquiriesApi";
import { usersApi } from "../api/usersApi";

const FALLBACK_DETAIL = {
  _id: "6adb30b0c536b1269e97cdd7",
  referenceNumber: "ENQ-2026-5250",
  fullName: "david miller",
  email: "david@yopmail.com",
  phone: "1234567890",
  company: "Risen technologies",
  country: "Canada",
  installationTimeline: "Standard (8-12 weeks)",
  machineName: "MS-M500 5-Axis Machining Center",
  machineCode: "MS-MC-500-5X",
  calculatedTotal: 185000,
  targetBudget: 185000,
  status: "assigned",
  assignedRep: {
    _id: "6ad9fc22e39daefd54e568e1",
    name: "Alexander Sterling",
    email: "rep@machinesystems.com",
    territory: "Europe & UK",
  },
  selectedOptions: [],
  timeline: [
    { status: "new", note: "Enquiry submitted by customer", timestamp: "2026-10-23T10:02:24.042Z" },
    { status: "assigned", note: "Assigned to Alexander Sterling", timestamp: "2026-10-23T10:02:24.042Z" },
  ],
  createdAt: "2026-10-23T10:02:24.042Z",
};

const EnquiryDetails = () => {
  const location = useLocation();
  const rawId = location.hash.replace("#", "").trim();

  const [enquiry, setEnquiry] = useState(FALLBACK_DETAIL);
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRepId, setSelectedRepId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("assigned");
  const [statusNote, setStatusNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState({ error: "", success: "" });

  useEffect(() => {
    let mounted = true;

    // Load representatives for assignment dropdown via GET /api/v1/users/representatives
    usersApi
      .getRepresentatives()
      .then((res) => {
        if (!mounted) return;
        const repList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setRepresentatives(repList);
      })
      .catch((err) => {
        console.warn("Could not load representatives for assignment:", err.message);
      });

    // If ID is available, fetch via GET /api/v1/enquiries/{id}
    const targetId = rawId || "6adb30b0c536b1269e97cdd7";
    enquiriesApi
      .getEnquiryById(targetId)
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || res;
        if (data) {
          setEnquiry(data);
          setSelectedStatus(data.status || "new");
          if (data.assignedRep?._id || data.assignedRep) {
            setSelectedRepId(data.assignedRep._id || data.assignedRep);
          }
        }
      })
      .catch((err) => {
        console.warn("Using offline enquiry fallback in EnquiryDetails:", err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [rawId]);

  const handleAssignRep = async () => {
    if (!selectedRepId) return;
    setSavingAction(true);
    setActionMessage({ error: "", success: "" });

    try {
      // PATCH /api/v1/enquiries/{id}/assign
      const res = await enquiriesApi.assignEnquiry(enquiry._id, {
        representativeId: selectedRepId,
      });
      const updated = res?.data || res;
      setEnquiry((prev) => ({
        ...prev,
        status: updated.status || "assigned",
        assignedRep:
          representatives.find((r) => r._id === selectedRepId) ||
          updated.assignedRep ||
          prev.assignedRep,
      }));
      setActionMessage({ success: "Representative successfully assigned!", error: "" });
    } catch (err) {
      setActionMessage({
        error: err.message || "Failed to assign representative.",
        success: "",
      });
    } finally {
      setSavingAction(false);
    }
  };

  const handleUpdateStatus = async () => {
    setSavingAction(true);
    setActionMessage({ error: "", success: "" });

    try {
      // PATCH /api/v1/enquiries/{id}/status
      const res = await enquiriesApi.updateStatus(enquiry._id, {
        status: selectedStatus,
        note: statusNote || undefined,
      });
      const updated = res?.data || res;
      setEnquiry((prev) => ({
        ...prev,
        status: updated.status || selectedStatus,
        timeline: updated.timeline || prev.timeline,
      }));
      setActionMessage({ success: "Workflow status updated successfully!", error: "" });
      setStatusNote("");
    } catch (err) {
      setActionMessage({
        error: err.message || "Failed to update status.",
        success: "",
      });
    } finally {
      setSavingAction(false);
    }
  };

  const breadcrumb = (
    <>
      <Link to="/enquiries">Enquiries</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>{enquiry.referenceNumber || "Enquiry details"}</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const customerName =
    enquiry.fullName ||
    enquiry.customer?.name ||
    `${enquiry.firstName || ""} ${enquiry.lastName || ""}`.trim() ||
    "Customer";
  const customerEmail = enquiry.email || enquiry.customer?.email || "Email not specified";
  const customerCompany = enquiry.company || enquiry.customer?.company || "Direct account";
  const customerCountry = enquiry.country || enquiry.customer?.country || "Global";
  const machineName = enquiry.machineName || enquiry.machine?.name || "Machine Platform";
  const machineCode = enquiry.machineCode || enquiry.machine?.sku || "Custom Machine";
  const totalAmount = enquiry.calculatedTotal || enquiry.targetBudget || 0;
  const optionsList = Array.isArray(enquiry.selectedOptions) ? enquiry.selectedOptions : [];

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>SALES INBOX · {enquiry.referenceNumber || "ENQUIRY RECORD"}
            </div>
            <h1>{customerName}</h1>
            <p className="welcome-subtitle">
              {customerCompany} · {customerCountry} · Submitted on{" "}
              {new Date(enquiry.createdAt || Date.now()).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-outline" to="/enquiries">
              <i className="bi bi-arrow-left"></i> All enquiries
            </Link>
          </div>
        </section>

        {actionMessage.error && (
          <div className="alert alert-danger mb-3" style={{ background: "#fde8e8", color: "#9b1c1c", padding: "12px 16px", borderRadius: "6px" }}>
            <i className="bi bi-exclamation-triangle me-2"></i> {actionMessage.error}
          </div>
        )}
        {actionMessage.success && (
          <div className="alert alert-success mb-3" style={{ background: "#def7ec", color: "#03543f", padding: "12px 16px", borderRadius: "6px" }}>
            <i className="bi bi-check-circle me-2"></i> {actionMessage.success}
          </div>
        )}

        <div className="row g-3">
          {/* Main Enquiry Info */}
          <div className="col-lg-8">
            <article className="record-card enquiry-detail p-4" style={{ background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border, #eee)" }}>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <span className="form-kicker">PROPOSED CONFIGURATION</span>
                  <h2 style={{ fontSize: "20px", fontWeight: "700" }}>{machineName}</h2>
                  <p style={{ color: "gray", margin: 0 }}>Model: {machineCode}</p>
                </div>
                <div className="text-end">
                  <span style={{ fontSize: "11px", color: "gray", display: "block" }}>ESTIMATED TOTAL</span>
                  <strong style={{ fontSize: "24px", color: "var(--accent, #27624c)" }}>
                    {formatPrice(totalAmount)}
                  </strong>
                </div>
              </div>

              <dl className="record-fields mb-4">
                <div>
                  <dt>Customer name</dt>
                  <dd>{customerName}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{customerCompany}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{customerEmail}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{enquiry.phone || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Territory / Region</dt>
                  <dd>{customerCountry}</dd>
                </div>
                <div>
                  <dt>Installation timeline</dt>
                  <dd>{enquiry.installationTimeline || enquiry.deliveryTimeline || "Standard"}</dd>
                </div>
              </dl>

              {/* Selected Options */}
              <div className="mb-4">
                <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>
                  Selected Options &amp; Add-ons ({optionsList.length})
                </h3>
                {optionsList.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>OPTION</th>
                          <th>CODE</th>
                          <th>PRICE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optionsList.map((opt, i) => (
                          <tr key={opt._id || i}>
                            <td>{opt.name}</td>
                            <td><code>{opt.code}</code></td>
                            <td>+{formatPrice(opt.priceDelta)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: "gray", fontSize: "13px" }}>
                    Standard base machine configuration without optional upgrades.
                  </p>
                )}
              </div>

              {/* Workflow Timeline */}
              {Array.isArray(enquiry.timeline) && enquiry.timeline.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>
                    Workflow Audit Timeline
                  </h3>
                  <div style={{ borderLeft: "2px solid var(--accent, #27624c)", paddingLeft: "16px" }}>
                    {enquiry.timeline.map((item, idx) => (
                      <div key={idx} className="mb-3">
                        <strong style={{ textTransform: "capitalize", fontSize: "13px" }}>
                          {item.status?.replace("_", " ")}
                        </strong>{" "}
                        - <span style={{ fontSize: "13px" }}>{item.note || "Status updated"}</span>
                        <div style={{ fontSize: "11px", color: "gray" }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Right Action Sidebar: Assignment & Status */}
          <div className="col-lg-4">
            {/* Representative Assignment */}
            <div className="panel p-3 mb-3" style={{ background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border, #eee)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>
                <i className="bi bi-person-badge me-2"></i> Representative Assignment
              </h3>
              <p style={{ fontSize: "12px", color: "gray", marginBottom: "12px" }}>
                Assign this enquiry to a regional representative.
              </p>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Assigned Representative
                </label>
                <select
                  className="form-control"
                  value={selectedRepId}
                  onChange={(e) => setSelectedRepId(e.target.value)}
                >
                  <option value="">Select representative...</option>
                  {representatives.map((rep) => (
                    <option key={rep._id} value={rep._id}>
                      {rep.name} ({rep.territory || rep.region || "Global"})
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-accent w-100 btn-sm"
                onClick={handleAssignRep}
                disabled={savingAction || !selectedRepId}
              >
                {savingAction ? "Assigning..." : "Assign Representative"}
              </button>
            </div>

            {/* Workflow Status Update */}
            <div className="panel p-3 mb-3" style={{ background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border, #eee)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>
                <i className="bi bi-arrow-repeat me-2"></i> Workflow Status
              </h3>
              <p style={{ fontSize: "12px", color: "gray", marginBottom: "12px" }}>
                Update status and log internal progress.
              </p>

              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Status
                </label>
                <select
                  className="form-control"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="new">New Enquiry</option>
                  <option value="assigned">Assigned</option>
                  <option value="requirements_review">Requirements Review</option>
                  <option value="quote_in_progress">Quote In Progress</option>
                  <option value="quote_ready">Quote Ready</option>
                  <option value="closed">Closed / Won</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Internal Progress Note (Optional)
                </label>
                <input
                  className="form-control"
                  placeholder="e.g. Discussed power requirements with plant manager"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>

              <button
                className="btn btn-outline w-100 btn-sm"
                onClick={handleUpdateStatus}
                disabled={savingAction}
              >
                {savingAction ? "Updating..." : "Update Workflow Status"}
              </button>
            </div>

            {/* Direct Commercial Quote Action */}
            <div className="panel p-3" style={{ background: "rgba(39, 98, 76, 0.05)", borderRadius: "8px", border: "1px solid var(--accent, #27624c)" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Issue Quotation
              </h4>
              <p style={{ fontSize: "12px", color: "gray", marginBottom: "12px" }}>
                Generate a formal commercial proposal for this customer and configuration.
              </p>
              <Link className="btn btn-accent w-100 btn-sm" to="/quotes">
                <i className="bi bi-file-earmark-plus me-1"></i> Open Quotation Workspace
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default EnquiryDetails;
