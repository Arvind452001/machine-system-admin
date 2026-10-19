import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Mx220Details = () => {
  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>MX-220 Mixer</strong>
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
          aria-label="MX-220 Mixer machine details"
          className="machine-detail"
        >
          <div className="machine-detail-media">
            <img
              alt="Engineer working with industrial mixing equipment"
              src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&amp;fit=crop&amp;w=1200&amp;q=85"
            />
            <span className="table-status">Published</span>
          </div>
          <article className="machine-detail-copy">
            <div className="machine-detail-heading">
              <div>
                <span className="form-kicker">
                  FW-MX220-03 · INDUSTRIAL MIXING
                </span>
                <h2>MX-220 Mixer</h2>
              </div>
              <span className="machine-detail-price">
                $48,750<small>Base price</small>
              </span>
            </div>
            <p className="machine-detail-description">
              An industrial mixer configured around a durable vessel and drive
              assembly. The MX-220 supports production setups that need
              dependable batch mixing and a choice of machine accessories.
            </p>
            <dl className="record-fields">
              <div>
                <dt>Machine code</dt>
                <dd>FW-MX220-03</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>Industrial mixing</dd>
              </div>
              <div>
                <dt>Configurable options</dt>
                <dd>9 options</dd>
              </div>
              <div>
                <dt>Catalog status</dt>
                <dd>Published</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>October 8, 2026</dd>
              </div>
              <div>
                <dt>Indicative price</dt>
                <dd>$48,750 USD</dd>
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

export default Mx220Details;
