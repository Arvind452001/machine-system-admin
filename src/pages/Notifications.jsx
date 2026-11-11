import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";
import StatSpinner from "../components/StatSpinner";
import { notificationsApi } from "../api/notificationsApi";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    notificationsApi
      .getNotifications()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setNotifications(list);
      })
      .catch((err) => {
        console.warn("Could not load notifications:", err.message);
        if (mounted) setNotifications([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } catch (err) {
      console.warn("Failed to mark all as read:", err.message);
      // Optimistically mark as read on UI
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkSingleRead = async (item) => {
    const id = item._id || item.id;
    if (!id || item.isRead || item.read) return;
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.warn("Could not mark single notification read:", err.message);
    }
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;
  const todayCount = notifications.filter((n) => isToday(n.createdAt)).length;
  const attentionCount = notifications.filter(
    (n) => n.type === "alert" || n.priority === "high" || (!n.isRead && !n.read)
  ).length;

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Notifications</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="container-fluid page-wrap">
        <section className="content-header d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>ACTIVITY CENTER
            </div>
            <h1>Notifications</h1>
            <p className="welcome-subtitle">
              Live customer, quotation, and workflow event stream for your administration workspace.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleMarkAllRead}
                disabled={markingAll}
              >
                <i className="bi bi-check2-all me-1"></i>
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            )}
            <Link className="btn-subtle" to="/settings">
              <i className="bi bi-sliders"></i> Notification settings
            </Link>
          </div>
        </section>

        {/* Live Metrics */}
        <section
          className="notification-summary"
          aria-label="Notification summary"
        >
          <div>
            <span>Unread</span>
            <strong>{loading ? <StatSpinner /> : unreadCount}</strong>
          </div>
          <div>
            <span>Today</span>
            <strong>{loading ? <StatSpinner /> : todayCount}</strong>
          </div>
          <div>
            <span>Needs attention</span>
            <strong>{loading ? <StatSpinner /> : attentionCount}</strong>
          </div>
        </section>

        {/* Main Notifications List */}
        {loading && (
          <div className="p-5 text-center my-4" style={{ background: "#fff", borderRadius: "10px", border: "1px solid #ebe7e1" }}>
            <div className="spinner-border text-secondary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading activity notifications...</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <EmptyState
            icon="bi-bell-slash"
            title="Data is not found"
            message="You have no notifications or activity alerts at this time."
          />
        )}

        {!loading && notifications.length > 0 && (
          <section
            className="notification-panel"
            aria-label="Recent notifications"
          >
            <div className="notification-group-heading">
              <h2>Recent Activity</h2>
              <span>All Workspace Events</span>
            </div>

            {notifications.map((item) => {
              const isUnread = !item.isRead && !item.read;
              const link =
                item.link ||
                (item.enquiryId ? `/enquiry-details/${item.enquiryId}` : "") ||
                (item.quoteId ? `/quote-details/${item.quoteId}` : "") ||
                (item.machineId ? `/machine-details/${item.machineId}` : "") ||
                "#";

              return (
                <Link
                  key={item._id || item.id}
                  className={`notification-row ${isUnread ? "is-unread" : ""}`}
                  to={link}
                  onClick={() => handleMarkSingleRead(item)}
                >
                  <span className={`notification-type notification-type-${item.type || "new"}`}>
                    <i className={`bi ${item.icon || (item.type === "quote" ? "bi-file-earmark-text" : item.type === "review" ? "bi-person-check" : "bi-inbox")}`}></i>
                  </span>
                  <span className="notification-copy">
                    <strong>{item.title || "Workspace Update"}</strong>
                    <span>{item.message || item.text || "No event message details available."}</span>
                    {item.category && <small>{item.category}</small>}
                  </span>
                  <time dateTime={item.createdAt}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </time>
                </Link>
              );
            })}
          </section>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Notifications;
