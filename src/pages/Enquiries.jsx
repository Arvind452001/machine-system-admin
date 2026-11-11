import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { enquiriesApi } from "../api/enquiriesApi";
import Pagination from "../components/Pagination";
import StatSpinner from "../components/StatSpinner";

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    let mounted = true;
    enquiriesApi
      .getEnquiries()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setEnquiries(list);
      })
      .catch((err) => {
        console.warn("Could not load enquiries from API:", err.message);
        setEnquiries([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const breadcrumb = (
    <>
      <span>Sales</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Enquiries</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const cust =
      enq.fullName ||
      enq.customer?.name ||
      `${enq.firstName || ""} ${enq.lastName || ""}`.trim() ||
      "";
    const comp = enq.company || enq.customer?.company || "";
    const mach = enq.machineName || enq.machine?.name || "";
    const ref = enq.referenceNumber || enq.enquiryNumber || "";
    const status = (enq.status || "").toLowerCase();

    const matchesSearch =
      cust.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mach.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" ||
      status === statusFilter.toLowerCase() ||
      (statusFilter === "New" && status.includes("new")) ||
      (statusFilter === "In review" && status.includes("review")) ||
      (statusFilter === "Assigned" && status.includes("assign")) ||
      (statusFilter === "Quote ready" && status.includes("quote"));

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("new")) return <span className="table-status status-new">New</span>;
    if (s.includes("review")) return <span className="table-status status-review">In review</span>;
    if (s.includes("assign")) return <span className="table-status">Assigned</span>;
    if (s.includes("quote")) return <span className="table-status status-quote">Quote ready</span>;
    return <span className="table-status">{status || "Open"}</span>;
  };

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>SALES INBOX
            </div>
            <h1>Enquiries</h1>
            <p className="welcome-subtitle">
              Review customer machine configurations, assign regional representatives, and track sales workflow.
            </p>
          </div>
        </section>

        <section className="summary-strip">
          <div className="summary-item">
            <span>Total enquiries</span>
            <strong>{loading ? <StatSpinner /> : enquiries.length}</strong>
            <small>{loading ? "Loading..." : "Captured in database"}</small>
          </div>
          <div className="summary-item">
            <span>Awaiting assignment</span>
            <strong>
              {loading ? (
                <StatSpinner />
              ) : (
                enquiries.filter((e) => !e.assignedRep && (e.status || "").includes("new")).length
              )}
            </strong>
            <small>{loading ? "Loading..." : "Unassigned new requests"}</small>
          </div>
          <div className="summary-item">
            <span>In discussion / Quotes</span>
            <strong>
              {loading ? (
                <StatSpinner />
              ) : (
                enquiries.filter(
                  (e) => (e.status || "").includes("quote") || (e.status || "").includes("review")
                ).length
              )}
            </strong>
            <small>{loading ? "Loading..." : "Active in pipeline"}</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search enquiries"
                placeholder="Search by customer, company, machine, or reference"
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
              <option>New</option>
              <option>In review</option>
              <option>Assigned</option>
              <option>Quote ready</option>
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER &amp; REF</th>
                  <th>CONFIGURED MACHINE</th>
                  <th>INDICATIVE VALUE</th>
                  <th>REPRESENTATIVE</th>
                  <th>STATUS</th>
                  <th>
                    <span className="visually-hidden">View</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-muted, #85867f)" }}>
                      <i className="bi bi-arrow-repeat me-2" style={{ display: "inline-block", animation: "spin 1s linear infinite" }}></i>
                      Loading customer enquiries...
                    </td>
                  </tr>
                ) : filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px" }}>
                      <div style={{ maxWidth: "360px", margin: "0 auto", textAlign: "center" }}>
                        <i className="bi bi-inbox" style={{ fontSize: "32px", color: "#c5c6bf", display: "block", marginBottom: "12px" }}></i>
                        <strong style={{ display: "block", marginBottom: "6px", fontSize: "15px" }}>
                          Data is not found
                        </strong>
                        <p style={{ color: "#85867f", fontSize: "12px", marginBottom: "0" }}>
                          {searchTerm || statusFilter !== "All statuses"
                            ? "No customer enquiries match the selected filter criteria."
                            : "No customer enquiries currently recorded in the system."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((enq) => {
                    const custName =
                      enq.fullName ||
                      enq.customer?.name ||
                      `${enq.firstName || ""} ${enq.lastName || ""}`.trim() ||
                      "Customer";
                    const custCompany = enq.company || enq.customer?.company || "Direct";
                    const custCountry = enq.country || enq.customer?.country || "Global";
                    const machName = enq.machineName || enq.machine?.name || "Machine Platform";
                    const refNum = enq.referenceNumber || enq.enquiryNumber || enq._id;
                    const repName = enq.assignedRep?.name || "Unassigned";

                    return (
                      <tr key={enq._id || refNum}>
                        <td>
                          <strong>{custName}</strong>
                          <span className="cell-sub">
                            {refNum} · {custCompany} ({custCountry})
                          </span>
                        </td>
                        <td>
                          <strong>{machName}</strong>
                          <span className="cell-sub">
                            {Array.isArray(enq.selectedOptions) ? `${enq.selectedOptions.length} selected options` : "Configured system"}
                          </span>
                        </td>
                        <td>
                          <strong>{formatPrice(enq.calculatedTotal || enq.targetBudget || 0)}</strong>
                        </td>
                        <td>
                          <span style={{ color: enq.assignedRep ? "inherit" : "var(--accent)" }}>
                            {repName}
                          </span>
                        </td>
                        <td>{getStatusBadge(enq.status)}</td>
                        <td>
                          <Link
                            aria-label={`View enquiry details for ${custName}`}
                            className="table-action"
                            to={`/enquiry-details#${enq._id || refNum}`}
                          >
                            <i className="bi bi-arrow-up-right"></i>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalItems={filteredEnquiries.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} itemName="enquiries" />
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Enquiries;
