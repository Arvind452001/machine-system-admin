import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const MachineDetails = () => {
  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Machine details</strong>
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
          aria-label="FX-420 Press machine details"
          className="machine-detail"
        >
          <div className="machine-detail-media">
            <img
              alt="Industrial press machinery on a factory floor"
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=1200&amp;q=85"
            />
            <span className="table-status">Published</span>
          </div>
          <article className="machine-detail-copy">
            <div className="machine-detail-heading">
              <div>
                <span className="form-kicker">
                  FW-FX420-01 · HYDRAULIC FORMING
                </span>
                <h2>FX-420 Press</h2>
              </div>
              <span className="machine-detail-price">
                $84,500<small>Base price</small>
              </span>
            </div>
            <p className="machine-detail-description">
              A configurable hydraulic forming press designed for repeatable
              production work. The FX-420 supports tooling changes and machine
              guarding options to adapt the setup to different shop-floor
              requirements.
            </p>
            <dl className="record-fields">
              <div>
                <dt>Machine code</dt>
                <dd>FW-FX420-01</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>Hydraulic forming</dd>
              </div>
              <div>
                <dt>Configurable options</dt>
                <dd>16 options</dd>
              </div>
              <div>
                <dt>Catalog status</dt>
                <dd>Published</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>October 12, 2026</dd>
              </div>
              <div>
                <dt>Indicative price</dt>
                <dd>$84,500 USD</dd>
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

export default MachineDetails;
