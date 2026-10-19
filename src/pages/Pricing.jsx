import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const initialRules = [
  {
    id: "rule-1",
    name: "FX-420 Press · Base price",
    sub: "Primary machine price",
    machine: "FX-420 Press",
    type: "Base price",
    amount: "$84,500",
    updated: "Oct 12, 2026",
    status: "Active",
  },
  {
    id: "rule-2",
    name: "Automatic tool changer",
    sub: "Optional equipment",
    machine: "FX-420 Press",
    type: "Option adjustment",
    displayType: "Option",
    amount: "+$8,400",
    updated: "Oct 12, 2026",
    status: "Active",
  },
  {
    id: "rule-3",
    name: "CR-80 Cutter · Base price",
    sub: "Primary machine price",
    machine: "CR-80 Cutter",
    type: "Base price",
    amount: "$62,900",
    updated: "Oct 10, 2026",
    status: "Active",
  },
  {
    id: "rule-4",
    name: "Dust extraction unit",
    sub: "Optional equipment",
    machine: "CR-80 Cutter",
    type: "Option adjustment",
    displayType: "Option",
    amount: "+$2,750",
    updated: "Oct 09, 2026",
    status: "Active",
  },
];

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState("All machines");
  const [typeFilter, setTypeFilter] = useState("All price types");

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Pricing</strong>
    </>
  );

  const filteredRules = initialRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.machine.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMachine =
      machineFilter === "All machines" || rule.machine === machineFilter;

    const matchesType =
      typeFilter === "All price types" || rule.type === typeFilter;

    return matchesSearch && matchesMachine && matchesType;
  });

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>PRICE CONFIGURATION
            </div>
            <h1>Pricing</h1>
            <p className="welcome-subtitle">
              Set indicative machine prices and option adjustments shown in the
              configurator.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/add-price-rule">
              <i className="bi bi-plus-lg"></i> Add price rule
            </Link>
          </div>
        </section>

        <section className="summary-strip">
          <div className="summary-item">
            <span>Base prices</span>
            <strong>12</strong>
            <small>All machines covered</small>
          </div>
          <div className="summary-item">
            <span>Option adjustments</span>
            <strong>84</strong>
          </div>
          <div className="summary-item">
            <span>Last price update</span>
            <strong>Oct 12</strong>
            <small>By Jordan Miller</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search pricing rules"
                placeholder="Search machine or option"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter pricing by machine"
              className="filter-control"
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
            >
              <option>All machines</option>
              <option>FX-420 Press</option>
              <option>CR-80 Cutter</option>
            </select>
            <select
              aria-label="Filter price type"
              className="filter-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option>All price types</option>
              <option>Base price</option>
              <option>Option adjustment</option>
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PRICE RULE</th>
                  <th>MACHINE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>UPDATED</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>
                      <strong>{rule.name}</strong>
                      <span className="cell-sub">{rule.sub}</span>
                    </td>
                    <td>{rule.machine}</td>
                    <td>{rule.displayType || rule.type}</td>
                    <td>
                      <strong>{rule.amount}</strong>
                    </td>
                    <td>{rule.updated}</td>
                    <td>
                      <span className="table-status">{rule.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>
              Indicative prices are shown before final representative review.
            </span>
            <nav aria-label="Pagination" className="pagination">
              <a className="current" href="#page1">
                1
              </a>
              <a href="#page2">2</a>
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

export default Pricing;
