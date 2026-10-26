import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || "System Administrator",
    company: user?.company || "MACHINE Systems Headquarters",
    email: user?.email || "admin@machinesystems.com",
    phone: user?.phone || "+1 (555) 019-2831",
    country: user?.country || user?.territory || "United States",
    role: user?.role || "admin",
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  useEffect(() => {
    // GET /api/v1/auth/me
    authApi
      .getMe()
      .then((res) => {
        const u = res?.user || res?.data?.user || res?.data;
        if (u) {
          setProfileData({
            name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Administrator",
            company: u.company || "MACHINE Systems Headquarters",
            email: u.email || "",
            phone: u.phone || "",
            country: u.country || u.territory || "United States",
            role: u.role || "admin",
          });
        }
      })
      .catch((err) => {
        console.warn("Could not sync getMe in Profile:", err.message);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ error: "", success: "" });

    try {
      // PUT /api/v1/auth/update-profile
      const res = await updateProfile({
        name: profileData.name.trim(),
        company: profileData.company.trim(),
        phone: profileData.phone.trim(),
        country: profileData.country.trim(),
      });

      if (res?.success) {
        setFeedback({ success: "Admin profile updated successfully (PUT /auth/update-profile)!", error: "" });
      } else {
        setFeedback({ error: res?.message || "Failed to update profile.", success: "" });
      }
    } catch (err) {
      setFeedback({ error: err.message || "Failed to update profile.", success: "" });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = (
    <>
      <span>Account</span>
      <i className="bi bi-chevron-right"></i>
      <strong>My profile</strong>
    </>
  );

  const initials = (profileData.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="container-fluid page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>ACCOUNT &amp; IDENTITY
            </div>
            <h1>My profile</h1>
            <p className="welcome-subtitle">
              Manage your administrator profile, credentials, and synchronized contact details.
            </p>
          </div>
          <Link className="btn-subtle" to="/settings">
            <i className="bi bi-gear"></i> Settings
          </Link>
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

        <div className="profile-layout">
          <section className="profile-overview">
            <div className="profile-avatar-large">{initials}</div>
            <h2>{profileData.name}</h2>
            <p style={{ textTransform: "capitalize" }}>{profileData.role}</p>
            <span className="profile-status">
              <i className="bi bi-circle-fill"></i> Active backend session
            </span>
            <Link className="text-link" to="/settings">
              Manage workspace settings <i className="bi bi-arrow-right"></i>
            </Link>
          </section>

          <section className="profile-panel">
            <form onSubmit={handleSaveProfile}>
              <div className="settings-panel-heading">
                <div>
                  <span className="settings-icon">
                    <i className="bi bi-person"></i>
                  </span>
                  <div>
                    <h2>Personal &amp; Company details</h2>
                    <p>Live account information updated across quotes, machine entries, and assignment records.</p>
                  </div>
                </div>
              </div>
              <div className="settings-fields">
                <label className="form-field">
                  <span>Full name *</span>
                  <input
                    name="name"
                    required
                    value={profileData.name}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-field">
                  <span>Company name</span>
                  <input
                    name="company"
                    value={profileData.company}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-field">
                  <span>Work email (read only)</span>
                  <input
                    autoComplete="email"
                    name="email"
                    type="email"
                    readOnly
                    value={profileData.email}
                    style={{ background: "rgba(0,0,0,0.03)" }}
                  />
                </label>
                <label className="form-field">
                  <span>Phone number</span>
                  <input
                    autoComplete="tel"
                    name="phone"
                    placeholder="+1 555 019 2831"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-field">
                  <span>Country / Territory</span>
                  <input
                    name="country"
                    placeholder="United States"
                    value={profileData.country}
                    onChange={handleChange}
                  />
                </label>
                <label className="form-field">
                  <span>Role</span>
                  <input value={profileData.role} readOnly style={{ background: "rgba(0,0,0,0.03)", textTransform: "capitalize" }} />
                </label>
              </div>
              <div className="profile-panel-footer">
                <span>
                  <i className="bi bi-cloud-check text-success me-1"></i> Profile up to date
                </span>
                <button className="btn btn-accent" type="submit" disabled={saving}>
                  <i className="bi bi-check-lg"></i> {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Profile;
