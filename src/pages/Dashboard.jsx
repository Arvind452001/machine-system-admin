import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { statsApi } from "../api/statsApi";

const FALLBACK_ENQUIRIES = [
  {
    id: "amelia",
    customer: { name: "Amelia Laurent", company: "Nordic Materials Co.", country: "France" },
    machine: { name: "FX-420 Press", category: "Hydraulic forming" },
    status: "new",
    timeAgo: "12 min ago",
  },
  {
    id: "martin",
    customer: { name: "Martin Keller", company: "Keller Anlagenbau", country: "Germany" },
    machine: { name: "CR-80 Cutter", category: "Precision cutting" },
    status: "in_review",
    timeAgo: "48 min ago",
  },
  {
    id: "sofia",
    customer: { name: "Sofia Papadakis", company: "Aegean Industrial", country: "Greece" },
    machine: { name: "MX-220 Mixer", category: "Industrial mixing" },
    status: "assigned",
    timeAgo: "2 hours ago",
  },
  {
    id: "james",
    customer: { name: "James Thompson", company: "Thompson & Sons", country: "United Kingdom" },
    machine: { name: "FX-420 Press", category: "Hydraulic forming" },
    status: "quote_ready",
    timeAgo: "Yesterday",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    activeMachines: 5,
    openEnquiries: 2,
    quotesInProgress: 2,
    indicativePipeline: 1593200,
  });
  const [recentEnquiries, setRecentEnquiries] = useState(FALLBACK_ENQUIRIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    statsApi
      .getAdminStats()
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || res;
        if (data) {
          if (data.metrics) {
            setMetrics(data.metrics);
          }
          if (Array.isArray(data.recentEnquiries) && data.recentEnquiries.length > 0) {
            setRecentEnquiries(data.recentEnquiries);
          }
        }
      })
      .catch((err) => {
        console.warn("Using offline stats fallback in Admin Dashboard:", err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Overview</strong>
    </>
  );

  const formatPipeline = (val) => {
    if (!val) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val}`;
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("new")) return <span className="status-pill status-new">New enquiry</span>;
    if (s.includes("review")) return <span className="status-pill status-review">In review</span>;
    if (s.includes("assign")) return <span className="status-pill status-assigned">Assigned</span>;
    if (s.includes("quote")) return <span className="status-pill status-quote">Quote ready</span>;
    return <span className="status-pill">{status || "Active"}</span>;
  };

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
              Good day, {user?.name ? user.name.split(" ")[0] : "Administrator"}<span>.</span>
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
                {String(metrics.publishedMachines ?? metrics.activeMachines ?? 5).padStart(2, "0")}{" "}
                <span className="stat-change">
                  <i className="bi bi-arrow-up-right"></i> Live
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
                {String(metrics.openEnquiries ?? 2).padStart(2, "0")}{" "}
                <span className="stat-change">
                  <i className="bi bi-arrow-up-right"></i> Active
                </span>
              </div>
              <div className="stat-foot">Awaiting representative review</div>
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
                {String(metrics.quotesInProgress ?? 2).padStart(2, "0")}{" "}
                <span className="stat-neutral">Awaiting client</span>
              </div>
              <div className="stat-foot">Issued quotations in pipeline</div>
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
                {formatPipeline(metrics.indicativePipeline || metrics.pipelineValue || 1593200)}
                <span className="stat-change">
                  <i className="bi bi-arrow-up-right"></i> Active
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
                    <span className="heading-count">{recentEnquiries.length} records</span>
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
                    {recentEnquiries.map((enq, index) => {
                      const custName =
                        enq.customer?.name ||
                        enq.fullName ||
                        `${enq.firstName || ""} ${enq.lastName || ""}`.trim() ||
                        "Valued Customer";
                      const custCompany = enq.customer?.company || enq.company || "Direct enquiry";
                      const custCountry = enq.customer?.country || enq.country || enq.region || "Global";
                      const machineName =
                        enq.machine?.name || enq.machineName || "Industrial Machinery";
                      const machineSku = enq.machine?.sku || enq.machineCode || "Configured System";
                      const dateDisplay = enq.createdAt
                        ? new Date(enq.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : enq.timeAgo || "Recently";

                      const initials = custName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={enq._id || enq.id || index}>
                          <td>
                            <div className="customer-cell">
                              <span className="avatar avatar-coral">{initials}</span>
                              <span>
                                <strong>{custName}</strong>
                                <small>{custCompany}</small>
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="machine-name">{machineName}</span>
                            <small className="table-sub">{machineSku}</small>
                          </td>
                          <td>
                            <span className="region-cell">{custCountry}</span>
                          </td>
                          <td>{getStatusBadge(enq.status)}</td>
                          <td className="date-cell">{dateDisplay}</td>
                          <td>
                            <Link
                              className="row-action"
                              to={`/enquiry-details#${enq._id || enq.id || enq.referenceNumber}`}
                              aria-label={`Open ${custName} enquiry`}
                            >
                              <i className="bi bi-arrow-up-right"></i>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
                aria-label="View MS-L4000 Ultra-Speed Fiber Laser Cutter"
              >
                <img
                  src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
                  alt="Ultra-Speed Fiber Laser Cutter"
                />
                <span className="visual-tag">
                  <span></span> LIVE IN CONFIGURATOR
                </span>
                <span className="visual-code">MS / L4000</span>
              </Link>
              <div className="machine-info">
                <div>
                  <div className="machine-category">LASER PROCESSING</div>
                  <h3>MS-L4000 Fiber Laser</h3>
                </div>
                <span className="machine-availability">
                  <span></span> Published
                </span>
              </div>
              <p className="machine-description">
                12 kW Fiber Source with linear motor drives achieving 2.8G acceleration and 12-second pallet exchange.
              </p>
              <div className="machine-details">
                <div>
                  <span>Base price</span>
                  <strong>$228,000</strong>
                </div>
                <div>
                  <span>Available options</span>
                  <strong>
                    6 <small>modules</small>
                  </strong>
                </div>
                <div>
                  <span>Pipeline</span>
                  <strong>
                    Active <small>demand</small>
                  </strong>
                </div>
              </div>
              <Link className="machine-link" to="/machines">
                Manage machines <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </article>
        </section>

        <section className="row bottom-grid">
          <article className="panel performance-panel col-lg-7" id="pricing">
            <div className="panel-heading">
              <div>
                <div className="panel-kicker">OVERVIEW</div>
                <h2>Pipeline telemetry</h2>
              </div>
              <span className="period-select">
                Active status <i className="bi bi-chevron-down"></i>
              </span>
            </div>
            <div className="chart-summary">
              <strong>{metrics.totalEnquiries || 9} Total Enquiries</strong>
              <span>
                <i className="bi bi-arrow-up-right"></i> {metrics.acceptedQuotes || 5} Orders Won
              </span>
            </div>
            <div
              className="chart"
              role="img"
              aria-label="Enquiry telemetry across days"
            >
              <div className="chart-gridline gridline-top"></div>
              <div className="chart-gridline gridline-mid"></div>
              <div className="chart-gridline gridline-low"></div>
              <div className="chart-y-label y-top">20</div>
              <div className="chart-y-label y-mid">10</div>
              <div className="chart-y-label y-low">0</div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "45%" }}></span>
                <small>FRI</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "55%" }}></span>
                <small>SAT</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "40%" }}></span>
                <small>SUN</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "75%" }}></span>
                <small>MON</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "65%" }}></span>
                <small>TUE</small>
              </div>
              <div className="bar-group">
                <span className="bar" style={{ "--bar-height": "88%" }}></span>
                <small>WED</small>
              </div>
              <div className="bar-group bar-current">
                <span className="bar" style={{ "--bar-height": "100%" }}>
                  <em>{metrics.openEnquiries || 2}</em>
                </span>
                <small>TODAY</small>
              </div>
            </div>
          </article>

          <article className="panel activity-panel col-lg-5">
            <div className="panel-heading">
              <div>
                <div className="panel-kicker">LATEST UPDATES</div>
                <h2>Activity &amp; Telemetry</h2>
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
                    <strong>David Vance</strong> configured MS-L4000 Laser
                  </p>
                  <small>Commercial quote prepared</small>
                </div>
                <time>Live</time>
              </div>
              <div className="activity-item">
                <span className="activity-icon activity-slate">
                  <i className="bi bi-gear"></i>
                </span>
                <div>
                  <p>
                    <strong>{metrics.publishedMachines || 5} Machines</strong> active in catalog
                  </p>
                  <small>Industrial turning, milling &amp; laser</small>
                </div>
                <time>Live</time>
              </div>
              <div className="activity-item">
                <span className="activity-icon activity-green">
                  <i className="bi bi-send-check"></i>
                </span>
                <div>
                  <p>
                    <strong>{metrics.totalQuotes || 7} Commercial quotes</strong> issued
                  </p>
                  <small>{metrics.acceptedQuotes || 5} accepted by clients</small>
                </div>
                <time>Live</time>
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
