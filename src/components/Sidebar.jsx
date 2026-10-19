import { Link, NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isOverviewActive =
    location.pathname === "/dashboard" ||
    location.pathname === "/dashboard.html";

  const isMachinesActive = [
    "/machines",
    "/machines.html",
    "/add-machine",
    "/add-machine.html",
    "/machine-details",
    "/machine-details.html",
    "/cr80-details",
    "/cr80-details.html",
    "/mx220-details",
    "/mx220-details.html",
    "/pl600-details",
    "/pl600-details.html",
  ].includes(location.pathname);

  const isOptionsActive = [
    "/options",
    "/options.html",
    "/add-option",
    "/add-option.html",
  ].includes(location.pathname);

  const isRenderingsActive = [
    "/renderings",
    "/renderings.html",
    "/upload-rendering",
    "/upload-rendering.html",
  ].includes(location.pathname);

  const isPricingActive = [
    "/pricing",
    "/pricing.html",
    "/add-price-rule",
    "/add-price-rule.html",
  ].includes(location.pathname);

  const isEnquiriesActive = [
    "/enquiries",
    "/enquiries.html",
    "/enquiry-details",
    "/enquiry-details.html",
  ].includes(location.pathname);

  const isQuotesActive = [
    "/quotes",
    "/quotes.html",
    "/quote-details",
    "/quote-details.html",
  ].includes(location.pathname);

  const isRepsActive = [
    "/representatives",
    "/representatives.html",
    "/invite-representative",
    "/invite-representative.html",
  ].includes(location.pathname);

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
          <span className="nav-count">12</span>
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
          <span className="nav-count nav-count-hot">8</span>
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
          <strong>Need a hand?</strong>
          <span>Visit the support center</span>
          <a href="mailto:support@forgeworks.example">
            Get support <i className="bi bi-arrow-up-right"></i>
          </a>
        </div>
        <Link className="profile-link" to="/profile" onClick={onClose}>
          <span className="avatar avatar-admin">JM</span>
          <span className="profile-copy">
            <strong>Jordan Miller</strong>
            <small>Administrator</small>
          </span>
          <i className="bi bi-three-dots"></i>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
