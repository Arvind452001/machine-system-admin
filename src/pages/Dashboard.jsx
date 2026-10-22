import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Dashboard = () => {
  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Overview</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="container-fluid page-wrap">
        <section className="welcome-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }).toUpperCase()}
            </div>
            <h1>
              Good morning, Jordan<span>.</span>
            </h1>
            <p className="welcome-subtitle">
              Here’s what’s happening across your configurator today.
            </p>
          </div>
          <Link to="/add-machine" className="btn btn-accent">
            <i className="bi bi-plus-lg"></i> Add a machine
          </Link>
        </section>

        <section className="row g-3 mb-3" aria-label="Business summary">
          <article className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Active machines</span>
                <span className="stat-icon icon-machines">
                  <i className="bi bi-box-seam"></i>
                </span>
              </div>
              <div className="stat-number">
                12{" "}
                <span className="stat-change">
                  <i className="bi bi-arrow-up-right"></i> 2
                </span>
              </div>
              <div className="stat-foot">Available in the configurator</div>
            </div>
          </article>
          <article className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Open enquiries</span>
                <span className="stat-icon icon-enquiries">
                  <i className="bi bi-chat-left-text"></i>
                </span>
              </div>
              <div className="stat-number">
                28{" "}
                <span className="stat-change">
                  <i className="bi bi-arrow-up-right"></i> 12%
                </span>
              </div>
              <div className="stat-foot">Compared to last month</div>
            </div>
          </article>
          <article className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Quotes in progress</span>
                <span className="stat-icon icon-quotes">
                  <i className="bi bi-file-earmark-check"></i>
                </span>
              </div>
              <div className="stat-number">
                09 <span className="stat-neutral">Across 4 regions</span>
              </div>
              <div className="stat-foot">Awaiting representative review</div>
            </div>
          </article>
          <article className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Indicative pipeline</span>
                <span className="stat-icon icon-pipeline">
                  <i className="bi bi-graph-up-arrow"></i>
                </span>
              </div>
              <div className="stat-number">
                $482<span className="stat-unit">k</span>{" "}
                <span className="stat-change">
                  <i className="bi bi-arrow-up-right"></i> 8.4%
                </span>
              </div>
              <div className="stat-foot">Based on submitted configurations</div>
            </div>
          </article>
        </section>

        <section className="row g-2">
          <article className="col-lg-8" id="enquiries">
            <div className="panel enquiry-panel h-100">
              <div className="panel-heading">
                <div>
                  <div className="panel-kicker">CUSTOMER ACTIVITY</div>
                  <h2>
                    Recent enquiries{" "}
                    <span className="heading-count">8 new</span>
                  </h2>
                </div>
                <Link className="text-link" to="/enquiries">
                  View all <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table enquiry-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">CUSTOMER</th>
                      <th scope="col">MACHINE</th>
                      <th scope="col">REGION</th>
                      <th scope="col">STATUS</th>
                      <th scope="col">RECEIVED</th>
                      <th scope="col">
                        <span className="visually-hidden">Open enquiry</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="customer-cell">
                          <span className="avatar avatar-coral">AL</span>
                          <span>
                            <strong>Amelia Laurent</strong>
                            <small>Nordic Materials Co.</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="machine-name">FX-420 Press</span>
                        <small className="table-sub">Hydraulic forming</small>
                      </td>
                      <td>
                        <span className="region-cell">
                          <span className="flag">🇫🇷</span> France
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-new">
                          New enquiry
                        </span>
                      </td>
                      <td className="date-cell">12 min ago</td>
                      <td>
                        <Link
                          className="row-action"
                          to="/enquiry-details#amelia"
                          aria-label="Open Amelia Laurent enquiry"
                        >
                          <i className="bi bi-arrow-up-right"></i>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="customer-cell">
                          <span className="avatar avatar-blue">MK</span>
                          <span>
                            <strong>Martin Keller</strong>
                            <small>Keller Anlagenbau</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="machine-name">CR-80 Cutter</span>
                        <small className="table-sub">Precision cutting</small>
                      </td>
                      <td>
                        <span className="region-cell">
                          <span className="flag">🇩🇪</span> Germany
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-review">
                          In review
                        </span>
                      </td>
                      <td className="date-cell">48 min ago</td>
                      <td>
                        <Link
                          className="row-action"
                          to="/enquiry-details#martin"
                          aria-label="Open Martin Keller enquiry"
                        >
                          <i className="bi bi-arrow-up-right"></i>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="customer-cell">
                          <span className="avatar avatar-green">SP</span>
                          <span>
                            <strong>Sofia Papadakis</strong>
                            <small>Aegean Industrial</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="machine-name">MX-220 Mixer</span>
                        <small className="table-sub">Industrial mixing</small>
                      </td>
                      <td>
                        <span className="region-cell">
                          <span className="flag">🇬🇷</span> Greece
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-assigned">
                          Assigned
                        </span>
                      </td>
                      <td className="date-cell">2 hours ago</td>
                      <td>
                        <Link
                          className="row-action"
                          to="/enquiry-details#sofia"
                          aria-label="Open Sofia Papadakis enquiry"
                        >
                          <i className="bi bi-arrow-up-right"></i>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="customer-cell">
                          <span className="avatar avatar-gold">JT</span>
                          <span>
                            <strong>James Thompson</strong>
                            <small>Thompson &amp; Sons</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="machine-name">FX-420 Press</span>
                        <small className="table-sub">Hydraulic forming</small>
                      </td>
                      <td>
                        <span className="region-cell">
                          <span className="flag">🇬🇧</span> United Kingdom
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-quote">
                          Quote requested
                        </span>
                      </td>
                      <td className="date-cell">Yesterday</td>
                      <td>
                        <Link
                          className="row-action"
                          to="/enquiry-details#james"
                          aria-label="Open James Thompson enquiry"
                        >
                          <i className="bi bi-arrow-up-right"></i>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Link to="/enquiries" className="mobile-view-all">
                View all enquiries <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </article>

          <article className="col-lg-4" id="machines">
            <div className="panel machine-panel">
              <div className="panel-heading machine-heading">
                <div>
                  <div className="panel-kicker">CONFIGURATOR</div>
                  <h2>Featured machine</h2>
                </div>
                <Link
                  className="more-button"
                  to="/settings"
                  aria-label="Machine settings"
                >
                  <i className="bi bi-three-dots"></i>
                </Link>
              </div>
              <Link
                className="machine-visual"
                to="/machine-details"
                aria-label="View FX-420 hydraulic press"
              >
                <img
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&amp;fit=crop&amp;w=1000&amp;q=85"
                  alt="Industrial engineer inspecting precision machinery"
                />
                <span className="visual-tag">
                  <span></span> LIVE IN CONFIGURATOR
                </span>
                <span className="visual-code">FX / 420</span>
              </Link>
              <div className="machine-info">
                <div>
                  <div className="machine-category">HYDRAULIC FORMING</div>
                  <h3>FX-420 Press</h3>
                </div>
                <span className="machine-availability">
                  <span></span> Published
                </span>
              </div>
              <p className="machine-description">
                High-precision forming with a modular tooling system, built for
                continuous production.
              </p>
              <div className="machine-details">
                <div>
                  <span>Starting price</span>
                  <strong>$84,500</strong>
                </div>
                <div>
                  <span>Available options</span>
                  <strong>
                    16 <small>options</small>
                  </strong>
                </div>
                <div>
                  <span>Configurations</span>
                  <strong>
                    146 <small>this month</small>
                  </strong>
                </div>
              </div>
              <Link className="machine-link" to="/machines">
                Manage machine <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </article>
        </section>

        <section className="row bottom-grid">
          <article className="panel performance-panel col-lg-7" id="pricing">
            <div className="panel-heading">
              <div>
                <div className="panel-kicker">OVERVIEW</div>
                <h2>Enquiry volume</h2>
              </div>
              <span className="period-select">
                Last 7 days <i className="bi bi-chevron-down"></i>
              </span>
            </div>
            <div className="chart-summary">
              <strong>64</strong>
              <span>
                <i className="bi bi-arrow-up-right"></i> 18.6%{" "}
                <small>vs. previous week</small>
              </span>
            </div>
            <div
              className="chart"
              role="img"
              aria-label="Enquiry volume rose through the week, peaking at 16 enquiries on Thursday"
            >
              <div className="chart-gridline gridline-top"></div>
              <div className="chart-gridline gridline-mid"></div>
              <div className="chart-gridline gridline-low"></div>
              <div className="chart-y-label y-top">20</div>
              <div className="chart-y-label y-mid">10</div>
              <div className="chart-y-label y-low">0</div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "34%" }}></span>
                <small>FRI</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "52%" }}></span>
                <small>SAT</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "43%" }}></span>
                <small>SUN</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "68%" }}></span>
                <small>MON</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "59%" }}></span>
                <small>TUE</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "82%" }}></span>
                <small>WED</small>
              </div>
              <div className="bar-group bar-current">
                <span className="bar" style={{ "--bar-height": "100%" }}>
                  <em>16</em>
                </span>
                <small>THU</small>
              </div>
            </div>
          </article>

          <article className="panel activity-panel col-lg-5">
            <div className="panel-heading">
              <div>
                <div className="panel-kicker">LATEST UPDATES</div>
                <h2>Activity</h2>
              </div>
              <Link className="text-link" to="/enquiries">
                All activity <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon activity-coral">
                  <i className="bi bi-person-plus"></i>
                </span>
                <div>
                  <p>
                    <strong>Amelia Laurent</strong> submitted a new enquiry
                  </p>
                  <small>FX-420 Press · France</small>
                </div>
                <time>12m</time>
              </div>
              <div className="activity-item">
                <span className="activity-icon activity-slate">
                  <i className="bi bi-check2-circle"></i>
                </span>
                <div>
                  <p>
                    New option added to <strong>CR-80 Cutter</strong>
                  </p>
                  <small>Dust extraction unit</small>
                </div>
                <time>1h</time>
              </div>
              <div className="activity-item">
                <span className="activity-icon activity-green">
                  <i className="bi bi-send"></i>
                </span>
                <div>
                  <p>
                    <strong>Quote Q-2048</strong> sent to customer
                  </p>
                  <small>Martin Keller · Germany</small>
                </div>
                <time>3h</time>
              </div>
            </div>
          </article>
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
