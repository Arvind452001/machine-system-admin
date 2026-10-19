import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const initialEnquiries = [
  {
    id: "amelia",
    customer: "Amelia Laurent",
    company: "Nordic Materials Co.",
    machine: "FX-420 Press",
    config: "6 selected options · $104,200",
    region: "France",
    flag: "🇫🇷",
    rep: "Unassigned",
    status: "New",
    statusClass: "table-status status-new",
    received: "12 min ago",
  },
  {
    id: "martin",
    customer: "Martin Keller",
    company: "Keller Anlagenbau",
    machine: "CR-80 Cutter",
    config: "4 selected options · $71,650",
    region: "Germany",
    flag: "🇩🇪",
    rep: "Friedrich Weber",
    status: "In review",
    statusClass: "table-status status-review",
    received: "48 min ago",
  },
  {
    id: "sofia",
    customer: "Sofia Papadakis",
    company: "Aegean Industrial",
    machine: "MX-220 Mixer",
    config: "3 selected options · $55,400",
    region: "Greece",
    flag: "🇬🇷",
    rep: "Elena Markou",
    status: "Assigned",
    statusClass: "table-status",
    received: "2 hours ago",
  },
  {
    id: "james",
    customer: "James Thompson",
    company: "Thompson & Sons",
    machine: "FX-420 Press",
    config: "5 selected options · $99,100",
    region: "United Kingdom",
    flag: "🇬🇧",
    rep: "Oliver Grant",
    status: "In discussion",
    statusClass: "table-status status-review",
    received: "Yesterday",
  },
];

const Enquiries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [regionFilter, setRegionFilter] = useState("All regions");

  const breadcrumb = (
    <>
      <span>Sales</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Enquiries</strong>
    </>
  );

  const filteredEnquiries = initialEnquiries.filter((enq) => {
    const matchesSearch =
      enq.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.machine.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" || enq.status === statusFilter;

    const matchesRegion =
      regionFilter === "All regions" || enq.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

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
              Review customer configurations, assign a regional representative,
              and track next steps.
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
            <span>Open enquiries</span>
            <strong>28</strong>
            <small>8 need assignment</small>
          </div>
          <div className="summary-item">
            <span>In discussion</span>
            <strong>14</strong>
          </div>
          <div className="summary-item">
            <span>Submitted this week</span>
            <strong>36</strong>
            <small>+12% this week</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search enquiries"
                placeholder="Search customer or enquiry"
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
              <option>Assigned</option>
              <option>In discussion</option>
            </select>
            <select
              aria-label="Filter by region"
              className="filter-control"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option>All regions</option>
              <option>France</option>
              <option>Germany</option>
              <option>Greece</option>
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>CONFIGURATION</th>
                  <th>REGION</th>
                  <th>REPRESENTATIVE</th>
                  <th>STATUS</th>
                  <th>RECEIVED</th>
                  <th>
                    <span className="visually-hidden">Open enquiry</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <strong>{enq.customer}</strong>
                      <span className="cell-sub">{enq.company}</span>
                    </td>
                    <td>
                      <strong>{enq.machine}</strong>
                      <span className="cell-sub">{enq.config}</span>
                    </td>
                    <td>
                      {enq.flag} {enq.region}
                    </td>
                    <td>{enq.rep}</td>
                    <td>
                      <span className={enq.statusClass}>{enq.status}</span>
                    </td>
                    <td>{enq.received}</td>
                    <td>
                      <Link
                        aria-label={`Review ${enq.customer} enquiry`}
                        className="table-action"
                        to={`/enquiry-details#${enq.id}`}
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
              Showing {filteredEnquiries.length} of {initialEnquiries.length}{" "}
              enquiries
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

export default Enquiries;
