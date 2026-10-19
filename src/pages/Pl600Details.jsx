import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Pl600Details = () => {
  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>PL-600 Loader</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATOR CATALOG
            </div>
            <h1>Machine details</h1>
            <p className="welcome-subtitle">
              Machine specifications and publication status.
            </p>
          </div>
          <Link className="btn-subtle" to="/machines">
            <i className="bi bi-arrow-left"></i> Back to machines
          </Link>
        </section>

        <section
          aria-label="PL-600 Loader machine details"
          className="machine-detail"
        >
          <div className="machine-detail-media">
            <img
              alt="Industrial material handling machinery"
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=1200&amp;q=85"
            />
            <span className="table-status status-draft">Draft</span>
          </div>
          <article className="machine-detail-copy">
            <div className="machine-detail-heading">
              <div>
                <span className="form-kicker">
                  FW-PL600-04 · MATERIAL HANDLING
                </span>
                <h2>PL-600 Loader</h2>
              </div>
              <span className="machine-detail-price">
                $91,200<small>Base price</small>
              </span>
            </div>
            <p className="machine-detail-description">
              A material handling loader currently being prepared for the
              configurator catalog. Its draft setup includes a base machine
              configuration and selectable equipment for production workflows.
            </p>
            <dl className="record-fields">
              <div>
                <dt>Machine code</dt>
                <dd>FW-PL600-04</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>Material handling</dd>
              </div>
              <div>
                <dt>Configurable options</dt>
                <dd>11 options</dd>
              </div>
              <div>
                <dt>Catalog status</dt>
                <dd>Draft</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>October 6, 2026</dd>
              </div>
              <div>
                <dt>Indicative price</dt>
                <dd>$91,200 USD</dd>
              </div>
            </dl>
            <div className="machine-detail-actions">
              <Link className="btn btn-accent" to="/options">
                <i className="bi bi-sliders2"></i> View options
              </Link>
              <Link className="btn-subtle" to="/renderings">
                <i className="bi bi-image"></i> View renderings
              </Link>
            </div>
          </article>
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Pl600Details;
