import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { categoryService } from "../services/categoryService";

const AVAILABLE_ICONS = [
  { value: "bi-gear-wide-connected", label: "Gears & Forming" },
  { value: "bi-cpu", label: "CPU & Precision" },
  { value: "bi-arrow-repeat", label: "Mixing & Rotation" },
  { value: "bi-box-seam", label: "Handling & Logistics" },
  { value: "bi-tools", label: "Tooling & Additive" },
  { value: "bi-lightning-charge", label: "Power & Electrical" },
  { value: "bi-wrench-adjustable", label: "Maintenance & Assembly" },
  { value: "bi-motherboard", label: "Electronics & Control" },
  { value: "bi-robot", label: "Robotics & Automation" },
  { value: "bi-bounding-box-circles", label: "Laser & Optics" },
];

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const [statusFilter, setStatusFilter] = useState("All statuses");

  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    name: "",
    description: "",
    order: 1,
  });
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Feedback toast
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Fallback to sync local data
      setCategories(categoryService.getCategoriesSync());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();

    const handleCategoryChange = () => {
      setCategories(categoryService.getCategoriesSync());
    };

    window.addEventListener("machine-categories-changed", handleCategoryChange);
    return () => {
      window.removeEventListener("machine-categories-changed", handleCategoryChange);
    };
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalFormData({
      name: "",
      description: "",
      order: categories.length + 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setModalFormData({
      name: cat.name || "",
      description: cat.description || "",
      order: cat.order ?? cat.displayOrder ?? 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError("");
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    const payload = {
      name: modalFormData.name.trim(),
      description: (modalFormData.description || "").trim(),
      order: Number(modalFormData.order) || 1,
    };

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id || editingCategory.id, payload);
        showNotification(`Category "${payload.name}" updated successfully.`);
      } else {
        await categoryService.createCategory(payload);
        showNotification(`Category "${payload.name}" created successfully.`);
      }
      closeModal();
      loadCategories();
    } catch (err) {
      setFormError(err.message || "An error occurred while saving the category.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteSubmitting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete._id || categoryToDelete.id);
      showNotification(`Category "${categoryToDelete.name}" was deleted.`, "warning");
      setCategoryToDelete(null);
      loadCategories();
    } catch (err) {
      showNotification(err.message || "Failed to delete category.", "danger");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.code && cat.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All statuses" || cat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalActive = categories.filter((c) => c.status === "Active").length;
  const totalDraft = categories.filter((c) => c.status !== "Active").length;
  const totalMachinesTagged = categories.reduce((sum, c) => sum + (c.machineCount || 0), 0);

  const breadcrumb = (
    <>
      <Link to="/dashboard">Workspace</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Categories</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        {/* Toast Notification */}
        {notification && (
          <div
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 9999,
              padding: "12px 18px",
              borderRadius: "6px",
              background: notification.type === "danger" ? "#842029" : notification.type === "warning" ? "#664d03" : "#0f5132",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "600",
              boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "fadeIn .2s ease",
            }}
          >
            <i
              className={`bi ${
                notification.type === "danger"
                  ? "bi-exclamation-triangle"
                  : notification.type === "warning"
                  ? "bi-info-circle"
                  : "bi-check-circle"
              }`}
            ></i>
            <span>{notification.message}</span>
          </div>
        )}

        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATOR CATALOG
            </div>
            <h1>Machine Categories</h1>
            <p className="welcome-subtitle">
              Manage machinery classifications, codes, and configurator filter groupings.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-accent" onClick={openCreateModal}>
              <i className="bi bi-plus-lg"></i> Add category
            </button>
          </div>
        </section>

        {/* Summary Strip */}
        <section className="summary-strip">
          <div className="summary-item">
            <span>Total Categories</span>
            <strong>{categories.length.toString().padStart(2, "0")}</strong>
            <small>{totalActive} active in catalog</small>
          </div>
          <div className="summary-item">
            <span>Active Classifications</span>
            <strong>{totalActive.toString().padStart(2, "0")}</strong>
            <small>{totalDraft} draft / unlisted</small>
          </div>
          <div className="summary-item">
            <span>Catalog Distribution</span>
            <strong>{totalMachinesTagged.toString().padStart(2, "0")}</strong>
            <small>Active machines categorized</small>
          </div>
        </section>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search categories"
                placeholder="Search categories by name, code or desc"
                
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter category status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
            <Link to="/add-machine" className="btn-subtle" title="Configure machine with dynamic categories">
              <i className="bi bi-gear"></i> Add machine
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>CODE</th>
                  <th>DESCRIPTION</th>
                  <th>MACHINES</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "#85867f" }}>
                        <i className="bi bi-arrow-repeat" style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: "8px" }}></i>
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div style={{ maxWidth: "360px", margin: "0 auto", textAlign: "center" }}>
                        <i className="bi bi-tags" style={{ fontSize: "32px", color: "#c5c6bf", display: "block", marginBottom: "12px" }}></i>
                        <strong style={{ display: "block", marginBottom: "6px", fontSize: "14px" }}>
                          No categories found
                        </strong>
                        <p style={{ color: "#85867f", fontSize: "12px", marginBottom: "16px" }}>
                          {searchTerm
                            ? `No categories match "${searchTerm}". Try resetting your filter.`
                            : "Create your first machine category to organize products in the configurator."}
                        </p>
                        <button className="btn btn-accent" onClick={openCreateModal}>
                          <i className="bi bi-plus-lg"></i> Create category
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <div className="table-product">
                          <span className="product-thumb">
                            <i className={`bi ${cat.icon || "bi-gear-wide-connected"}`}></i>
                          </span>
                          <span>
                            <strong>{cat.name}</strong>
                            <span className="cell-sub">{cat.slug || cat.code}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: "#f3f3f0",
                            color: "#30312c",
                            fontFamily: "monospace",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {cat.code || "—"}
                        </span>
                      </td>
                      <td style={{ maxWidth: "280px", whiteSpace: "normal" }}>
                        <span style={{ color: "#777871", fontSize: "11px", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {cat.description || "No description provided."}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: "#fafaf8",
                            border: "1px solid #ebebe8",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          <i className="bi bi-box-seam" style={{ fontSize: "10px", color: "#85867f" }}></i>
                          {cat.machineCount ?? 0} machines
                        </span>
                      </td>
                      <td>
                        <span
                          className={`table-status ${
                            cat.status === "Active" ? "" : "status-draft"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "16px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            aria-label={`Edit ${cat.name}`}
                            className="table-action"
                            title="Edit Category"
                            onClick={() => openEditModal(cat)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            aria-label={`Delete ${cat.name}`}
                            className="table-action"
                            style={{ color: "#b84c2d" }}
                            title="Delete Category"
                            onClick={() => setCategoryToDelete(cat)}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalItems={filteredCategories.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} itemName="categories" />
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px", borderTop: "1px solid #f0f0ee" }}>
            <button
              className="btn-subtle"
              style={{ height: "30px", fontSize: "11px", padding: "0 10px" }}
              onClick={() => {
                if (window.confirm("Reset categories to default initial set?")) {
                  categoryService.resetDefaults();
                  loadCategories();
                  showNotification("Categories reset to default catalog values.");
                }
              }}
            >
              <i className="bi bi-arrow-counterclockwise" style={{ marginRight: "4px" }}></i>
              Reset Catalog
            </button>
          </div>
        </section>

        {/* Create / Edit Category Modal */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(17, 18, 16, 0.65)",
              backdropFilter: "blur(4px)",
              padding: "16px",
            }}
            onClick={closeModal}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "540px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e9e9e5",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
                overflow: "hidden",
                animation: "modalFadeIn .2s ease-out",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 22px",
                  borderBottom: "1px solid #ededeb",
                  background: "#fbfbfa",
                }}
              >
                <div>
                  <span className="eyebrow" style={{ marginBottom: "2px" }}>
                    <span className="eyebrow-line"></span>
                    {editingCategory ? "UPDATE CATEGORY" : "NEW CLASSIFICATION"}
                  </span>
                  <h2 style={{ fontSize: "16px", margin: 0 }}>
                    {editingCategory ? `Edit: ${editingCategory.name}` : "Create new machine category"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="table-action"
                  onClick={closeModal}
                  style={{ border: "none", background: "transparent", fontSize: "18px" }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleModalSubmit} style={{ padding: "22px" }}>
                {formError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      marginBottom: "16px",
                      borderRadius: "5px",
                      background: "#fdf2f2",
                      border: "1px solid #f8b4b4",
                      color: "#991b1b",
                      fontSize: "12px",
                    }}
                  >
                    <i className="bi bi-exclamation-circle" style={{ marginRight: "6px" }}></i>
                    {formError}
                  </div>
                )}

                <div style={{ display: "grid", gap: "16px" }}>
                  <label className="form-field">
                    <span>Category name *</span>
                    <input
                      required
                      autoFocus
                      name="name"
                      placeholder="e.g. Hydraulic forming-1"
                      value={modalFormData.name}
                      onChange={handleModalInputChange}
                    />
                  </label>

                  <label className="form-field">
                    <span>Display order *</span>
                    <input
                      type="number"
                      min="0"
                      required
                      name="order"
                      placeholder="e.g. 1"
                      value={modalFormData.order}
                      onChange={handleModalInputChange}
                    />
                  </label>

                  <label className="form-field">
                    <span>Description</span>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Describe the machine category and capabilities..."
                      value={modalFormData.description}
                      onChange={handleModalInputChange}
                    ></textarea>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "22px",
                    paddingTop: "16px",
                    borderTop: "1px solid #eeeeeb",
                  }}
                >
                  <button
                    type="button"
                    className="btn-subtle"
                    onClick={closeModal}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }}></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg"></i>
                        {editingCategory ? "Update category" : "Create category"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {categoryToDelete && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1060,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(17, 18, 16, 0.65)",
              backdropFilter: "blur(4px)",
              padding: "16px",
            }}
            onClick={() => setCategoryToDelete(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "440px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e9e9e5",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
                padding: "24px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#fef2f2",
                  color: "#dc2626",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "20px",
                  marginBottom: "16px",
                }}
              >
                <i className="bi bi-trash3"></i>
              </div>

              <h2 style={{ fontSize: "16px", margin: "0 0 8px 0" }}>Delete category?</h2>
              <p style={{ color: "#686962", fontSize: "12px", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                Are you sure you want to delete <strong>{categoryToDelete.name}</strong> ({categoryToDelete.code})?
                This category will no longer appear in the machine configuration dropdowns.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-subtle"
                  onClick={() => setCategoryToDelete(null)}
                  disabled={deleteSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    height: "37px",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0 14px",
                    border: "1px solid #dc2626",
                    borderRadius: "5px",
                    background: "#dc2626",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={confirmDelete}
                  disabled={deleteSubmitting}
                >
                  {deleteSubmitting ? "Deleting..." : "Delete category"}
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Categories;
