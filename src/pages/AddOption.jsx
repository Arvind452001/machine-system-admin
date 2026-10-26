import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { optionsApi } from "../api/optionsApi";
import { machinesApi } from "../api/machinesApi";

const AddOption = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "general",
    priceDelta: "",
    description: "",
    machineId: "",
    status: "active",
  });

  useEffect(() => {
    machinesApi
      .getMachines()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMachines(list);
      })
      .catch((err) => {
        console.warn("Could not load machines in AddOption:", err.message);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });
    setSubmitting(true);

    try {
      // POST /api/v1/options (Admin only)
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        priceDelta: Number(formData.priceDelta) || 0,
        description: formData.description.trim(),
        machine: formData.machineId || null,
        status: formData.status,
        isActive: formData.status === "active",
      };

      await optionsApi.createOption(payload);
      setFeedback({ success: "Option successfully created and added to catalog!", error: "" });

      setTimeout(() => {
        navigate("/options");
      }, 1200);
    } catch (err) {
      setFeedback({
        error: err.message || "Failed to create option. Please check the code and name fields.",
        success: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumb = (
    <>
      <Link to="/options">Options &amp; rules</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Add option</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATION LOGIC
            </div>
            <h1>Add option</h1>
            <p className="welcome-subtitle">
              Define a selectable feature, its price impact, and compatibility rules in the live catalog.
            </p>
          </div>
        </section>

        {feedback.error && (
          <div className="alert alert-danger mb-3" style={{ background: "#fde8e8", color: "#9b1c1c", padding: "12px 16px", borderRadius: "6px" }}>
            <i className="bi bi-exclamation-triangle me-2"></i> {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="alert alert-success mb-3" style={{ background: "#def7ec", color: "#03543f", padding: "12px 16px", borderRadius: "6px" }}>
            <i className="bi bi-check-circle me-2"></i> {feedback.success}
          </div>
        )}

        <form className="form-layout" onSubmit={handleSubmit}>
          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">01 / OPTION SETUP</span>
                <h2>Option details</h2>
              </div>
              <span className="required-note">* Required</span>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Option name *</span>
                <input
                  name="name"
                  placeholder="e.g. Ultra-High Pressure Through-Spindle Coolant"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Option code *</span>
                <input
                  name="code"
                  placeholder="e.g. OPT-COOL-90B"
                  required
                  value={formData.code}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Category *</span>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="cooling">Cooling &amp; Fluid</option>
                  <option value="automation">Automation &amp; Robotics</option>
                  <option value="tooling">Tooling &amp; Probing</option>
                  <option value="enclosure">Enclosure &amp; Extraction</option>
                  <option value="service">Service &amp; Warranty</option>
                </select>
              </label>
              <label className="form-field">
                <span>Target Machine (Optional)</span>
                <select
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleChange}
                >
                  <option value="">Universal / All Machines</option>
                  {machines.map((m) => (
                    <option key={m._id || m.slug} value={m._id || m.slug}>
                      {m.name} ({m.sku || m.slug})
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Price adjustment (USD) *</span>
                <div className="input-prefix">
                  <span>$</span>
                  <input
                    aria-label="Price adjustment in dollars"
                    inputMode="numeric"
                    name="priceDelta"
                    placeholder="e.g. 8500"
                    required
                    type="number"
                    value={formData.priceDelta}
                    onChange={handleChange}
                  />
                </div>
              </label>
              <label className="form-field">
                <span>Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">02 / TECHNICAL DESCRIPTION</span>
                <h2>Customer description</h2>
              </div>
            </div>
            <div className="form-grid">
              <label className="form-field form-field-full">
                <span>Description &amp; Specifications</span>
                <textarea
                  name="description"
                  placeholder="Explain benefits, technical specs, pressure ratings, or cycle time impact..."
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <footer className="form-actions">
            <Link className="btn btn-outline" to="/options">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                "Save option"
              )}
            </button>
          </footer>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default AddOption;
