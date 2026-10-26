import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { renderingsApi } from "../api/renderingsApi";

const FALLBACK_RENDERINGS = [
  {
    id: "rend-1",
    machine: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
    view: "Primary product view · linear motor drive and pallet enclosure",
    image:
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    alt: "MS-L4000 Fiber laser cutting unit",
    status: "Published",
    statusClass: "table-status",
    updated: "Live in catalog",
    viewsCount: "3 views",
    link: "/machine-details",
  },
  {
    id: "rend-2",
    machine: "MS-M500 5-Axis Machining Center",
    view: "Product view · 5-axis trunnion table and spindle head",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    alt: "5-axis machining center",
    status: "Published",
    statusClass: "table-status",
    updated: "Live in catalog",
    viewsCount: "2 views",
    link: "/machine-details",
  },
  {
    id: "rend-3",
    machine: "MS-V850 Precision Vertical Machining Center",
    view: "Product view · rigid C-frame casting and tool changer",
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=85",
    alt: "Vertical machining center",
    status: "Published",
    statusClass: "table-status",
    updated: "Live in catalog",
    viewsCount: "1 view",
    link: "/machine-details",
  },
];

const Renderings = () => {
  const [renderings, setRenderings] = useState(FALLBACK_RENDERINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState("All machines");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    renderingsApi
      .getRenderings()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setRenderings(list);
        }
      })
      .catch((err) => {
        console.warn("Using offline fallback in Renderings:", err.message);
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
      <strong>Renderings</strong>
    </>
  );

  const filteredRenderings = renderings.filter((rend) => {
    const mach = rend.machine || rend.machineName || "";
    const view = rend.view || rend.caption || "";
    const status = rend.status || "Published";

    const matchesSearch =
      mach.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMachine =
      machineFilter === "All machines" || mach === machineFilter;

    const matchesStatus =
      statusFilter === "All statuses" || status === statusFilter;

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
              Manage machine 3D renders, schematic blueprints, and customer visual layers.
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
                placeholder="Search renderings by machine or angle"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter by machine"
              className="filter-control"
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
            >
              <option>All machines</option>
              <option>MS-L4000 Ultra-Speed Fiber Laser Cutter</option>
              <option>MS-M500 5-Axis Machining Center</option>
              <option>MS-V850 Precision Vertical Machining Center</option>
            </select>
            <select
              aria-label="Filter by status"
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

        <section className="rendering-grid">
          {filteredRenderings.map((rend) => (
            <article className="rendering-card" key={rend.id || rend._id}>
              <div className="rendering-media">
                <img alt={rend.alt || rend.machine} src={rend.image || rend.url} />
                <span className={rend.statusClass || "table-status"}>{rend.status || "Published"}</span>
              </div>
              <div className="rendering-body">
                <h3>{rend.machine || rend.machineName}</h3>
                <p>{rend.view || rend.caption || "Industrial perspective render"}</p>
                <div className="rendering-meta">
                  <span>{rend.updated || "Active"}</span>
                  <Link to={rend.link || "/machine-details"}>
                    View machine <i className="bi bi-arrow-right"></i>
                  </Link>
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
