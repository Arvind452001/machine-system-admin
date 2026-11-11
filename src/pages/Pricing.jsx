import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { machinesApi } from "../api/machinesApi";
import { optionsApi } from "../api/optionsApi";

const Pricing = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [machineNames, setMachineNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState("All machines");
  const [typeFilter, setTypeFilter] = useState("All price types");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.allSettled([machinesApi.getMachines(), optionsApi.getOptions()])
      .then(([machinesRes, optionsRes]) => {
        if (!mounted) return;

        const machinesList =
          machinesRes.status === "fulfilled"
            ? Array.isArray(machinesRes.value?.data)
              ? machinesRes.value.data
              : Array.isArray(machinesRes.value)
              ? machinesRes.value
              : []
            : [];

        const optionsList =
          optionsRes.status === "fulfilled"
            ? Array.isArray(optionsRes.value?.data)
              ? optionsRes.value.data
              : Array.isArray(optionsRes.value)
              ? optionsRes.value
              : []
            : [];

        const names = [...new Set(machinesList.map((m) => m.name).filter(Boolean))];
        setMachineNames(names);

        const formatCurrency = (val) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(val || 0);

        // Machine base price rules
        const machineRules = machinesList.map((m) => ({
          id: `mach-${m._id || m.slug}`,
          name: `${m.name} · Base Price`,
          sub: `SKU: ${m.sku || m.slug || "Standard"} · Category: ${m.category || "General"}`,
          machine: m.name,
          type: "Base price",
          displayType: "Base price",
          amount: formatCurrency(m.basePrice),
          updated: m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : "Active",
          status:
            (m.status || "").toLowerCase() === "published" || (m.status || "").toLowerCase() === "active"
              ? "Active"
              : "Draft",
        }));

        // Option adjustment rules
        const optionRules = optionsList.map((o) => {
          const associatedMachine =
            machinesList.find((m) => m._id === o.machine || m.id === o.machine)?.name ||
            o.machine?.name ||
            "All compatible machines";

          return {
            id: `opt-${o._id || o.code}`,
            name: `${o.name} · Option Adjustment`,
            sub: `Code: ${o.code || "OPT"} · Category: ${(o.category || "General").toUpperCase()}`,
            machine: associatedMachine,
            type: "Option adjustment",
            displayType: "Option",
            amount: `+${formatCurrency(o.priceDelta || o.price || 0)}`,
            updated: o.updatedAt ? new Date(o.updatedAt).toLocaleDateString() : "Active",
            status: o.isActive !== false ? "Active" : "Draft",
          };
        });

        setRules([...machineRules, ...optionRules]);
      })
      .catch((err) => {
        console.warn("Could not load pricing rules:", err.message);
        setRules([]);
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
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Pricing</strong>
    </>
  );

  const filteredRules = rules.filter((rule) => {
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
              Live indicative machine base prices and modular option adjustments.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/add-price-rule">
              <i className="bi bi-plus-lg"></i> Add price rule
            </Link>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter pricing by machine"
              className="filter-control"
              value={machineFilter}
              onChange={(e) => {
                setMachineFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All machines</option>
              {machineNames.map((name, i) => (
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter price type"
              className="filter-control"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
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
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-muted, #85867f)" }}>
                      <i className="bi bi-arrow-repeat me-2" style={{ display: "inline-block", animation: "spin 1s linear infinite" }}></i>
                      Loading pricing rules...
                    </td>
                  </tr>
                ) : filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px" }}>
                      <div style={{ maxWidth: "360px", margin: "0 auto", textAlign: "center" }}>
                        <i className="bi bi-tag" style={{ fontSize: "32px", color: "#c5c6bf", display: "block", marginBottom: "12px" }}></i>
                        <strong style={{ display: "block", marginBottom: "6px", fontSize: "15px" }}>
                          Data is not found
                        </strong>
                        <p style={{ color: "#85867f", fontSize: "12px", marginBottom: "16px" }}>
                          {searchTerm || machineFilter !== "All machines" || typeFilter !== "All price types"
                            ? "No pricing rules match the selected filter criteria."
                            : "No machine rates or option pricing adjustments currently recorded."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRules
                    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                    .map((rule) => (
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
                          <span className={`table-status ${rule.status === "Active" ? "" : "status-draft"}`}>
                            {rule.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRules.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemName="price rules"
          />
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Pricing;
