import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { categoryService } from "../services/categoryService";

const AVAILABLE_ICONS = [
  { value: "bi-gear-wide-connected", label: "Gears & Forming (bi-gear-wide-connected)" },
  { value: "bi-cpu", label: "CPU & Precision (bi-cpu)" },
  { value: "bi-arrow-repeat", label: "Mixing & Rotation (bi-arrow-repeat)" },
  { value: "bi-box-seam", label: "Handling & Packaging (bi-box-seam)" },
  { value: "bi-tools", label: "Tooling & Additive (bi-tools)" },
  { value: "bi-lightning-charge", label: "Power & Electrical (bi-lightning-charge)" },
  { value: "bi-wrench-adjustable", label: "Maintenance & Assembly (bi-wrench-adjustable)" },
  { value: "bi-motherboard", label: "Electronics & Control (bi-motherboard)" },
  { value: "bi-robot", label: "Robotics & Automation (bi-robot)" },
  { value: "bi-bounding-box-circles", label: "Laser & Optics (bi-bounding-box-circles)" },
];

const AddCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    slug: "",
    icon: "bi-gear-wide-connected",
    description: "",
    displayOrder: 1,
    status: "Active",
  });

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isEditing) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const data = await categoryService.getCategoryById(id);
          setFormData({
            name: data.name || "",
            code: data.code || "",
            slug: data.slug || "",
            icon: data.icon || "bi-gear-wide-connected",
            description: data.description || "",
            displayOrder: data.displayOrder || 1,
            status: data.status || "Active",
          });
        } catch (err) {
          setErrorMessage(err.message || "Failed to load category.");
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name" && !isEditing) {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      if (isEditing) {
        await categoryService.updateCategory(id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      navigate("/categories");
    } catch (err) {
      setErrorMessage(err.message || "An error occurred while saving the category.");
      setSubmitting(false);
    }
  };

  const breadcrumb = (
    <>
      <Link to="/categories">Categories</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>{isEditing ? "Edit category" : "Add category"}</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATOR CATALOG
            </div>
            <h1>{isEditing ? "Edit category" : "Add category"}</h1>
            <p className="welcome-subtitle">
              {isEditing
                ? "Update category metadata, classification codes, and machine associations."
                : "Create a new machinery category to group models dynamically in the configurator."}
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn-subtle" to="/categories">
              <i className="bi bi-arrow-left"></i> Back to categories
            </Link>
          </div>
        </section>

        {errorMessage && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "6px",
              background: "#fdf2f2",
              border: "1px solid #f8b4b4",
              color: "#991b1b",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#85867f" }}>
            <i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite", marginRight: "8px" }}></i>
            Loading category details...
          </div>
        ) : (
          <form className="form-layout" onSubmit={handleSubmit}>
            <section className="form-panel">
              <div className="form-section-heading">
                <div>
                  <span className="form-kicker">01 / CATEGORY CLASSIFICATION</span>
                  <h2>Category information</h2>
                </div>
                <span className="required-note">* Required</span>
              </div>

              <div className="form-grid">
                <label className="form-field">
                  <span>Category name *</span>
                  <input
                    autoComplete="off"
                    name="name"
                    placeholder="e.g. Hydraulic forming"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-field">
                  <span>Classification code *</span>
                  <input
                    autoComplete="off"
                    name="code"
                    placeholder="e.g. HYD-01"
                    required
                    value={formData.code}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-field">
                  <span>URL key / slug</span>
                  <input
                    autoComplete="off"
                    name="slug"
                    placeholder="e.g. hydraulic-forming"
                    value={formData.slug}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-field">
                  <span>Category icon</span>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.value} value={ic.value}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field field-wide">
                  <span>Category description</span>
                  <textarea
                    name="description"
                    placeholder="Detailed description of machines and capabilities in this classification..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </label>

                <label className="form-field">
                  <span>Publication status</span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active (available in Add Machine form)</option>
                    <option value="Draft">Draft (internal staging only)</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Display order priority</span>
                  <input
                    type="number"
                    min="1"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </section>

            <div className="form-actions">
              <Link className="btn-subtle" to="/categories">
                Cancel
              </Link>
              <button className="btn btn-accent" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }}></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i> {isEditing ? "Update category" : "Save category"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default AddCategory;
