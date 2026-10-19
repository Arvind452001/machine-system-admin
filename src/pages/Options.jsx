import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const initialOptions = [
  {
    id: "opt-1",
    name: "Automatic tool changer",
    sub: "Reduce changeover time",
    machine: "FX-420 Press",
    price: "+$8,400",
    dependencies: "Requires safety enclosure",
    status: "Active",
    statusClass: "table-status",
  },
  {
    id: "opt-2",
    name: "Safety enclosure",
    sub: "Full perimeter guarding",
    machine: "FX-420 Press",
    price: "+$4,200",
    dependencies: "None",
    status: "Active",
    statusClass: "table-status",
  },
  {
    id: "opt-3",
    name: "Dust extraction unit",
    sub: "Integrated filtration system",
    machine: "CR-80 Cutter",
    price: "+$2,750",
    dependencies: "Requires duct kit",
    status: "Active",
    statusClass: "table-status",
  },
  {
    id: "opt-4",
    name: "Extended warranty",
    sub: "Additional 24 months cover",
    machine: "All machines",
    price: "+$1,900",
    dependencies: "Available with service plan",
    status: "Draft",
    statusClass: "table-status status-draft",
  },
];

const Options = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState("All machines");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Options &amp; rules</strong>
    </>
  );

  const filteredOptions = initialOptions.filter((opt) => {
    const matchesSearch =
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.machine.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMachine =
      machineFilter === "All machines" || opt.machine === machineFilter;

    const matchesStatus =
      statusFilter === "All statuses" || opt.status === statusFilter;

    return matchesSearch && matchesMachine && matchesStatus;
  });

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATION LOGIC
            </div>
            <h1>Options &amp; rules</h1>
            <p className="welcome-subtitle">
              Control selectable machine features, dependencies, and
              customer-facing descriptions.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/add-option">
              <i className="bi bi-plus-lg"></i> Add option
            </Link>
          </div>
        </section>

        <section className="summary-strip">
          <div className="summary-item">
            <span>Active options</span>
            <strong>84</strong>
          </div>
          <div className="summary-item">
            <span>Dependency rules</span>
            <strong>19</strong>
          </div>
          <div className="summary-item">
            <span>Needs review</span>
            <strong>04</strong>
            <small>Check before publishing</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search options"
                placeholder="Search options or machine"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter machine"
              className="filter-control"
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
            >
              <option>All machines</option>
              <option>FX-420 Press</option>
              <option>CR-80 Cutter</option>
            </select>
            <select
              aria-label="Filter option status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>OPTION</th>
                  <th>MACHINE</th>
                  <th>PRICE IMPACT</th>
                  <th>DEPENDENCIES</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOptions.map((opt) => (
                  <tr key={opt.id}>
                    <td>
                      <strong>{opt.name}</strong>
                      <span className="cell-sub">{opt.sub}</span>
                    </td>
                    <td>{opt.machine}</td>
                    <td>
                      <strong>{opt.price}</strong>
                    </td>
                    <td>{opt.dependencies}</td>
                    <td>
                      <span className={opt.statusClass}>{opt.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>
              Showing {filteredOptions.length} of {initialOptions.length}{" "}
              options
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

export default Options;
