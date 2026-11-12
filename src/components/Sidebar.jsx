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
        <a
          className="side-link"
          href="http://localhost:5173/tilt-rotator"
          target="_blank"
          rel="noopener noreferrer"
          title="Open interactive Tilt-Rotator Configurator preview"
        >
          <i className="bi bi-gear-wide-connected text-primary"></i>
          <span>Tilt-Rotator 3D</span>
          <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 6px", background: "#e8f0fe", color: "#1967d2", borderRadius: "4px", fontWeight: 700 }}>PREVIEW</span>
        </a>
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

      <div className="sidebar-bottom" style={{ position: "relative", marginTop: "auto" }}>
        <div ref={menuRef} style={{ position: "relative" }}>
          {/* ChatGPT-style Floating User Popup Menu (opens upward above profile) */}
          {profileMenuOpen && (
            <div
              className="chatgpt-profile-popup"
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                left: 0,
                right: 0,
                width: "100%",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.08)",
                padding: "6px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                animation: "menuPop 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Top User Row (Avatar, Name, Subtitle, Chevron) */}
              <Link
                to="/profile"
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (onClose) onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 10px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                  color: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#2f3e46",
                    color: "#f5e9d7",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "11px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </span>
                <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1e293b",
                      lineHeight: 1.25,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {displayRole}
                  </div>
                </div>
                <i
                  className="bi bi-chevron-right"
                  style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "auto" }}
                ></i>
              </Link>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#f1f5f9",
                  margin: "4px 6px",
                }}
              ></div>

              {/* Profile Link */}
              <Link
                to="/profile"
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (onClose) onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#1e293b",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <i
                  className="bi bi-person"
                  style={{ fontSize: "16px", color: "#475569", flexShrink: 0 }}
                ></i>
                <span>Profile</span>
              </Link>

              {/* Settings Link */}
              <Link
                to="/settings"
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (onClose) onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#1e293b",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <i
                  className="bi bi-gear"
                  style={{ fontSize: "16px", color: "#475569", flexShrink: 0 }}
                ></i>
                <span>Settings</span>
              </Link>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#f1f5f9",
                  margin: "4px 6px",
                }}
              ></div>

              {/* Log out Action (like Image 2) */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#1e293b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <i
                  className="bi bi-box-arrow-right"
                  style={{ fontSize: "16px", color: "#475569", flexShrink: 0 }}
                ></i>
                <span>Log out</span>
              </button>
            </div>
          )}

          {/* Trigger Row at bottom of sidebar */}
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
              padding: "12px 6px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              borderRadius: "8px",
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
