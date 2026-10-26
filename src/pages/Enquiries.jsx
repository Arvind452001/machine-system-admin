import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { enquiriesApi } from "../api/enquiriesApi";
import Pagination from "../components/Pagination";

const FALLBACK_ENQUIRIES = [
  {
    _id: "6adb30b0c536b1269e97cdd7",
    referenceNumber: "ENQ-2026-5250",
    fullName: "david miller",
    company: "Risen technologies",
    machineName: "MS-M500 5-Axis Machining Center",
    calculatedTotal: 185000,
    country: "Canada",
    status: "assigned",
    assignedRep: { name: "Alexander Sterling" },
    createdAt: "2026-10-23T10:02:24.042Z",
  },
  {
    _id: "6adb1f5138d252d62f0d772e",
    referenceNumber: "ENQ-2026-6080",
    fullName: "Morgan Chen",
    company: "Chen Precision Machining",
    machineName: "Axis 400 · Precision CNC lathe",
    calculatedTotal: 50900,
    country: "United States",
    status: "new",
    assignedRep: null,
    createdAt: "2026-10-23T08:48:17.000Z",
  },
  {
    _id: "6adb036ed1c14c960efb9ccf",
    referenceNumber: "ENQ-2026-1340",
    fullName: "David Vance",
    company: "Apex Precision Engineering Ltd",
    machineName: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
    calculatedTotal: 256500,
    country: "United States",
    status: "quote_ready",
    assignedRep: { name: "Alexander Sterling" },
    createdAt: "2026-10-23T06:49:18.978Z",
  },
];

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState(FALLBACK_ENQUIRIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    enquiriesApi
      .getEnquiries()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setEnquiries(list);
        }
      })
      .catch((err) => {
        console.warn("Using offline fallback in Admin Enquiries:", err.message);
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
            <strong>{enquiries.length}</strong>
            <small>Captured in database</small>
          </div>
          <div className="summary-item">
            <span>Awaiting assignment</span>
            <strong>
              {enquiries.filter((e) => !e.assignedRep && (e.status || "").includes("new")).length}
            </strong>
          </div>
          <div className="summary-item">
            <span>In discussion / Quotes</span>
            <strong>
              {enquiries.filter((e) => (e.status || "").includes("quote") || (e.status || "").includes("review")).length}
            </strong>
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter by status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                {filteredEnquiries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((enq) => {
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
                })}
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
