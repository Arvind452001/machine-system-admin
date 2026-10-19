import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const QuoteDetails = () => {
  const location = useLocation();
  const activeHash = location.hash.replace("#", "") || "q2053";

  const breadcrumb = (
    <>
      <Link to="/quotes">Quotes</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Quote details</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
      <div className="page-wrap">
        <div className="record-content">
          <div className="eyebrow">
            <span className="eyebrow-line"></span>QUOTATION WORKSPACE
          </div>
          <h1>Quote details</h1>
          <p className="welcome-subtitle">Customer quotation preview.</p>

          <section className="record-grid" aria-label="Quote records">
            <article
              className="record-card quote-sheet"
              id="q2053"
              style={{ display: activeHash === "q2053" ? "block" : undefined }}
            >
              <header className="quote-sheet-header">
                <Link
                  aria-label="Machine Systems home"
                  className="quote-brand"
                  to="/dashboard"
                >
                  <span className="brand-icon">
                    <i className="bi bi-asterisk"></i>
                  </span>
                  <span className="brand-type">
                    MACHINE<small>SYSTEMS</small>
                  </span>
                </Link>
                <div className="quote-reference">
                  <span>QUOTATION</span>
                  <strong>Q-2053</strong>
                  <small>Valid until November 14, 2026</small>
                </div>
              </header>
              <div className="quote-sheet-rule"></div>
              <div className="quote-sheet-parties">
                <section>
                  <span className="quote-sheet-label">PREPARED FOR</span>
                  <strong>Amelia Laurent</strong>
                  <p>Nordic Materials Co.</p>
                  <p>France</p>
                </section>
                <section>
                  <span className="quote-sheet-label">QUOTE DETAILS</span>
                  <dl>
                    <div>
                      <dt>Representative</dt>
                      <dd>Camille Moreau</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>In preparation</dd>
                    </div>
                    <div>
                      <dt>Valid until</dt>
                      <dd>November 14, 2026</dd>
                    </div>
                  </dl>
                </section>
              </div>
              <section className="quote-product-summary">
                <img
                  alt="FX-420 hydraulic press"
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=600&amp;q=85"
                />
                <div>
                  <span className="quote-sheet-label">CONFIGURED MACHINE</span>
                  <h2>FX-420 Press</h2>
                  <p>Hydraulic forming · 6 selected options</p>
                </div>
                <Link className="quote-product-link" to="/machine-details">
                  View machine <i className="bi bi-arrow-up-right"></i>
                </Link>
              </section>
              <table className="quote-line-table">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th>DETAIL</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>FX-420 Press</strong>
                      <small>Machine base price</small>
                    </td>
                    <td>1 machine</td>
                    <td>$84,500</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Selected configuration</strong>
                      <small>Options and adjustments</small>
                    </td>
                    <td>6 options</td>
                    <td>$28,300</td>
                  </tr>
                </tbody>
              </table>
              <div className="quote-sheet-totals">
                <div>
                  <span>Machine base</span>
                  <strong>$84,500</strong>
                </div>
                <div>
                  <span>Configuration</span>
                  <strong>$28,300</strong>
                </div>
                <div className="quote-sheet-grand-total">
                  <span>TOTAL CONFIGURATION</span>
                  <strong>$112,800</strong>
                </div>
              </div>
              <footer className="quote-sheet-footer">
                <div>
                  <strong>Quotation status</strong>
                  <p>
                    In preparation · Review and send to the customer before the
                    validity date.
                  </p>
                </div>
                <Link className="btn-subtle" to="/enquiries">
                  <i className="bi bi-inbox"></i> Customer enquiry
                </Link>
              </footer>
            </article>

            <article
              className="record-card quote-sheet"
              id="q2048"
              style={{ display: activeHash === "q2048" ? "block" : undefined }}
            >
              <header className="quote-sheet-header">
                <Link
                  aria-label="Machine Systems home"
                  className="quote-brand"
                  to="/dashboard"
                >
                  <span className="brand-icon">
                    <i className="bi bi-asterisk"></i>
                  </span>
                  <span className="brand-type">
                    MACHINE<small>SYSTEMS</small>
                  </span>
                </Link>
                <div className="quote-reference">
                  <span>QUOTATION</span>
                  <strong>Q-2048</strong>
                  <small>Valid until November 2, 2026</small>
                </div>
              </header>
              <div className="quote-sheet-rule"></div>
              <div className="quote-sheet-parties">
                <section>
                  <span className="quote-sheet-label">PREPARED FOR</span>
                  <strong>Martin Keller</strong>
                  <p>Keller Anlagenbau</p>
                  <p>Germany</p>
                </section>
                <section>
                  <span className="quote-sheet-label">QUOTE DETAILS</span>
                  <dl>
                    <div>
                      <dt>Representative</dt>
                      <dd>Friedrich Weber</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>Sent</dd>
                    </div>
                    <div>
                      <dt>Valid until</dt>
                      <dd>November 2, 2026</dd>
                    </div>
                  </dl>
                </section>
              </div>
              <section className="quote-product-summary">
                <img
                  alt="CR-80 precision cutter"
                  src="https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&amp;fit=crop&amp;w=600&amp;q=85"
                />
                <div>
                  <span className="quote-sheet-label">CONFIGURED MACHINE</span>
                  <h2>CR-80 Cutter</h2>
                  <p>Precision cutting · 4 selected options</p>
                </div>
                <Link className="quote-product-link" to="/cr80-details">
                  View machine <i className="bi bi-arrow-up-right"></i>
                </Link>
              </section>
              <table className="quote-line-table">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th>DETAIL</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>CR-80 Cutter</strong>
                      <small>Machine base price</small>
                    </td>
                    <td>1 machine</td>
                    <td>$62,900</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Selected configuration</strong>
                      <small>Options and adjustments</small>
                    </td>
                    <td>4 options</td>
                    <td>$13,500</td>
                  </tr>
                </tbody>
              </table>
              <div className="quote-sheet-totals">
                <div>
                  <span>Machine base</span>
                  <strong>$62,900</strong>
                </div>
                <div>
                  <span>Configuration</span>
                  <strong>$13,500</strong>
                </div>
                <div className="quote-sheet-grand-total">
                  <span>TOTAL CONFIGURATION</span>
                  <strong>$76,400</strong>
                </div>
              </div>
              <footer className="quote-sheet-footer">
                <div>
                  <strong>Quotation status</strong>
                  <p>
                    Sent · Follow up with the customer before the validity date.
                  </p>
                </div>
                <Link className="btn-subtle" to="/enquiries">
                  <i className="bi bi-inbox"></i> Customer enquiry
                </Link>
              </footer>
            </article>

            <article
              className="record-card quote-sheet"
              id="q2044"
              style={{ display: activeHash === "q2044" ? "block" : undefined }}
            >
              <header className="quote-sheet-header">
                <Link
                  aria-label="Machine Systems home"
                  className="quote-brand"
                  to="/dashboard"
                >
                  <span className="brand-icon">
                    <i className="bi bi-asterisk"></i>
                  </span>
                  <span className="brand-type">
                    MACHINE<small>SYSTEMS</small>
                  </span>
                </Link>
                <div className="quote-reference">
                  <span>QUOTATION</span>
                  <strong>Q-2044</strong>
                  <small>Valid until October 28, 2026</small>
                </div>
              </header>
              <div className="quote-sheet-rule"></div>
              <div className="quote-sheet-parties">
                <section>
                  <span className="quote-sheet-label">PREPARED FOR</span>
                  <strong>Sofia Papadakis</strong>
                  <p>Aegean Industrial</p>
                  <p>Greece</p>
                </section>
                <section>
                  <span className="quote-sheet-label">QUOTE DETAILS</span>
                  <dl>
                    <div>
                      <dt>Representative</dt>
                      <dd>Elena Markou</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>Accepted</dd>
                    </div>
                    <div>
                      <dt>Valid until</dt>
                      <dd>October 28, 2026</dd>
                    </div>
                  </dl>
                </section>
              </div>
              <section className="quote-product-summary">
                <img
                  alt="MX-220 industrial mixer"
                  src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&amp;fit=crop&amp;w=600&amp;q=85"
                />
                <div>
                  <span className="quote-sheet-label">CONFIGURED MACHINE</span>
                  <h2>MX-220 Mixer</h2>
                  <p>Industrial mixing · 3 selected options</p>
                </div>
                <Link className="quote-product-link" to="/mx220-details">
                  View machine <i className="bi bi-arrow-up-right"></i>
                </Link>
              </section>
              <table className="quote-line-table">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th>DETAIL</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>MX-220 Mixer</strong>
                      <small>Machine base price</small>
                    </td>
                    <td>1 machine</td>
                    <td>$48,750</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Selected configuration</strong>
                      <small>Options and adjustments</small>
                    </td>
                    <td>3 options</td>
                    <td>$10,500</td>
                  </tr>
                </tbody>
              </table>
              <div className="quote-sheet-totals">
                <div>
                  <span>Machine base</span>
                  <strong>$48,750</strong>
                </div>
                <div>
                  <span>Configuration</span>
                  <strong>$10,500</strong>
                </div>
                <div className="quote-sheet-grand-total">
                  <span>TOTAL CONFIGURATION</span>
                  <strong>$59,250</strong>
                </div>
              </div>
              <footer className="quote-sheet-footer">
                <div>
                  <strong>Quotation status</strong>
                  <p>
                    Accepted · Coordinate the customer handoff with the
                    representative.
                  </p>
                </div>
                <Link className="btn-subtle" to="/enquiries">
                  <i className="bi bi-inbox"></i> Customer enquiry
                </Link>
              </footer>
            </article>

            <article
              className="record-card quote-sheet"
              id="q2039"
              style={{ display: activeHash === "q2039" ? "block" : undefined }}
            >
              <header className="quote-sheet-header">
                <Link
                  aria-label="Machine Systems home"
                  className="quote-brand"
                  to="/dashboard"
                >
                  <span className="brand-icon">
                    <i className="bi bi-asterisk"></i>
                  </span>
                  <span className="brand-type">
                    MACHINE<small>SYSTEMS</small>
                  </span>
                </Link>
                <div className="quote-reference">
                  <span>QUOTATION</span>
                  <strong>Q-2039</strong>
                  <small>Expired October 21, 2026</small>
                </div>
              </header>
              <div className="quote-sheet-rule"></div>
              <div className="quote-sheet-parties">
                <section>
                  <span className="quote-sheet-label">PREPARED FOR</span>
                  <strong>James Thompson</strong>
                  <p>Thompson &amp; Sons</p>
                  <p>United Kingdom</p>
                </section>
                <section>
                  <span className="quote-sheet-label">QUOTE DETAILS</span>
                  <dl>
                    <div>
                      <dt>Representative</dt>
                      <dd>Oliver Grant</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>Expired</dd>
                    </div>
                    <div>
                      <dt>Valid until</dt>
                      <dd>October 21, 2026</dd>
                    </div>
                  </dl>
                </section>
              </div>
              <section className="quote-product-summary">
                <img
                  alt="FX-420 hydraulic press"
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=600&amp;q=85"
                />
                <div>
                  <span className="quote-sheet-label">CONFIGURED MACHINE</span>
                  <h2>FX-420 Press</h2>
                  <p>Hydraulic forming · 5 selected options</p>
                </div>
                <Link className="quote-product-link" to="/machine-details">
                  View machine <i className="bi bi-arrow-up-right"></i>
                </Link>
              </section>
              <table className="quote-line-table">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th>DETAIL</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>FX-420 Press</strong>
                      <small>Machine base price</small>
                    </td>
                    <td>1 machine</td>
                    <td>$84,500</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Selected configuration</strong>
                      <small>Options and adjustments</small>
                    </td>
                    <td>5 options</td>
                    <td>$19,100</td>
                  </tr>
                </tbody>
              </table>
              <div className="quote-sheet-totals">
                <div>
                  <span>Machine base</span>
                  <strong>$84,500</strong>
                </div>
                <div>
                  <span>Configuration</span>
                  <strong>$19,100</strong>
                </div>
                <div className="quote-sheet-grand-total">
                  <span>TOTAL CONFIGURATION</span>
                  <strong>$103,600</strong>
                </div>
              </div>
              <footer className="quote-sheet-footer">
                <div>
                  <strong>Quotation status</strong>
                  <p>
                    Expired · Contact the customer to confirm whether a
                    refreshed quotation is needed.
                  </p>
                </div>
                <Link className="btn-subtle" to="/enquiries">
                  <i className="bi bi-inbox"></i> Customer enquiry
                </Link>
              </footer>
            </article>
          </section>
        </div>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default QuoteDetails;
