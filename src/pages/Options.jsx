import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { optionsApi } from "../api/optionsApi";
import Pagination from "../components/Pagination";
import StatSpinner from "../components/StatSpinner";
import { machinesApi } from "../api/machinesApi";

const Options = () => {
  const [options, setOptions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Quick Rule Test Modal State
  const [showValidator, setShowValidator] = useState(false);
  const [testMachineId, setTestMachineId] = useState("");
  const [testSelectedCodes, setTestSelectedCodes] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Load options from GET /api/v1/options
    optionsApi
      .getOptions()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setOptions(list);
      })
      .catch((err) => {
        console.warn("Could not load options from API:", err.message);
        setOptions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Load machines for filter and validator dropdown
    machinesApi
      .getMachines()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMachines(list);
        if (list.length > 0) {
          setTestMachineId(list[0]._id || list[0].slug);
        }
      })
      .catch((err) => {
        console.warn("Could not load machines in Options:", err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Options &amp; rules</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleTestRule = async () => {
    if (!testMachineId) return;
    setValidating(true);
    setValidationResult(null);
    try {
      // POST /api/v1/options/validate
      const res = await optionsApi.validateOptions({
        machineId: testMachineId,
        optionCodes: testSelectedCodes,
      });
      setValidationResult(res);
    } catch (err) {
      setValidationResult({
        success: false,
        isValid: false,
        conflicts: [err.message],
      });
    } finally {
      setValidating(false);
    }
  };

  const toggleTestCode = (code) => {
    setTestSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const filteredOptions = options.filter((opt) => {
    const name = opt.name || "";
    const code = opt.code || "";
    const cat = opt.category || "";
    const status = (opt.status || (opt.isActive ? "active" : "draft")).toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All categories" ||
      cat.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "All statuses" ||
      (statusFilter.toLowerCase() === "active" && status === "active") ||
      (statusFilter.toLowerCase() === "draft" && (status === "draft" || status === "inactive"));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(
    new Set(options.map((o) => o.category).filter(Boolean))
  );

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
              Control selectable machine features, compatibility rules, dependencies, and add-on pricing.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => setShowValidator(!showValidator)}
            >
              <i className="bi bi-shield-check"></i> {showValidator ? "Hide Rule Tester" : "Test Rules"}
            </button>
            <Link className="btn btn-accent" to="/add-option">
              <i className="bi bi-plus-lg"></i> Add option
            </Link>
          </div>
        </section>

        {showValidator && (
          <section
            className="panel mb-4 p-3"
            style={{
              background: "rgba(39, 98, 76, 0.06)",
              border: "1px solid var(--accent, #27624c)",
              borderRadius: "8px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong style={{ fontSize: "15px" }}>
                  <i className="bi bi-cpu-fill text-success me-2"></i> Real-time Rule Engine
                </strong>
                <p style={{ margin: 0, fontSize: "13px", color: "gray" }}>
                  Select option codes to verify against dependencies and mutual exclusions in the backend engine.
                </p>
              </div>
              <button
                className="btn btn-sm btn-subtle"
                onClick={() => setShowValidator(false)}
              >
                Close
              </button>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-md-4">
                <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Target Machine
                </label>
                <select
                  className="form-control"
                  value={testMachineId}
                  onChange={(e) => setTestMachineId(e.target.value)}
                >
                  {machines.map((m) => (
                    <option key={m._id || m.slug} value={m._id || m.slug}>
                      {m.name} ({m.sku || m.slug})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "600" }}>
                  Selected Options for Simulation
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {options.map((opt) => {
                    const isSelected = testSelectedCodes.includes(opt.code);
                    return (
                      <button
                        key={opt.code || opt._id}
                        type="button"
                        onClick={() => toggleTestCode(opt.code)}
                        className={`btn btn-sm ${isSelected ? "btn-accent" : "btn-outline"}`}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        {isSelected && <i className="bi bi-check me-1"></i>}
                        {opt.code} ({opt.name.slice(0, 24)}...)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-accent btn-sm"
                onClick={handleTestRule}
                disabled={validating}
              >
                {validating ? "Validating rules..." : "Run Engine Validation"}
              </button>
              {validationResult && (
                <div style={{ fontSize: "13px" }}>
                  {validationResult.isValid ? (
                    <span className="badge bg-success" style={{ fontSize: "12px", padding: "6px 12px" }}>
                      <i className="bi bi-check-circle me-1"></i> Valid Configuration: No conflicts detected
                    </span>
                  ) : (
                    <span className="badge bg-danger" style={{ fontSize: "12px", padding: "6px 12px" }}>
                      <i className="bi bi-exclamation-triangle me-1"></i> Conflicts:{" "}
                      {(validationResult.conflicts || []).join(", ") || "Configuration invalid"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="summary-strip">
          <div className="summary-item">
            <span>Active options</span>
            <strong>{loading ? <StatSpinner /> : options.length}</strong>
            <small>{loading ? "Loading..." : "Live catalog add-ons"}</small>
          </div>
          <div className="summary-item">
            <span>Categories</span>
            <strong>{loading ? <StatSpinner /> : uniqueCategories.length}</strong>
            <small>{loading ? "Loading..." : "Option groups"}</small>
          </div>
          <div className="summary-item">
            <span>Rule engine</span>
            <strong>{loading ? <StatSpinner /> : "Active"}</strong>
            <small>{loading ? "Syncing..." : "Dependency validation enabled"}</small>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search options"
                placeholder="Search options by name, code or category"
                type="search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter category"
              className="filter-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
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
                  <th>CODE / CATEGORY</th>
                  <th>PRICE IMPACT</th>
                  <th>DEPENDENCIES / RULES</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-muted, #85867f)" }}>
                      <i className="bi bi-arrow-repeat me-2" style={{ display: "inline-block", animation: "spin 1s linear infinite" }}></i>
                      Loading configuration options...
                    </td>
                  </tr>
                ) : filteredOptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "48px 16px" }}>
                      <div style={{ maxWidth: "360px", margin: "0 auto", textAlign: "center" }}>
                        <i className="bi bi-sliders" style={{ fontSize: "32px", color: "#c5c6bf", display: "block", marginBottom: "12px" }}></i>
                        <strong style={{ display: "block", marginBottom: "6px", fontSize: "15px" }}>
                          Data is not found
                        </strong>
                        <p style={{ color: "#85867f", fontSize: "12px", marginBottom: "16px" }}>
                          {searchTerm || categoryFilter !== "All categories" || statusFilter !== "All statuses"
                            ? "No configuration options match the selected filters."
                            : "No configurable add-ons or options currently recorded."}
                        </p>
                        <Link to="/add-option" className="btn btn-accent btn-sm">
                          <i className="bi bi-plus-lg me-1"></i> Add new option
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOptions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((opt) => {
                    const isActive =
                      (opt.status || "").toLowerCase() === "active" || Boolean(opt.isActive);
                    const reqCount = Array.isArray(opt.requiresOption) ? opt.requiresOption.length : 0;
                    const incompCount = Array.isArray(opt.incompatibleWith)
                      ? opt.incompatibleWith.length
                      : 0;

                    return (
                      <tr key={opt._id || opt.code || opt.id}>
                        <td>
                          <strong>{opt.name}</strong>
                          <span className="cell-sub">{opt.description || opt.sub || "Modular upgrade"}</span>
                        </td>
                        <td>
                          <strong>{opt.code}</strong>
                          <span className="cell-sub">{(opt.category || "General").toUpperCase()}</span>
                        </td>
                        <td>
                          <strong>+{formatPrice(opt.priceDelta || opt.price)}</strong>
                        </td>
                        <td>
                          {reqCount > 0 || incompCount > 0 ? (
                            <span>
                              {reqCount > 0 && <small className="d-block text-primary">Requires {reqCount} option(s)</small>}
                              {incompCount > 0 && <small className="d-block text-danger">Incompatible with {incompCount}</small>}
                            </span>
                          ) : (
                            <span style={{ color: "gray" }}>Standalone</span>
                          )}
                        </td>
                        <td>
                          <span className={`table-status ${isActive ? "" : "status-draft"}`}>
                            {isActive ? "Active" : "Draft"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalItems={filteredOptions.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} itemName="options" />
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Options;
