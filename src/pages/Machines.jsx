import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { categoryService } from "../services/categoryService";

const initialMachines = [
  {
    id: "fx-420",
    name: "FX-420 Press",
    sub: "FW-FX420-01",
    icon: "bi-gear-wide-connected",
    category: "Hydraulic forming",
    price: "$84,500",
    options: "16 options",
    status: "Published",
    statusClass: "table-status",
    link: "/machine-details",
  },
  {
    id: "cr-80",
    name: "CR-80 Cutter",
    sub: "FW-CR080-02",
    icon: "bi-cpu",
    category: "Precision cutting",
    price: "$62,900",
    options: "12 options",
    status: "Published",
    statusClass: "table-status",
    link: "/cr80-details",
  },
  {
    id: "mx-220",
    name: "MX-220 Mixer",
    sub: "FW-MX220-03",
    icon: "bi-arrow-repeat",
    category: "Industrial mixing",
    price: "$48,750",
    options: "9 options",
    status: "Published",
    statusClass: "table-status",
    link: "/mx220-details",
  },
  {
    id: "pl-600",
    name: "PL-600 Loader",
    sub: "FW-PL600-04",
    icon: "bi-box-seam",
    category: "Material handling",
    price: "$91,200",
    options: "11 options",
    status: "Draft",
    statusClass: "table-status status-draft",
    link: "/pl600-details",
  },
];

const Machines = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [categories, setCategories] = useState(() => categoryService.getCategoriesSync());

  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Error loading categories in Machines:", e);
      }
    };
    loadCats();

    const handleUpdate = () => {
      setCategories(categoryService.getCategoriesSync());
    };
    window.addEventListener("machine-categories-changed", handleUpdate);
    return () => {
      window.removeEventListener("machine-categories-changed", handleUpdate);
    };
  }, []);

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Machines</strong>
    </>
  );

  const filteredMachines = initialMachines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" || machine.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All categories" ||
      machine.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

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
              Manage the industrial machines customers can configure and enquire
              about.
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
            <strong>12</strong>
            <small>+2 this month</small>
          </div>
          <div className="summary-item">
            <span>Drafts</span>
            <strong>03</strong>
          </div>
          <div className="summary-item">
            <span>Options across catalog</span>
            <strong>84</strong>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search machines"
                placeholder="Search machines"
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
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
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
                {filteredMachines.map((machine) => (
                  <tr key={machine.id}>
                    <td>
                      <div className="table-product">
                        <span className="product-thumb">
                          <i className={`bi ${machine.icon}`}></i>
                        </span>
                        <span>
                          <strong>{machine.name}</strong>
                          <span className="cell-sub">{machine.sub}</span>
                        </span>
                      </div>
                    </td>
                    <td>{machine.category}</td>
                    <td>
                      <strong>{machine.price}</strong>
                    </td>
                    <td>{machine.options}</td>
                    <td>
                      <span className={machine.statusClass}>
                        {machine.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        aria-label={`Manage ${machine.name}`}
                        className="table-action"
                        to={machine.link}
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
              Showing {filteredMachines.length} of {initialMachines.length}{" "}
              machines
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

export default Machines;
