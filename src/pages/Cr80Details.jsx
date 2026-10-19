import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Cr80Details = () => {
  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>CR-80 Cutter</strong>
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
          aria-label="CR-80 Cutter machine details"
          className="machine-detail"
        >
          <div className="machine-detail-media">
            <img
              alt="Precision industrial cutting equipment"
              src="https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&amp;fit=crop&amp;w=1200&amp;q=85"
            />
            <span className="table-status">Published</span>
          </div>
          <article className="machine-detail-copy">
            <div className="machine-detail-heading">
              <div>
                <span className="form-kicker">
                  FW-CR080-02 · PRECISION CUTTING
                </span>
                <h2>CR-80 Cutter</h2>
              </div>
              <span className="machine-detail-price">
                $62,900<small>Base price</small>
              </span>
            </div>
            <p className="machine-detail-description">
              A precision cutting system built for repeatable material
              processing. The CR-80 can be configured with cutting-head
              accessories, safety guarding, and extraction equipment to suit the
              production environment.
            </p>
            <dl className="record-fields">
              <div>
                <dt>Machine code</dt>
                <dd>FW-CR080-02</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>Precision cutting</dd>
              </div>
              <div>
                <dt>Configurable options</dt>
                <dd>12 options</dd>
              </div>
              <div>
                <dt>Catalog status</dt>
                <dd>Published</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>October 10, 2026</dd>
              </div>
              <div>
                <dt>Indicative price</dt>
                <dd>$62,900 USD</dd>
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

export default Cr80Details;
