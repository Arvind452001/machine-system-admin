import { Link } from "react-router-dom";

const Header = ({ onToggleSidebar, isSidebarOpen, breadcrumb }) => {
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
            JM
          </summary>
          <div className="account-dropdown">
            <strong>Jordan Miller</strong>
            <small>Administrator</small>
            <Link to="/profile">My profile</Link>
            <Link to="/settings">Settings</Link>
            <Link className="account-logout" to="/login">
              Sign out
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
};

export default Header;
