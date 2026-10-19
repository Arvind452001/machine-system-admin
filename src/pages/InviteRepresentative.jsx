import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const InviteRepresentative = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    region: "",
    coverage: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/representatives");
  };

  const breadcrumb = (
    <>
      <Link to="/representatives">Representatives</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Invite representative</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>REGIONAL SALES TEAM
            </div>
            <h1>Invite representative</h1>
            <p className="welcome-subtitle">
              Add a sales teammate and assign their regional enquiry coverage.
            </p>
          </div>
        </section>

        <form className="form-layout" onSubmit={handleSubmit}>
          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">01 / TEAM MEMBER</span>
                <h2>Representative details</h2>
              </div>
              <span className="required-note">* Required</span>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>First name *</span>
                <input
                  autoComplete="given-name"
                  name="firstName"
                  placeholder="First name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Last name *</span>
                <input
                  autoComplete="family-name"
                  name="lastName"
                  placeholder="Last name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Work email *</span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input
                  autoComplete="tel"
                  name="phone"
                  placeholder="+1 555 010 1234"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Role *</span>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select role</option>
                  <option>Country representative</option>
                  <option>Regional sales manager</option>
                </select>
              </label>
              <label className="form-field">
                <span>Primary region *</span>
                <select
                  name="region"
                  required
                  value={formData.region}
                  onChange={handleChange}
                >
                  <option value="">Select region</option>
                  <option>North America</option>
                  <option>France · Benelux</option>
                  <option>Germany · Austria</option>
                  <option>Greece · Cyprus</option>
                  <option>United Kingdom · Ireland</option>
                  <option>Asia Pacific</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="form-field field-wide">
                <span>Additional coverage</span>
                <input
                  name="coverage"
                  placeholder="Add countries or regions"
                  value={formData.coverage}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>
          <div className="form-actions">
            <Link className="btn-subtle" to="/representatives">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit">
              <i className="bi bi-send"></i> Send invitation
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default InviteRepresentative;
