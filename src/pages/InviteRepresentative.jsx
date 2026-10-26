import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { usersApi } from "../api/usersApi";

const InviteRepresentative = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    company: "MACHINE Systems Direct Sales",
    role: "representative",
    region: "Europe & UK",
    coverage: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });
    setSubmitting(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        name: fullName || formData.firstName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password || "rep12345",
        phone: formData.phone,
        company: formData.company,
        role: formData.role || "representative",
        territory: formData.region,
        country: formData.region,
        region: formData.region,
        additionalCoverage: formData.coverage,
        isApproved: true,
        approvalStatus: "approved",
      };

      // POST /api/v1/users (Admin invite / create a new representative or team member)
      await usersApi.inviteUser(payload);
      setFeedback({ success: `Account for ${fullName} created successfully!`, error: "" });

      setTimeout(() => {
        navigate("/representatives");
      }, 1200);
    } catch (err) {
      setFeedback({
        error: err.message || "Failed to create representative user account.",
        success: "",
      });
    } finally {
      setSubmitting(false);
    }
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
              Add a sales teammate, set their territory coverage, and provision system access (POST /api/v1/users).
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
                <span>Temporary password</span>
                <input
                  name="password"
                  placeholder="Default: rep12345"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input
                  autoComplete="tel"
                  name="phone"
                  placeholder="+1 555 010 1234"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Role</span>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="representative">Sales representative</option>
                  <option value="admin">Administrator</option>
                  <option value="customer">Customer</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">02 / REGIONAL ASSIGNMENT</span>
                <h2>Coverage &amp; territory</h2>
              </div>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Primary territory</span>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                >
                  <option value="Europe & UK">Europe &amp; UK</option>
                  <option value="North America">North America</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Middle East & Africa">Middle East &amp; Africa</option>
                </select>
              </label>
              <label className="form-field">
                <span>Affiliated company / branch</span>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field form-field-full">
                <span>Additional coverage details</span>
                <input
                  name="coverage"
                  placeholder="e.g. Primary contact for fiber laser and 5-axis aerospace accounts"
                  value={formData.coverage}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <footer className="form-actions">
            <Link className="btn btn-outline" to="/representatives">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit" disabled={submitting}>
              {submitting ? "Inviting..." : "Invite representative"}
            </button>
          </footer>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default InviteRepresentative;
