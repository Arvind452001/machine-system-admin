import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const initialQuotes = [
  {
    id: "q2053",
    quoteNumber: "Q-2053",
    machine: "FX-420 Press",
    customer: "Amelia Laurent",
    company: "Nordic Materials Co.",
    rep: "Camille Moreau",
    value: "$112,800",
    validUntil: "Nov 14, 2026",
    status: "In preparation",
    statusClass: "table-status status-draft",
    region: "Europe",
  },
  {
    id: "q2048",
    quoteNumber: "Q-2048",
    machine: "CR-80 Cutter",
    customer: "Martin Keller",
    company: "Keller Anlagenbau",
    rep: "Friedrich Weber",
    value: "$76,400",
    validUntil: "Nov 02, 2026",
    status: "Sent",
    statusClass: "table-status status-review",
    region: "Europe",
  },
  {
    id: "q2044",
    quoteNumber: "Q-2044",
    machine: "MX-220 Mixer",
    customer: "Sofia Papadakis",
    company: "Aegean Industrial",
    rep: "Elena Markou",
    value: "$59,250",
    validUntil: "Oct 28, 2026",
    status: "Accepted",
    statusClass: "table-status",
    region: "Europe",
  },
  {
    id: "q2039",
    quoteNumber: "Q-2039",
    machine: "FX-420 Press",
    customer: "James Thompson",
    company: "Thompson & Sons",
    rep: "Oliver Grant",
    value: "$103,600",
    validUntil: "Oct 21, 2026",
    status: "Expired",
    statusClass: "table-status status-closed",
    region: "Europe",
  },
];

const Quotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [regionFilter, setRegionFilter] = useState("All regions");

  const breadcrumb = (
    <>
      <span>Sales</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Quotes</strong>
    </>
  );

  const filteredQuotes = initialQuotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.machine.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" ||
      (statusFilter === "Draft" && q.status === "In preparation") ||
      q.status === statusFilter;

    const matchesRegion =
      regionFilter === "All regions" || q.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

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
              Follow quotations prepared by your regional sales team and keep
              customer responses moving.
            </p>
          </div>
          <div className="header-actions">
            <a className="btn-subtle" href="#export">
              <i className="bi bi-download"></i> Export
            </a>
          </div>
        </section>

        <section className="summary-strip">
          <div className="summary-item">
            <span>In preparation</span>
            <strong>09</strong>
          </div>
          <div className="summary-item">
            <span>Sent to customers</span>
            <strong>18</strong>
            <small>6 awaiting response</small>
          </div>
          <div className="summary-item">
            <span>Accepted this month</span>
            <strong>07</strong>
            <small>+$318k quoted</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search quotes"
                placeholder="Search quote or customer"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter quotes by status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All statuses</option>
              <option>Draft</option>
              <option>Sent</option>
              <option>Accepted</option>
            </select>
            <select
              aria-label="Filter quotes by region"
              className="filter-control"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option>All regions</option>
              <option>Europe</option>
              <option>North America</option>
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>QUOTE</th>
                  <th>CUSTOMER</th>
                  <th>REPRESENTATIVE</th>
                  <th>VALUE</th>
                  <th>VALID UNTIL</th>
                  <th>STATUS</th>
                  <th>
                    <span className="visually-hidden">Open quote</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <strong>{q.quoteNumber}</strong>
                      <span className="cell-sub">{q.machine}</span>
                    </td>
                    <td>
                      <strong>{q.customer}</strong>
                      <span className="cell-sub">{q.company}</span>
                    </td>
                    <td>{q.rep}</td>
                    <td>
                      <strong>{q.value}</strong>
                    </td>
                    <td>{q.validUntil}</td>
                    <td>
                      <span className={q.statusClass}>{q.status}</span>
                    </td>
                    <td>
                      <Link
                        aria-label={`Open quote ${q.quoteNumber}`}
                        className="table-action"
                        to={`/quote-details#${q.id}`}
                      >
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>
              Showing {filteredQuotes.length} of {initialQuotes.length} quotes
            </span>
            <nav aria-label="Pagination" className="pagination">
              <a aria-label="Previous page" href="#prev">
                <i className="bi bi-chevron-left"></i>
              </a>
              <a className="current" href="#page1">
                1
              </a>
              <a href="#page2">2</a>
              <a href="#page3">3</a>
              <a aria-label="Next page" href="#next">
                <i className="bi bi-chevron-right"></i>
              </a>
            </nav>
          </footer>
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Quotes;
