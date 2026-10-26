import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { usersApi } from "../api/usersApi";
import Pagination from "../components/Pagination";

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
  const [repPage, setRepPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const PAGE_SIZE = 5;

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
          <div className="summary-item" onClick={() => setViewTab("allUsers")} style={{ cursor: "pointer", border: "1px solid #fde68a", background: "#fffbeb" }} title="Click to review pending approvals">
            <span style={{ color: "#b45309", fontWeight: "600" }}><i className="bi bi-clock-history me-1"></i> Pending approvals</span>
            <strong>
              {allUsers.filter((u) => u.role === "representative" && (u.approvalStatus === "pending" || u.isApproved === false)).length}
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
                  {representatives
                    .slice((repPage - 1) * PAGE_SIZE, repPage * PAGE_SIZE)
                    .map((rep) => {
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
                          {rep.isApproved === false || rep.approvalStatus === "pending" ? (
                            <div className="d-flex align-items-center gap-2">
                              <span className="table-status" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                                Pending
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm text-success"
                                onClick={() => handleApprove(rep._id, rep.name || rep.email)}
                                title="Approve representative"
                                style={{ padding: "4px 10px", fontSize: "12px", border: "1px solid #16a34a", color: "#16a34a", background: "#f0fdf4", borderRadius: "4px", fontWeight: "600", cursor: "pointer" }}
                              >
                                <i className="bi bi-check-lg"></i> Approve
                              </button>
                            </div>
                          ) : (
                            <span className="table-status">Approved</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={repPage} totalItems={representatives.length} pageSize={PAGE_SIZE} onPageChange={setRepPage} itemName="representatives" />
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
                    <th>STATUS</th>
                    <th>APPROVAL ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers
                    .slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE)
                    .map((u) => {
                    const isRep = u.role === "representative";
                    const isPendingRep = isRep && (u.isApproved === false || u.approvalStatus === "pending");
                    const isRejectedRep = isRep && u.approvalStatus === "rejected";

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
                          {isRep ? (
                            isPendingRep ? (
                              <span className="table-status" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                                Pending Approval
                              </span>
                            ) : isRejectedRep ? (
                              <span className="table-status status-closed">
                                Rejected
                              </span>
                            ) : (
                              <span className="table-status">
                                Approved
                              </span>
                            )
                          ) : (
                            <span className="table-status" style={{ background: "#edf3ed", color: "#27624c" }}>
                              Active
                            </span>
                          )}
                        </td>
                        <td>
                          {isRep ? (
                            isPendingRep ? (
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline text-success"
                                  onClick={() => handleApprove(u._id, u.name || u.email)}
                                  title="Approve representative"
                                  style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "600", border: "1px solid #16a34a", color: "#16a34a" }}
                                >
                                  <i className="bi bi-check-lg"></i> Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline text-danger"
                                  onClick={() => handleReject(u._id, u.name || u.email)}
                                  title="Reject representative"
                                  style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "600", border: "1px solid #dc2626", color: "#dc2626" }}
                                >
                                  <i className="bi bi-x-lg"></i> Reject
                                </button>
                              </div>
                            ) : isRejectedRep ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline text-success"
                                onClick={() => handleApprove(u._id, u.name || u.email)}
                                title="Re-approve representative"
                                style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "600" }}
                              >
                                <i className="bi bi-arrow-repeat"></i> Re-approve
                              </button>
                            ) : (
                              <span className="cell-sub" style={{ color: "#16a34a", fontWeight: "600" }}>
                                <i className="bi bi-check2-circle me-1"></i>Approved
                              </span>
                            )
                          ) : (
                            <span className="cell-sub" style={{ color: "#85867f" }}>
                              Auto-verified (No approval needed)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={userPage} totalItems={allUsers.length} pageSize={PAGE_SIZE} onPageChange={setUserPage} itemName="users" />
          </section>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Representatives;
