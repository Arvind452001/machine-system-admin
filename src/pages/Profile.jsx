import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: "Jordan",
    lastName: "Miller",
    email: "",
    phone: "",
    role: "Administrator",
    timezone: "UTC",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const breadcrumb = (
    <>
      <span>Account</span>
      <i className="bi bi-chevron-right"></i>
      <strong>My profile</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="container-fluid page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>ACCOUNT
            </div>
            <h1>My profile</h1>
            <p className="welcome-subtitle">
              Manage your administrator profile and contact details.
            </p>
          </div>
          <Link className="btn-subtle" to="/settings">
            <i className="bi bi-gear"></i> Settings
          </Link>
        </section>

        <div className="profile-layout">
          <section className="profile-overview">
            <div className="profile-avatar-large">JM</div>
            <h2>Jordan Miller</h2>
            <p>Administrator</p>
            <span className="profile-status">
              <i className="bi bi-circle-fill"></i> Active account
            </span>
            <Link className="text-link" to="/settings">
              Manage workspace settings <i className="bi bi-arrow-right"></i>
            </Link>
          </section>

          <section className="profile-panel">
            <div className="settings-panel-heading">
              <div>
                <span className="settings-icon">
                  <i className="bi bi-person"></i>
                </span>
                <div>
                  <h2>Personal information</h2>
                  <p>Account details used across the admin workspace.</p>
                </div>
              </div>
            </div>
            <div className="settings-fields">
              <label className="form-field">
                <span>First name</span>
                <input
                  autoComplete="given-name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Last name</span>
                <input
                  autoComplete="family-name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Work email</span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="Add work email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Phone number</span>
                <input
                  autoComplete="tel"
                  name="phone"
                  placeholder="Add phone number"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Role</span>
                <input value={profileData.role} readOnly />
              </label>
              <label className="form-field">
                <span>Preferred time zone</span>
                <select
                  name="timezone"
                  value={profileData.timezone}
                  onChange={handleChange}
                >
                  <option>UTC</option>
                  <option>Central European Time</option>
                  <option>Eastern Time</option>
                  <option>Pacific Time</option>
                </select>
              </label>
            </div>
            <div className="profile-panel-footer">
              <span>
                <i className="bi bi-info-circle"></i> Profile changes are not
                connected to an account service.
              </span>
              <button className="btn btn-accent" disabled type="button">
                <i className="bi bi-check-lg"></i> Save profile
              </button>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Profile;
