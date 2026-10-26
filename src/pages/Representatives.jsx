import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { usersApi } from "../api/usersApi";

const FALLBACK_REPS = [
  {
    _id: "6ad9fc22e39daefd54e568e1",
    name: "Alexander Sterling",
    email: "rep@machinesystems.com",
    role: "representative",
    company: "MACHINE Systems Sales UK & Europe",
    territory: "Europe & UK",
    region: "Europe & UK",
    isApproved: true,
    approvalStatus: "approved",
    openEnquiries: 9,
  },
];

const Representatives = () => {
  const [representatives, setRepresentatives] = useState(FALLBACK_REPS);
  const [allUsers, setAllUsers] = useState([]);
  const [viewTab, setViewTab] = useState("reps"); // 'reps' or 'allUsers'
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const loadData = () => {
    setLoading(true);
    // 1. GET /api/v1/users/representatives
    usersApi
      .getRepresentatives()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setRepresentatives(list);
        }
      })
      .catch((err) => {
        console.warn("Using offline representatives fallback:", err.message);
      });

    // 2. GET /api/v1/users
    usersApi
      .getUsers()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAllUsers(list);
      })
      .catch((err) => {
        console.warn("Could not load all users:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      // PATCH /api/v1/users/{id}/approve
      await usersApi.approveUser(id);
      setFeedback({ success: `Account for ${name} approved successfully!`, error: "" });
      loadData();
    } catch (err) {
      setFeedback({ error: err.message || "Failed to approve user.", success: "" });
    }
  };

  const handleReject = async (id, name) => {
    const reason = window.prompt(`Enter rejection reason for ${name}:`, "Incomplete documentation");
    if (reason === null) return;

    try {
      // PATCH /api/v1/users/{id}/reject
      await usersApi.rejectUser(id, { reason });
      setFeedback({ success: `Account for ${name} has been rejected.`, error: "" });
      loadData();
    } catch (err) {
      setFeedback({ error: err.message || "Failed to reject user.", success: "" });
    }
  };

  const breadcrumb = (
    <>
      <span>Sales</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Representatives &amp; Users</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>REGIONAL SALES TEAM
            </div>
            <h1>Representatives &amp; Users</h1>
            <p className="welcome-subtitle">
              Manage country coverage, territory performance, user account approvals, and representative applications.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/invite-representative">
              <i className="bi bi-person-plus"></i> Invite representative (POST /users)
            </Link>
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

        <section className="summary-strip">
          <div className="summary-item">
            <span>Sales representatives</span>
            <strong>{representatives.length}</strong>
            <small>Active field team</small>
          </div>
          <div className="summary-item">
            <span>Total registered users</span>
            <strong>{allUsers.length || 8}</strong>
            <small>Customers &amp; staff</small>
          </div>
          <div className="summary-item">
            <span>Pending approvals</span>
            <strong>
              {allUsers.filter((u) => u.approvalStatus === "pending" || u.isApproved === false).length}
            </strong>
            <small>Requires Admin review</small>
          </div>
        </section>

        {/* View Switcher */}
        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn btn-sm ${viewTab === "reps" ? "btn-accent" : "btn-outline"}`}
            onClick={() => setViewTab("reps")}
          >
            <i className="bi bi-geo-alt me-1"></i> Sales Representatives ({representatives.length})
          </button>
          <button
            className={`btn btn-sm ${viewTab === "allUsers" ? "btn-accent" : "btn-outline"}`}
            onClick={() => setViewTab("allUsers")}
          >
            <i className="bi bi-people me-1"></i> All Users &amp; Approvals ({allUsers.length})
          </button>
        </div>

        {viewTab === "reps" ? (
          <section className="table-panel">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>REPRESENTATIVE</th>
                    <th>EMAIL &amp; PHONE</th>
                    <th>TERRITORY / REGION</th>
                    <th>ACTIVE PIPELINE</th>
                    <th>APPROVAL</th>
                  </tr>
                </thead>
                <tbody>
                  {representatives.map((rep) => {
                    const initials = (rep.name || "Rep")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={rep._id || rep.email}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="avatar avatar-coral">{initials}</span>
                            <div>
                              <strong>{rep.name}</strong>
                              <span className="cell-sub">{rep.company || "Direct Representative"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span>{rep.email}</span>
                          <span className="cell-sub">{rep.phone || "No phone registered"}</span>
                        </td>
                        <td>
                          <strong>{rep.territory || rep.region || "Global"}</strong>
                        </td>
                        <td>
                          <span>{rep.openEnquiries || 0} open enquiries</span>
                        </td>
                        <td>
                          <span className="table-status">Approved</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="table-panel">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>ROLE</th>
                    <th>COMPANY &amp; LOCATION</th>
                    <th>APPROVAL STATUS</th>
                    <th>ACTIONS (PATCH /approve /reject)</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => {
                    const isApproved = u.isApproved !== false && u.approvalStatus !== "rejected" && u.approvalStatus !== "pending";

                    return (
                      <tr key={u._id || u.email}>
                        <td>
                          <strong>{u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User"}</strong>
                          <span className="cell-sub">{u.email}</span>
                        </td>
                        <td>
                          <span style={{ textTransform: "capitalize", fontWeight: "600" }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span>{u.company || "Individual"}</span>
                          <span className="cell-sub">{u.country || u.region || "Global"}</span>
                        </td>
                        <td>
                          <span className={`table-status ${isApproved ? "" : "status-draft"}`}>
                            {u.approvalStatus || (isApproved ? "Approved" : "Pending")}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline text-success"
                              onClick={() => handleApprove(u._id, u.name || u.email)}
                              title="Approve user (PATCH /api/v1/users/:id/approve)"
                            >
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline text-danger"
                              onClick={() => handleReject(u._id, u.name || u.email)}
                              title="Reject user (PATCH /api/v1/users/:id/reject)"
                            >
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Representatives;
