import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { categoryService } from "../services/categoryService";
import { enquiriesApi } from "../api/enquiriesApi";
import { machinesApi } from "../api/machinesApi";
import { reviewsApi } from "../api/reviewsApi";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [categoryCount, setCategoryCount] = useState(() => {
    return categoryService.getCategoriesSync().length;
  });
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [machineCount, setMachineCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile popup on route change
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = (e) => {
    e.preventDefault();
    setProfileMenuOpen(false);
    if (onClose) onClose();
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const updateCount = () => {
      setCategoryCount(categoryService.getCategoriesSync().length);
    };

    window.addEventListener("machine-categories-changed", updateCount);

    // Fetch live active enquiries count
    enquiriesApi
      .getEnquiries({ limit: 50 })
      .then((res) => {
        const count =
          res?.count ||
          res?.total ||
          (Array.isArray(res?.data) ? res.data.length : Array.isArray(res) ? res.length : 0);
        setEnquiryCount(count);
      })
      .catch(() => {});

    // Fetch live machines count
    machinesApi
      .getMachines()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMachineCount(list.length);
      })
      .catch(() => {});

    // Fetch live reviews count
    reviewsApi
      .getAllReviews()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setReviewCount(list.length);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("machine-categories-changed", updateCount);
    };
  }, []);

  const initials =
    user?.initials ||
    (user?.name
      ? user.name
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "AD");
  const displayName = user?.name || "Administrator";
  const displayRole = user?.role || "System Admin";

  const currentPath = location.pathname;

  const isOverviewActive = currentPath === "/dashboard";

  const isMachinesActive = [
    "/machines",
    "/add-machine",
    "/machine-details",
    "/cr80-details",
    "/mx220-details",
    "/pl600-details",
  ].includes(currentPath);

  const isCategoriesActive = currentPath === "/categories";

  const isOptionsActive = [
    "/options",
    "/add-option",
  ].includes(currentPath);

  const isRenderingsActive = [
    "/renderings",
    "/upload-rendering",
  ].includes(currentPath);

  const isPricingActive = [
    "/pricing",
    "/add-price-rule",
  ].includes(currentPath);

  const isContentActive = [
    "/legal-content",
    "/content",
  ].includes(currentPath);

  const isReviewsActive = currentPath === "/reviews";

  const isEnquiriesActive = [
    "/enquiries",
    "/enquiry-details",
  ].includes(currentPath);

  const isQuotesActive = [
    "/quotes",
    "/quote-details",
  ].includes(currentPath);

  const isRepsActive = [
    "/representatives",
    "/invite-representative",
  ].includes(currentPath);

  return (
    <aside className={`sidebar ${isOpen ? "is-open" : ""}`} id="sidebar">
      <Link
        aria-label="MACHINE Systems home"
        className="brand"
        to="/dashboard"
        onClick={onClose}
      >
        <span className="brand-icon">
          <i className="bi bi-asterisk"></i>
        </span>
        <span className="brand-type">
          MACHINE<small>SYSTEMS</small>
        </span>
      </Link>

      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        <NavLink
          className={`side-link ${isOverviewActive ? "active" : ""}`}
          to="/dashboard"
          onClick={onClose}
        >
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Overview</span>
        </NavLink>
        <NavLink
          className={`side-link ${isMachinesActive ? "active" : ""}`}
          to="/machines"
          onClick={onClose}
        >
          <i className="bi bi-box-seam"></i>
          <span>Machines</span>
          {machineCount > 0 && <span className="nav-count">{machineCount}</span>}
        </NavLink>
        <NavLink
          className={`side-link ${isCategoriesActive ? "active" : ""}`}
          to="/categories"
          onClick={onClose}
        >
          <i className="bi bi-tags"></i>
          <span>Categories</span>
          {categoryCount > 0 && <span className="nav-count">{categoryCount}</span>}
        </NavLink>
        <NavLink
          className={`side-link ${isOptionsActive ? "active" : ""}`}
          to="/options"
          onClick={onClose}
        >
          <i className="bi bi-sliders2"></i>
          <span>Options &amp; rules</span>
        </NavLink>
        <NavLink
          className={`side-link ${isRenderingsActive ? "active" : ""}`}
          to="/renderings"
          onClick={onClose}
        >
          <i className="bi bi-bounding-box-circles"></i>
          <span>Renderings</span>
        </NavLink>
        <NavLink
          className={`side-link ${isPricingActive ? "active" : ""}`}
          to="/pricing"
          onClick={onClose}
        >
          <i className="bi bi-tag"></i>
          <span>Pricing</span>
        </NavLink>
        <NavLink
          className={`side-link ${isContentActive ? "active" : ""}`}
          to="/legal-content"
          onClick={onClose}
        >
          <i className="bi bi-file-earmark-ruled"></i>
          <span>Legal Content</span>
        </NavLink>
        <NavLink
          className={`side-link ${isReviewsActive ? "active" : ""}`}
          to="/reviews"
          onClick={onClose}
        >
          <i className="bi bi-star"></i>
          <span>Customer Reviews</span>
          {reviewCount > 0 && <span className="nav-count">{reviewCount}</span>}
        </NavLink>
      </nav>

      <div className="sidebar-section-label section-gap">SALES</div>
      <nav className="side-nav" aria-label="Sales navigation">
        <NavLink
          className={`side-link ${isEnquiriesActive ? "active" : ""}`}
          to="/enquiries"
          onClick={onClose}
        >
          <i className="bi bi-inbox"></i>
          <span>Enquiries</span>
          {enquiryCount > 0 && <span className="nav-count nav-count-hot">{enquiryCount}</span>}
        </NavLink>
        <NavLink
          className={`side-link ${isQuotesActive ? "active" : ""}`}
          to="/quotes"
          onClick={onClose}
        >
          <i className="bi bi-file-earmark-text"></i>
          <span>Quotes</span>
        </NavLink>
        <NavLink
          className={`side-link ${isRepsActive ? "active" : ""}`}
          to="/representatives"
          onClick={onClose}
        >
          <i className="bi bi-people"></i>
          <span>Representatives</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <span className="help-icon">
            <i className="bi bi-headset"></i>
          </span>
          <strong>Need assistance?</strong>
          <span>Admin System Support</span>
          <a href="mailto:admin@machinesystems.com">
            Contact support <i className="bi bi-arrow-up-right"></i>
          </a>
        </div>
        <div className="sidebar-profile-menu-wrap" ref={menuRef} style={{ position: "relative" }}>
          {/* Profile Popup Menu */}
          {profileMenuOpen && (
            <div
              className="account-dropdown sidebar-account-dropdown"
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                left: 0,
                width: "100%",
                background: "#ffffff",
                border: "1px solid #e9e9e5",
                borderRadius: "8px",
                padding: "8px",
                boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
                zIndex: 100,
                display: "grid",
              }}
            >
              <strong style={{ padding: "8px 10px 2px", color: "#30312c", fontSize: "12px", fontWeight: "700" }}>
                {displayName}
              </strong>
              <small
                style={{
                  padding: "0 10px 8px",
                  borderBottom: "1px solid #ededeb",
                  color: "#85867f",
                  fontSize: "11px",
                  display: "block",
                }}
              >
                {displayRole}
              </small>
              <Link
                to="/profile"
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (onClose) onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "9px 10px",
                  color: "#475569",
                  fontSize: "12px",
                  textDecoration: "none",
                  borderRadius: "4px",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                My profile
              </Link>
              <Link
                to="/settings"
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (onClose) onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "9px 10px",
                  color: "#475569",
                  fontSize: "12px",
                  textDecoration: "none",
                  borderRadius: "4px",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid #ededeb",
                  marginTop: "4px",
                  padding: "9px 10px 4px",
                  color: "var(--accent, #c94f2d)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Sign out
              </button>
            </div>
          )}

          {/* Trigger Row */}
          <button
            type="button"
            className="profile-link"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-expanded={profileMenuOpen}
            aria-label="Toggle user account menu"
            style={{
              width: "100%",
              background: profileMenuOpen ? "#222320" : "transparent",
              border: "none",
              borderTop: "1px solid #2b2c29",
              padding: "13px 8px 6px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              borderRadius: "4px",
              textAlign: "left",
              color: "inherit",
              transition: "background 0.15s ease",
            }}
          >
            <span className="avatar avatar-admin">{initials}</span>
            <span className="profile-copy">
              <strong>{displayName}</strong>
              <small>{displayRole}</small>
            </span>
            <i
              className="bi bi-three-dots"
              style={{
                marginLeft: "auto",
                color: profileMenuOpen ? "#ffffff" : "#8c8d86",
                fontSize: "16px",
              }}
            ></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
