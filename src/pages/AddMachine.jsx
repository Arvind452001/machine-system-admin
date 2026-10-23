import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { categoryService } from "../services/categoryService";

const AddMachine = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(() => categoryService.getCategoriesSync());
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    category: "",
    price: "",
    description: "",
    status: "Draft",
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch dynamic categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();

    const handleCatsUpdated = () => {
      setCategories(categoryService.getCategoriesSync());
    };

    window.addEventListener("machine-categories-changed", handleCatsUpdated);
    return () => {
      window.removeEventListener("machine-categories-changed", handleCatsUpdated);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/machines");
  };

  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Add machine</strong>
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
            <h1>Add machine</h1>
            <p className="welcome-subtitle">
              Create a machine listing and set its starting configuration.
            </p>
          </div>
        </section>

        <form className="form-layout" onSubmit={handleSubmit}>
          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">01 / MACHINE DETAILS</span>
                <h2>Machine information</h2>
              </div>
              <span className="required-note">* Required</span>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Machine name *</span>
                <input
                  autoComplete="off"
                  name="name"
                  placeholder="e.g. FX-420 Press"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Model code *</span>
                <input
                  autoComplete="off"
                  name="model"
                  placeholder="e.g. FW-FX420-01"
                  required
                  value={formData.model}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Category *</span>
                  <Link
                    to="/add-category"
                    style={{
                      color: "var(--accent)",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                    title="Create new category classification"
                  >
                    + New category
                  </Link>
                </span>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">
                    {loadingCategories ? "Loading categories..." : "Select category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name} {cat.code ? `(${cat.code})` : ""} {cat.status === "Draft" ? "[Draft]" : ""}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="" disabled>
                      No categories available (click + New category above)
                    </option>
                  )}
                </select>
              </label>
              <label className="form-field">
                <span>Base price *</span>
                <div className="input-prefix">
                  <span>$</span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="price"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </label>
              <label className="form-field field-wide">
                <span>Customer description</span>
                <textarea
                  name="description"
                  placeholder="Describe the machine and its primary capabilities"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </label>
              <label className="form-field">
                <span>Machine image</span>
                <input accept="image/*" name="image" type="file" />
              </label>
              <label className="form-field">
                <span>Publication status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </label>
            </div>
          </section>
          <div className="form-actions">
            <Link className="btn-subtle" to="/machines">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit">
              <i className="bi bi-check-lg"></i> Save machine
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default AddMachine;
