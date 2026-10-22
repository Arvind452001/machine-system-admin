import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = ({ onToggleSidebar, isSidebarOpen, breadcrumb }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  const initials = user?.initials || (user?.name ? user.name.split(" ").map(n => n[0]).join("") : "JM");
  const displayName = user?.name || "Jordan Miller";
  const displayRole = user?.role || "Administrator";

  return (
    <header className="topbar">
      <button
        aria-controls="sidebar"
        aria-expanded={isSidebarOpen ? "true" : "false"}
        aria-label="Toggle navigation"
        className="icon-button menu-toggle"
        id="menuToggle"
        type="button"
        onClick={onToggleSidebar}
      >
        <i className="bi bi-list"></i>
      </button>

      <div className="breadcrumb-line">
        {breadcrumb}
      </div>

      <div className="topbar-actions">
        <span className="system-status">
          <span className="status-dot"></span>All systems operational
        </span>
        <Link
          className="icon-button notification-button"
          to="/notifications"
          aria-label="Notifications"
        >
          <i className="bi bi-bell"></i>
          <span></span>
        </Link>
        <details className="account-menu">
          <summary aria-label="Open account menu" className="avatar avatar-top">
            {initials}
          </summary>
          <div className="account-dropdown">
            <strong>{displayName}</strong>
            <small>{displayRole}</small>
            <Link to="/profile">My profile</Link>
            <Link to="/settings">Settings</Link>
            <button
              type="button"
              className="account-logout"
              onClick={handleLogout}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "8px 12px",
                color: "#cf3c1b",
                cursor: "pointer",
                font: "inherit",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "4px",
              }}
            >
              Sign out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
};

export default Header;
