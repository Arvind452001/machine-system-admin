import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    enquiries: true,
    quoteActivity: true,
    repAssignments: true,
    catalogReminders: true,
  });

  const [regionalDefaults, setRegionalDefaults] = useState({
    region: "Europe",
    currency: "USD - US Dollar",
    timezone: "UTC",
  });

  const [workspaceDefaults, setWorkspaceDefaults] = useState({
    dateFormat: "Month day, year",
    landingPage: "Overview",
  });

  const handleCheckboxChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Settings</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="container-fluid page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>WORKSPACE PREFERENCES
            </div>
            <h1>Settings</h1>
            <p className="welcome-subtitle">
              Manage notification delivery, regional defaults, and workspace
              preferences.
            </p>
          </div>
        </section>

        <div className="settings-layout">
          <section className="settings-panel">
            <div className="settings-panel-heading">
              <div>
                <span className="settings-icon">
                  <i className="bi bi-bell"></i>
                </span>
                <div>
                  <h2>Notifications</h2>
                  <p>Choose which updates appear in your workspace.</p>
                </div>
              </div>
            </div>
            <div className="settings-option">
              <span>
                <strong>New customer enquiries</strong>
                <small>When a customer submits a machine configuration</small>
              </span>
              <input
                aria-label="Notify me about new customer enquiries"
                type="checkbox"
                checked={notifications.enquiries}
                onChange={() => handleCheckboxChange("enquiries")}
              />
            </div>
            <div className="settings-option">
              <span>
                <strong>Quote activity</strong>
                <small>When a quote is sent, accepted, or expires</small>
              </span>
              <input
                aria-label="Notify me about quote activity"
                type="checkbox"
                checked={notifications.quoteActivity}
                onChange={() => handleCheckboxChange("quoteActivity")}
              />
            </div>
            <div className="settings-option">
              <span>
                <strong>Representative assignments</strong>
                <small>
                  When an enquiry is assigned to a sales representative
                </small>
              </span>
              <input
                aria-label="Notify me about representative assignments"
                type="checkbox"
                checked={notifications.repAssignments}
                onChange={() => handleCheckboxChange("repAssignments")}
              />
            </div>
            <div className="settings-option">
              <span>
                <strong>Catalog review reminders</strong>
                <small>
                  When a machine image or configuration needs review
                </small>
              </span>
              <input
                aria-label="Notify me about catalog review reminders"
                type="checkbox"
                checked={notifications.catalogReminders}
                onChange={() => handleCheckboxChange("catalogReminders")}
              />
            </div>
          </section>

          <section className="settings-panel">
            <div className="settings-panel-heading">
              <div>
                <span className="settings-icon settings-icon-green">
                  <i className="bi bi-globe2"></i>
                </span>
                <div>
                  <h2>Regional defaults</h2>
                  <p>Default values used when reviewing customer enquiries.</p>
                </div>
              </div>
            </div>
            <div className="settings-fields">
              <label className="form-field">
                <span>Default region</span>
                <select
                  value={regionalDefaults.region}
                  onChange={(e) =>
                    setRegionalDefaults((prev) => ({
                      ...prev,
                      region: e.target.value,
                    }))
                  }
                >
                  <option>Europe</option>
                  <option>North America</option>
                  <option>Asia Pacific</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="form-field">
                <span>Default currency</span>
                <select
                  value={regionalDefaults.currency}
                  onChange={(e) =>
                    setRegionalDefaults((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                >
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                </select>
              </label>
              <label className="form-field">
                <span>Time zone</span>
                <select
                  value={regionalDefaults.timezone}
                  onChange={(e) =>
                    setRegionalDefaults((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                >
                  <option>UTC</option>
                  <option>Central European Time</option>
                  <option>Eastern Time</option>
                  <option>Pacific Time</option>
                </select>
              </label>
            </div>
          </section>

          <section className="settings-panel">
            <div className="settings-panel-heading">
              <div>
                <span className="settings-icon settings-icon-blue">
                  <i className="bi bi-display"></i>
                </span>
                <div>
                  <h2>Workspace</h2>
                  <p>Display preferences for the admin workspace.</p>
                </div>
              </div>
            </div>
            <div className="settings-fields">
              <label className="form-field">
                <span>Date format</span>
                <select
                  value={workspaceDefaults.dateFormat}
                  onChange={(e) =>
                    setWorkspaceDefaults((prev) => ({
                      ...prev,
                      dateFormat: e.target.value,
                    }))
                  }
                >
                  <option>Month day, year</option>
                  <option>Day month, year</option>
                  <option>Year-month-day</option>
                </select>
              </label>
              <label className="form-field">
                <span>Default landing page</span>
                <select
                  value={workspaceDefaults.landingPage}
                  onChange={(e) =>
                    setWorkspaceDefaults((prev) => ({
                      ...prev,
                      landingPage: e.target.value,
                    }))
                  }
                >
                  <option>Overview</option>
                  <option>Enquiries</option>
                  <option>Machines</option>
                  <option>Quotes</option>
                </select>
              </label>
            </div>
          </section>

          <div className="settings-actions">
            <span>
              <i className="bi bi-info-circle"></i> Saving is unavailable until
              workspace storage is connected.
            </span>
            <button className="btn btn-accent" disabled type="button">
              <i className="bi bi-check-lg"></i> Save changes
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Settings;
