import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const AddPriceRule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    machine: "",
    type: "",
    option: "",
    amount: "",
    currency: "USD - US Dollar",
    effectiveDate: "",
    status: "Draft",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/pricing");
  };

  const breadcrumb = (
    <>
      <Link to="/pricing">Pricing</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Add price rule</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>PRICE CONFIGURATION
            </div>
            <h1>Add price rule</h1>
            <p className="welcome-subtitle">
              Set a machine base price or an adjustment for a configurable
              option.
            </p>
          </div>
        </section>

        <form className="form-layout" onSubmit={handleSubmit}>
          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">01 / PRICING</span>
                <h2>Rule details</h2>
              </div>
              <span className="required-note">* Required</span>
            </div>
            <div className="form-grid">
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
                  <option>PL-600 Loader</option>
                </select>
              </label>
              <label className="form-field">
                <span>Price type *</span>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select price type</option>
                  <option>Base price</option>
                  <option>Option adjustment</option>
                </select>
              </label>
              <label className="form-field field-wide">
                <span>Option</span>
                <select
                  name="option"
                  value={formData.option}
                  onChange={handleChange}
                >
                  <option value="">Select option (for option adjustment)</option>
                  <option>Automatic tool changer</option>
                  <option>Safety enclosure</option>
                  <option>Dust extraction unit</option>
                  <option>Extended warranty</option>
                </select>
              </label>
              <label className="form-field">
                <span>Amount *</span>
                <div className="input-prefix">
                  <span>$</span>
                  <input
                    inputMode="decimal"
                    name="amount"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
              </label>
              <label className="form-field">
                <span>Currency</span>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                </select>
              </label>
              <label className="form-field">
                <span>Effective date</span>
                <input
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                />
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
            <Link className="btn-subtle" to="/pricing">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit">
              <i className="bi bi-check-lg"></i> Save price rule
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default AddPriceRule;
