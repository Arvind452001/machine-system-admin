import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const NotFound = () => {
  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Page not found</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>ERROR 404
            </div>
            <h1>Page not found</h1>
            <p className="welcome-subtitle">
              The page you requested could not be located in the configurator
              workspace.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/dashboard">
              <i className="bi bi-house"></i> Return to dashboard
            </Link>
          </div>
        </section>

        <section className="form-panel" style={{ textAlign: "center", padding: "64px 24px" }}>
          <i
            className="bi bi-exclamation-octagon"
            style={{ fontSize: "48px", color: "var(--accent)", display: "block", marginBottom: "16px" }}
          ></i>
          <h2>404 - Page Not Found</h2>
          <p style={{ maxWidth: "480px", margin: "12px auto 24px", color: "var(--muted)" }}>
            The requested URL does not match any existing admin page. Check the
            URL or return to your overview dashboard.
          </p>
          <Link className="btn btn-accent" to="/dashboard">
            Back to overview
          </Link>
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default NotFound;
