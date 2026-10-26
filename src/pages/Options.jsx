import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { optionsApi } from "../api/optionsApi";
import Pagination from "../components/Pagination";
import { machinesApi } from "../api/machinesApi";

const FALLBACK_OPTIONS = [
  {
    _id: "6ad9fc24e39daefd54e568e7",
    name: "High-Pressure Through-Spindle Coolant (70 Bar)",
    code: "OPT-COOL-70B",
    category: "cooling",
    priceDelta: 8500,
    description: "Direct 70 bar high-pressure coolant through spindle for deep hole drilling and titanium chip clearance.",
    status: "active",
    incompatibleWith: [],
    requiresOption: [],
  },
  {
    _id: "6ad9fc24e39daefd54e568ea",
    name: "Automatic Robotic Arm Workpiece Loading (15kg payload)",
    code: "OPT-AUTO-ROBOT",
    category: "automation",
    priceDelta: 28000,
    description: "Integrated 6-axis collaborative robotic cell for lights-out automated loading and unloading.",
    status: "active",
    incompatibleWith: [],
    requiresOption: [],
  },
  {
    _id: "6ad9fc25e39daefd54e568ed",
    name: "Optical Tool Setter & Renishaw Workpiece Probe",
    code: "OPT-TOOL-PROBE",
    category: "tooling",
    priceDelta: 6200,
    description: "Automated in-cycle part alignment and broken tool detection package with wireless probe.",
    status: "active",
    incompatibleWith: [],
    requiresOption: [],
  },
  {
    _id: "6ad9fc25e39daefd54e568f0",
    name: "High-Torque Synchronous Spindle Upgrade (15,000 RPM)",
    code: "OPT-SPINDLE-15K",
    category: "general",
    priceDelta: 14500,
    description: "High-speed oil-air lubricated spindle rated for continuous 35kW aerospace alloy cutting.",
    status: "active",
    incompatibleWith: [],
    requiresOption: [],
  },
  {
    _id: "6ad9fc26e39daefd54e568f3",
    name: "Hermetic Full Machine Enclosure with Mist Collector",
    code: "OPT-ENCL-MIST",
    category: "enclosure",
    priceDelta: 4900,
    description: "Complete noise suppression enclosure with electrostatic oil mist extraction system.",
    status: "active",
    incompatibleWith: [],
    requiresOption: [],
  },
  {
    _id: "6ad9fc26e39daefd54e568f6",
    name: "Extended 3-Year Enterprise Care & Onsite Preventive Maintenance",
    code: "OPT-SERV-3YR",
    category: "service",
    priceDelta: 9200,
    description: "Comprehensive 36-month SLA covering parts, bi-annual calibration, and 24/7 priority engineer support.",
    status: "active",
    incompatibleWith: [],
    requiresOption: [],
  },
];

const Options = () => {
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);

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
        if (list.length > 0) {
          setOptions(list);
        }
      })
      .catch((err) => {
        console.warn("Using offline options fallback:", err.message);
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
            <strong>{options.length}</strong>
            <small>Live catalog add-ons</small>
          </div>
          <div className="summary-item">
            <span>Categories</span>
            <strong>{uniqueCategories.length || 6}</strong>
          </div>
          <div className="summary-item">
            <span>Rule engine</span>
            <strong>Active</strong>
            <small>Dependency validation enabled</small>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredOptions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((opt) => {
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
                })}
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
