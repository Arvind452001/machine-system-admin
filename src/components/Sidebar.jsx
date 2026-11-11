import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { categoryService } from "../services/categoryService";
import { enquiriesApi } from "../api/enquiriesApi";
import { machinesApi } from "../api/machinesApi";
import { reviewsApi } from "../api/reviewsApi";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [categoryCount, setCategoryCount] = useState(() => {
    return categoryService.getCategoriesSync().length;
  });
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [machineCount, setMachineCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

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
        <Link className="profile-link" to="/profile" onClick={onClose}>
          <span className="avatar avatar-admin">{initials}</span>
          <span className="profile-copy">
            <strong>{displayName}</strong>
            <small>{displayRole}</small>
          </span>
          <i className="bi bi-three-dots"></i>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
