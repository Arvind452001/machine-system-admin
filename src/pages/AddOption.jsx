import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const AddOption = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    machine: "",
    code: "",
    price: "",
    description: "",
    dependency: "",
    status: "Draft",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/options");
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
              Define a selectable feature, its price impact, and any
              compatibility rules.
            </p>
          </div>
        </section>

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
                  placeholder="e.g. Automatic tool changer"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Machine *</span>
                <select
                  name="machine"
                  required
                  value={formData.machine}
                  onChange={handleChange}
                >
                  <option value="">Select machine</option>
                  <option>FX-420 Press</option>
                  <option>CR-80 Cutter</option>
                  <option>MX-220 Mixer</option>
                  <option>All machines</option>
                </select>
              </label>
              <label className="form-field">
                <span>Option code</span>
                <input
                  name="code"
                  placeholder="e.g. FX420-ATC"
                  value={formData.code}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Price adjustment *</span>
                <div className="input-prefix">
                  <span>$</span>
                  <input
                    inputMode="decimal"
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
                <span>Customer description *</span>
                <textarea
                  name="description"
                  placeholder="Explain what this option does for the customer"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </label>
              <label className="form-field">
                <span>Required option</span>
                <select
                  name="dependency"
                  value={formData.dependency}
                  onChange={handleChange}
                >
                  <option value="">No dependency</option>
                  <option>Safety enclosure</option>
                  <option>Duct kit</option>
                  <option>Service plan</option>
                </select>
              </label>
              <label className="form-field">
                <span>Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Draft</option>
                  <option>Active</option>
                </select>
              </label>
            </div>
          </section>
          <div className="form-actions">
            <Link className="btn-subtle" to="/options">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit">
              <i className="bi bi-check-lg"></i> Save option
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default AddOption;
