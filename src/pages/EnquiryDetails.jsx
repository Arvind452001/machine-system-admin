import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const EnquiryDetails = () => {
  const location = useLocation();
  const activeHash = location.hash.replace("#", "") || "amelia";

  const breadcrumb = (
    <>
      <Link to="/enquiries">Enquiries</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Enquiry details</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
      <div className="page-wrap">
        <div className="record-content">
          <div className="eyebrow">
            <span className="eyebrow-line"></span>SALES INBOX
          </div>
          <h1>Enquiry details</h1>
          <p className="welcome-subtitle">
            Customer, machine configuration, estimated value, ownership, and
            follow-up status.
          </p>

          <section className="record-grid" aria-label="Enquiry records">
            <article
              className="record-card enquiry-detail"
              id="amelia"
              style={{ display: activeHash === "amelia" ? "block" : undefined }}
            >
              <div className="record-card-heading">
                <div>
                  <span className="form-kicker">
                    CUSTOMER ENQUIRY · RECEIVED OCT 16, 2026
                  </span>
                  <h2>Amelia Laurent</h2>
                  <p className="enquiry-company">
                    Nordic Materials Co. · France
                  </p>
                </div>
                <span className="table-status status-new">New</span>
              </div>
              <div className="enquiry-detail-layout">
                <figure className="enquiry-machine">
                  <img
                    alt="Industrial hydraulic press"
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=900&amp;q=85"
                  />
                  <figcaption>
                    <span>REQUESTED MACHINE</span>
                    <strong>FX-420 Press</strong>
                    <small>Hydraulic forming · 16 available options</small>
                  </figcaption>
                </figure>
                <div className="enquiry-detail-content">
                  <div className="enquiry-value">
                    <span>ESTIMATED CONFIGURATION</span>
                    <strong>$104,200</strong>
                    <small>6 selected options · Base price $84,500</small>
                  </div>
                  <dl className="record-fields">
                    <div>
                      <dt>Customer</dt>
                      <dd>Amelia Laurent</dd>
                    </div>
                    <div>
                      <dt>Company</dt>
                      <dd>Nordic Materials Co.</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd>France</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>October 16, 2026</dd>
                    </div>
                    <div>
                      <dt>Representative</dt>
                      <dd>Unassigned</dd>
                    </div>
                    <div>
                      <dt>Current stage</dt>
                      <dd>New enquiry</dd>
                    </div>
                  </dl>
                  <div className="enquiry-next-step">
                    <strong>Recommended follow-up</strong>
                    <p>
                      Assign a representative to review the six selected
                      options and confirm the estimated configuration.
                    </p>
                  </div>
                  <Link className="btn btn-accent" to="/representatives">
                    <i className="bi bi-person-plus"></i> Assign representative
                  </Link>
                </div>
              </div>
            </article>

            <article
              className="record-card enquiry-detail"
              id="martin"
              style={{ display: activeHash === "martin" ? "block" : undefined }}
            >
              <div className="record-card-heading">
                <div>
                  <span className="form-kicker">
                    CUSTOMER ENQUIRY · RECEIVED OCT 16, 2026
                  </span>
                  <h2>Martin Keller</h2>
                  <p className="enquiry-company">
                    Keller Anlagenbau · Germany
                  </p>
                </div>
                <span className="table-status status-review">In review</span>
              </div>
              <div className="enquiry-detail-layout">
                <figure className="enquiry-machine">
                  <img
                    alt="Precision industrial cutting equipment"
                    src="https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&amp;fit=crop&amp;w=900&amp;q=85"
                  />
                  <figcaption>
                    <span>REQUESTED MACHINE</span>
                    <strong>CR-80 Cutter</strong>
                    <small>Precision cutting · 12 available options</small>
                  </figcaption>
                </figure>
                <div className="enquiry-detail-content">
                  <div className="enquiry-value">
                    <span>ESTIMATED CONFIGURATION</span>
                    <strong>$71,650</strong>
                    <small>4 selected options · Base price $62,900</small>
                  </div>
                  <dl className="record-fields">
                    <div>
                      <dt>Customer</dt>
                      <dd>Martin Keller</dd>
                    </div>
                    <div>
                      <dt>Company</dt>
                      <dd>Keller Anlagenbau</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd>Germany</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>October 16, 2026</dd>
                    </div>
                    <div>
                      <dt>Representative</dt>
                      <dd>Friedrich Weber</dd>
                    </div>
                    <div>
                      <dt>Current stage</dt>
                      <dd>In review</dd>
                    </div>
                  </dl>
                  <div className="enquiry-next-step">
                    <strong>Recommended follow-up</strong>
                    <p>
                      Review the four selected options with Friedrich Weber and
                      confirm the configuration details.
                    </p>
                  </div>
                  <Link className="btn btn-accent" to="/quotes">
                    <i className="bi bi-file-earmark-text"></i> View quotes
                  </Link>
                </div>
              </div>
            </article>

            <article
              className="record-card enquiry-detail"
              id="sofia"
              style={{ display: activeHash === "sofia" ? "block" : undefined }}
            >
              <div className="record-card-heading">
                <div>
                  <span className="form-kicker">
                    CUSTOMER ENQUIRY · RECEIVED OCT 16, 2026
                  </span>
                  <h2>Sofia Papadakis</h2>
                  <p className="enquiry-company">Aegean Industrial · Greece</p>
                </div>
                <span className="table-status">Assigned</span>
              </div>
              <div className="enquiry-detail-layout">
                <figure className="enquiry-machine">
                  <img
                    alt="Industrial mixing equipment"
                    src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&amp;fit=crop&amp;w=900&amp;q=85"
                  />
                  <figcaption>
                    <span>REQUESTED MACHINE</span>
                    <strong>MX-220 Mixer</strong>
                    <small>Industrial mixing · 9 available options</small>
                  </figcaption>
                </figure>
                <div className="enquiry-detail-content">
                  <div className="enquiry-value">
                    <span>ESTIMATED CONFIGURATION</span>
                    <strong>$55,400</strong>
                    <small>3 selected options · Base price $48,750</small>
                  </div>
                  <dl className="record-fields">
                    <div>
                      <dt>Customer</dt>
                      <dd>Sofia Papadakis</dd>
                    </div>
                    <div>
                      <dt>Company</dt>
                      <dd>Aegean Industrial</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd>Greece</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>October 16, 2026</dd>
                    </div>
                    <div>
                      <dt>Representative</dt>
                      <dd>Elena Markou</dd>
                    </div>
                    <div>
                      <dt>Current stage</dt>
                      <dd>Assigned</dd>
                    </div>
                  </dl>
                  <div className="enquiry-next-step">
                    <strong>Recommended follow-up</strong>
                    <p>
                      Continue the assigned follow-up and prepare a quote for the
                      three selected options.
                    </p>
                  </div>
                  <Link className="btn btn-accent" to="/quotes">
                    <i className="bi bi-file-earmark-text"></i> View quotes
                  </Link>
                </div>
              </div>
            </article>

            <article
              className="record-card enquiry-detail"
              id="james"
              style={{ display: activeHash === "james" ? "block" : undefined }}
            >
              <div className="record-card-heading">
                <div>
                  <span className="form-kicker">
                    CUSTOMER ENQUIRY · RECEIVED OCT 15, 2026
                  </span>
                  <h2>James Thompson</h2>
                  <p className="enquiry-company">
                    Thompson &amp; Sons · United Kingdom
                  </p>
                </div>
                <span className="table-status status-review">In discussion</span>
              </div>
              <div className="enquiry-detail-layout">
                <figure className="enquiry-machine">
                  <img
                    alt="Industrial hydraulic press"
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=900&amp;q=85"
                  />
                  <figcaption>
                    <span>REQUESTED MACHINE</span>
                    <strong>FX-420 Press</strong>
                    <small>Hydraulic forming · 16 available options</small>
                  </figcaption>
                </figure>
                <div className="enquiry-detail-content">
                  <div className="enquiry-value">
                    <span>ESTIMATED CONFIGURATION</span>
                    <strong>$99,100</strong>
                    <small>5 selected options · Base price $84,500</small>
                  </div>
                  <dl className="record-fields">
                    <div>
                      <dt>Customer</dt>
                      <dd>James Thompson</dd>
                    </div>
                    <div>
                      <dt>Company</dt>
                      <dd>Thompson &amp; Sons</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd>United Kingdom</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>October 15, 2026</dd>
                    </div>
                    <div>
                      <dt>Representative</dt>
                      <dd>Oliver Grant</dd>
                    </div>
                    <div>
                      <dt>Current stage</dt>
                      <dd>In discussion</dd>
                    </div>
                  </dl>
                  <div className="enquiry-next-step">
                    <strong>Recommended follow-up</strong>
                    <p>
                      Continue the discussion with Oliver Grant and check the
                      quote status.
                    </p>
                  </div>
                  <Link className="btn btn-accent" to="/quotes">
                    <i className="bi bi-file-earmark-text"></i> View quotes
                  </Link>
                </div>
              </div>
            </article>
          </section>
        </div>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default EnquiryDetails;
