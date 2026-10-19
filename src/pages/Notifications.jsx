import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const Notifications = () => {
  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Notifications</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="container-fluid page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>ACTIVITY CENTER
            </div>
            <h1>Notifications</h1>
            <p className="welcome-subtitle">
              Recent customer, quotation, and catalog updates for your
              workspace.
            </p>
          </div>
          <Link className="btn-subtle" to="/settings">
            <i className="bi bi-sliders"></i> Notification settings
          </Link>
        </section>

        <section
          className="notification-summary"
          aria-label="Notification summary"
        >
          <div>
            <span>Unread</span>
            <strong>4</strong>
          </div>
          <div>
            <span>Today</span>
            <strong>6</strong>
          </div>
          <div>
            <span>Needs attention</span>
            <strong>2</strong>
          </div>
        </section>

        <section
          className="notification-panel"
          aria-label="Recent notifications"
        >
          <div className="notification-group-heading">
            <h2>Today</h2>
            <span>October 16, 2026</span>
          </div>
          <Link
            className="notification-row is-unread"
            to="/enquiry-details#amelia"
          >
            <span className="notification-type notification-type-new">
              <i className="bi bi-inbox"></i>
            </span>
            <span className="notification-copy">
              <strong>New customer enquiry</strong>
              <span>
                Amelia Laurent from Nordic Materials Co. requested an FX-420
                Press configuration valued at $104,200.
              </span>
              <small>Enquiry · France</small>
            </span>
            <time dateTime="2026-10-16T09:48">12 min ago</time>
          </Link>
          <Link
            className="notification-row is-unread"
            to="/enquiry-details#martin"
          >
            <span className="notification-type notification-type-review">
              <i className="bi bi-person-check"></i>
            </span>
            <span className="notification-copy">
              <strong>Enquiry assigned for review</strong>
              <span>
                Martin Keller's CR-80 Cutter request is assigned to Friedrich
                Weber.
              </span>
              <small>Enquiry · Germany</small>
            </span>
            <time dateTime="2026-10-16T09:12">48 min ago</time>
          </Link>
          <Link
            className="notification-row is-unread"
            to="/quote-details#q2048"
          >
            <span className="notification-type notification-type-quote">
              <i className="bi bi-file-earmark-text"></i>
            </span>
            <span className="notification-copy">
              <strong>Quote sent to customer</strong>
              <span>
                Quote Q-2048 for Keller Anlagenbau is awaiting a customer
                response.
              </span>
              <small>Quote · $76,400</small>
            </span>
            <time dateTime="2026-10-16T08:20">2 hours ago</time>
          </Link>
          <Link
            className="notification-row is-unread"
            to="/quote-details#q2044"
          >
            <span className="notification-type notification-type-success">
              <i className="bi bi-check2-circle"></i>
            </span>
            <span className="notification-copy">
              <strong>Quote accepted</strong>
              <span>
                Sofia Papadakis accepted quote Q-2044 for the MX-220 Mixer.
              </span>
              <small>Quote · $59,250</small>
            </span>
            <time dateTime="2026-10-16T07:15">3 hours ago</time>
          </Link>

          <div className="notification-group-heading">
            <h2>Earlier</h2>
            <span>October 15, 2026</span>
          </div>
          <Link className="notification-row" to="/enquiry-details#james">
            <span className="notification-type notification-type-review">
              <i className="bi bi-chat-left-text"></i>
            </span>
            <span className="notification-copy">
              <strong>Customer enquiry moved to discussion</strong>
              <span>
                James Thompson's FX-420 Press request is being followed up by
                Oliver Grant.
              </span>
              <small>Enquiry · United Kingdom</small>
            </span>
            <time dateTime="2026-10-15">Yesterday</time>
          </Link>
          <Link className="notification-row" to="/renderings">
            <span className="notification-type notification-type-catalog">
              <i className="bi bi-image"></i>
            </span>
            <span className="notification-copy">
              <strong>Rendering needs review</strong>
              <span>
                The MX-220 Mixer product image is awaiting publication review.
              </span>
              <small>Catalog · Renderings</small>
            </span>
            <time dateTime="2026-10-15">Yesterday</time>
          </Link>
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Notifications;
