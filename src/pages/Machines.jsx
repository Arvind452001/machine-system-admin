import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { machinesApi } from "../api/machinesApi";
import Pagination from "../components/Pagination";

const FALLBACK_MACHINES = [
  {
    _id: "6ad9fc28e39daefd54e568ff",
    name: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
    slug: "ms-l4000",
    sku: "MS-LC-4000-FIBER",
    category: "Laser processing",
    basePrice: 228000,
    availableOptions: new Array(6),
    status: "published",
    icon: "bi-cpu",
  },
  {
    _id: "6ad9fc27e39daefd54e568fc",
    name: "MS-M500 5-Axis Machining Center",
    slug: "ms-m500",
    sku: "MS-MC-500-5X",
    category: "Turning & Milling",
    basePrice: 185000,
    availableOptions: new Array(5),
    status: "published",
    icon: "bi-gear-wide-connected",
  },
  {
    _id: "6ad9fc27e39daefd54e568f9",
    name: "MS-V850 Precision Vertical Machining Center",
    slug: "ms-v850",
    sku: "MS-VMC-850",
    category: "Turning & Milling",
    basePrice: 142000,
    availableOptions: new Array(4),
    status: "published",
    icon: "bi-arrow-repeat",
  },
];

const Machines = () => {
  const [machines, setMachines] = useState(FALLBACK_MACHINES);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Load machines from GET /api/v1/machines
    machinesApi
      .getMachines()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setMachines(list);
        }
      })
      .catch((err) => {
        console.warn("Using offline machines fallback in Admin:", err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Load dynamic categories from GET /api/v1/machines/categories
    machinesApi
      .getCategories()
      .then((res) => {
        if (!mounted) return;
        const catList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCategories(catList);
      })
      .catch((err) => {
        console.warn("Could not load categories from API:", err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Machines</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredMachines = machines.filter((machine) => {
    const name = machine.name || "";
    const sku = machine.sku || machine.slug || "";
    const cat = machine.category || "";
    const status = machine.status || "published";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" ||
      (statusFilter.toLowerCase() === "published" && (status === "published" || status === "active")) ||
      (statusFilter.toLowerCase() === "draft" && status === "draft");

    const matchesCategory =
      categoryFilter === "All categories" ||
      cat.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const publishedCount = machines.filter(
    (m) => (m.status || "").toLowerCase() === "published" || (m.status || "").toLowerCase() === "active"
  ).length;
  const draftCount = machines.filter((m) => (m.status || "").toLowerCase() === "draft").length;
  const totalOptionsCount = machines.reduce(
    (acc, m) => acc + (Array.isArray(m.availableOptions) ? m.availableOptions.length : 0),
    0
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATOR CATALOG
            </div>
            <h1>Machines</h1>
            <p className="welcome-subtitle">
              Manage the industrial machines customers can configure and enquire about.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/add-machine">
              <i className="bi bi-plus-lg"></i> Add machine
            </Link>
          </div>
        </section>

        <section className="summary-strip">
          <div className="summary-item">
            <span>Published machines</span>
            <strong>{publishedCount}</strong>
            <small>Active in catalog</small>
          </div>
          <div className="summary-item">
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="summary-item">
            <span>Options across catalog</span>
            <strong>{totalOptionsCount || 15}</strong>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search machines"
                placeholder="Search machines by name, code or category"
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
              <option>Published</option>
              <option>Draft</option>
            </select>
            <select
              aria-label="Filter by category"
              className="filter-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All categories</option>
              {categories.map((cat, i) => {
                const catName = typeof cat === "string" ? cat : cat.name;
                return (
                  <option key={i} value={catName}>
                    {catName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>MACHINE</th>
                  <th>CATEGORY</th>
                  <th>BASE PRICE</th>
                  <th>OPTIONS</th>
                  <th>STATUS</th>
                  <th>
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((machine) => {
                  const mId = machine._id || machine.id || machine.slug;
                  const isPublished =
                    (machine.status || "").toLowerCase() === "published" ||
                    (machine.status || "").toLowerCase() === "active";
                  const optionsLen = Array.isArray(machine.availableOptions)
                    ? machine.availableOptions.length
                    : 0;

                  return (
                    <tr key={mId}>
                      <td>
                        <div className="table-product">
                          <span className="product-thumb">
                            <i className="bi bi-gear-wide-connected"></i>
                          </span>
                          <span>
                            <strong>{machine.name}</strong>
                            <span className="cell-sub">{machine.sku || machine.slug}</span>
                          </span>
                        </div>
                      </td>
                      <td>{machine.category || "General"}</td>
                      <td>
                        <strong>{formatPrice(machine.basePrice)}</strong>
                      </td>
                      <td>{optionsLen} options</td>
                      <td>
                        <span className={`table-status ${isPublished ? "" : "status-draft"}`}>
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <Link
                          aria-label={`Manage ${machine.name}`}
                          className="table-action"
                          to={`/machine-details?id=${mId}`}
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
          <Pagination currentPage={currentPage} totalItems={filteredMachines.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} itemName="machines" />
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Machines;
