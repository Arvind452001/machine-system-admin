import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const representativesData = [
  {
    id: "cm",
    initials: "CM",
    name: "Camille Moreau",
    role: "Country representative",
    region: "France · Benelux",
    openEnquiries: "06",
  },
  {
    id: "fw",
    initials: "FW",
    name: "Friedrich Weber",
    role: "Country representative",
    region: "Germany · Austria",
    openEnquiries: "04",
  },
  {
    id: "em",
    initials: "EM",
    name: "Elena Markou",
    role: "Regional sales manager",
    region: "Greece · Cyprus",
    openEnquiries: "03",
  },
  {
    id: "og",
    initials: "OG",
    name: "Oliver Grant",
    role: "Country representative",
    region: "United Kingdom · Ireland",
    openEnquiries: "05",
  },
  {
    id: "as",
    initials: "AS",
    name: "Anna Schneider",
    role: "Country representative",
    region: "Switzerland",
    openEnquiries: "02",
  },
  {
    id: "jl",
    initials: "JL",
    name: "Javier Lopez",
    role: "Regional sales manager",
    region: "Spain · Portugal",
    openEnquiries: "04",
  },
];

const Representatives = () => {
  const breadcrumb = (
    <>
      <span>Sales</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Representatives</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>REGIONAL SALES TEAM
            </div>
            <h1>Representatives</h1>
            <p className="welcome-subtitle">
              Manage country coverage and keep enquiry assignments with the
              right local expert.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/invite-representative">
              <i className="bi bi-person-plus"></i> Invite representative
            </Link>
          </div>
        </section>

        <section className="summary-strip">
          <div className="summary-item">
            <span>Active representatives</span>
            <strong>14</strong>
          </div>
          <div className="summary-item">
            <span>Regions covered</span>
            <strong>11</strong>
          </div>
          <div className="summary-item">
            <span>Unassigned enquiries</span>
            <strong>08</strong>
            <small>Ready for assignment</small>
          </div>
        </section>

        <section className="rep-grid">
          {representativesData.map((rep) => (
            <article className="rep-card" key={rep.id}>
              <div className="rep-top">
                <span className="rep-avatar">{rep.initials}</span>
                <div>
                  <a className="record-link" href="#rep-profile">
                    {rep.name}
                  </a>
                  <small>{rep.role}</small>
                </div>
              </div>
              <div className="rep-region">
                <span>Region</span>
                <strong>{rep.region}</strong>
              </div>
              <div className="rep-region">
                <span>Open enquiries</span>
                <strong>{rep.openEnquiries}</strong>
              </div>
            </article>
          ))}
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Representatives;
