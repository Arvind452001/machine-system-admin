import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";

const initialRenderings = [
  {
    id: "rend-1",
    machine: "FX-420 Press",
    view: "Primary product view · front and tooling layout",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=85",
    alt: "Industrial machine configuration view",
    status: "Published",
    statusClass: "table-status",
    updated: "Updated Oct 12, 2026",
    viewsCount: "3 views",
    link: "/machine-details",
  },
  {
    id: "rend-2",
    machine: "CR-80 Cutter",
    view: "Product view · cutting head and safety guard",
    image:
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=900&q=85",
    alt: "Precision industrial equipment",
    status: "Published",
    statusClass: "table-status",
    updated: "Updated Oct 10, 2026",
    viewsCount: "2 views",
    link: "/cr80-details",
  },
  {
    id: "rend-3",
    machine: "MX-220 Mixer",
    view: "Product view · vessel and drive assembly",
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=85",
    alt: "Engineer working with industrial equipment",
    status: "In review",
    statusClass: "table-status status-review",
    updated: "Updated Oct 08, 2026",
    viewsCount: "1 view",
    link: "/mx220-details",
  },
];

const Renderings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState("All machines");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Renderings</strong>
    </>
  );

  const filteredRenderings = initialRenderings.filter((rend) => {
    const matchesSearch =
      rend.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rend.view.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMachine =
      machineFilter === "All machines" || rend.machine === machineFilter;

    const matchesStatus =
      statusFilter === "All statuses" || rend.status === statusFilter;

    return matchesSearch && matchesMachine && matchesStatus;
  });

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>VISUAL CONFIGURATION
            </div>
            <h1>Renderings</h1>
            <p className="welcome-subtitle">
              Manage the machine imagery customers see while configuring their
              build.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-accent" to="/upload-rendering">
              <i className="bi bi-upload"></i> Upload rendering
            </Link>
          </div>
        </section>

        <section className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search renderings"
                placeholder="Search renderings"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter renderings by machine"
              className="filter-control"
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
            >
              <option>All machines</option>
              <option>FX-420 Press</option>
              <option>CR-80 Cutter</option>
            </select>
            <select
              aria-label="Filter rendering status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All statuses</option>
              <option>Published</option>
              <option>In review</option>
            </select>
          </div>
        </section>

        <section className="preview-grid">
          {filteredRenderings.map((rend) => (
            <article className="preview-card" key={rend.id}>
              <Link className="preview-image" to={rend.link}>
                <img alt={rend.alt} src={rend.image} />
                <span className={rend.statusClass}>{rend.status}</span>
              </Link>
              <div className="preview-copy">
                <h2>{rend.machine}</h2>
                <p>{rend.view}</p>
                <div className="preview-meta">
                  <span>{rend.updated}</span>
                  <strong>{rend.viewsCount}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Renderings;
