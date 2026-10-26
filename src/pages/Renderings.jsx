import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { renderingsApi } from "../api/renderingsApi";
import Pagination from "../components/Pagination";

// Industrial SVG Blueprint fallback for offline or failed image URLs
const FALLBACK_SVG = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141513" />
      <stop offset="100%" stop-color="#0c0d0b" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222420" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#grid)" />
  <circle cx="400" cy="210" r="90" fill="none" stroke="#c94f2d" stroke-width="2" stroke-dasharray="8 6" opacity="0.6"/>
  <rect x="310" y="140" width="180" height="140" rx="10" fill="#1b1c19" stroke="#41433e" stroke-width="2"/>
  <path d="M 280 280 L 520 280" stroke="#c94f2d" stroke-width="3" stroke-linecap="round"/>
  <path d="M 360 175 L 440 175 M 370 210 L 430 210 M 380 245 L 420 245" stroke="#71736b" stroke-width="2" stroke-linecap="round"/>
  <text x="400" y="325" fill="#f5f5f0" font-family="Inter, sans-serif" font-size="16" font-weight="600" text-anchor="middle">MACHINE SYSTEMS · 3D RENDER</text>
  <text x="400" y="348" fill="#8a8c84" font-family="Inter, sans-serif" font-size="12" text-anchor="middle">Interactive Visual Layer · CAD Viewport</text>
</svg>
`);

const INITIAL_RENDERINGS = [
  {
    id: "rend-1",
    machine: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
    category: "Laser Cutting",
    view: "Isometric Primary View · Linear motor drive & dual shuttle pallet enclosure",
    angle: "Isometric 45°",
    resolution: "3840 × 2160 4K",
    format: "WebGL / PNG",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=85",
    alt: "MS-L4000 Fiber laser cutting unit",
    status: "Published",
    updated: "Active in Configurator",
    viewsCount: 4,
    link: "/machines",
  },
  {
    id: "rend-2",
    machine: "MS-M500 5-Axis Machining Center",
    category: "Milling Centers",
    view: "Trunnion Cutaway View · B/C rotary tilt table & 24,000 RPM HSK spindle",
    angle: "Front Orthographic",
    resolution: "3840 × 2160 4K",
    format: "CAD Blueprint",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=85",
    alt: "5-axis machining center",
    status: "Published",
    updated: "Active in Configurator",
    viewsCount: 6,
    link: "/machines",
  },
  {
    id: "rend-3",
    machine: "MS-V850 Precision Vertical Machining Center",
    category: "Milling Centers",
    view: "Structural Perspective · Meehanite C-frame casting & 30-pocket tool carousel",
    angle: "Side Profile",
    resolution: "2560 × 1440 QHD",
    format: "WebGL / PNG",
    image: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1200&q=85",
    alt: "Vertical machining center",
    status: "Published",
    updated: "Active in Configurator",
    viewsCount: 3,
    link: "/machines",
  },
  {
    id: "rend-4",
    machine: "MS-T1000 CNC Turning Center",
    category: "Turning Lathes",
    view: "Turret & Tailstock View · 12-station servo turret & programmable tailstock",
    angle: "Tooling Close-up",
    resolution: "3840 × 2160 4K",
    format: "Schematic 3D",
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85",
    alt: "CNC turning lathe",
    status: "Published",
    updated: "Active in Configurator",
    viewsCount: 5,
    link: "/machines",
  },
  {
    id: "rend-5",
    machine: "FX-420 Precision Servo Press",
    category: "Forming Presses",
    view: "Die Area & Hydraulic Platen · High-rigidity tie rod construction with light curtains",
    angle: "Work Envelope",
    resolution: "2560 × 1440 QHD",
    format: "WebGL / PNG",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85",
    alt: "Servo press machine",
    status: "In Review",
    updated: "Pending QA Approval",
    viewsCount: 2,
    link: "/machines",
  },
  {
    id: "rend-6",
    machine: "MS-RoboWeld Automated Cell",
    category: "Automation Cells",
    view: "Full Cell Topography · 6-axis articulated arm with dual safety light fences",
    angle: "Exploded Overview",
    resolution: "3840 × 2160 4K",
    format: "Isometric 30°",
    image: "https://images.unsplash.com/photo-1617791160505-6f00b51616ec?auto=format&fit=crop&w=1200&q=85",
    alt: "Robotic welding cell",
    status: "Published",
    updated: "Active in Configurator",
    viewsCount: 4,
    link: "/machines",
  },
];

const Renderings = () => {
  const [renderings, setRenderings] = useState(INITIAL_RENDERINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState("All machines");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [previewItem, setPreviewItem] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newRenderForm, setNewRenderForm] = useState({
    machine: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
    view: "",
    angle: "Isometric 45°",
    imageUrl: "",
    status: "Published",
  });
  const [toastMessage, setToastMessage] = useState("");
  const PAGE_SIZE = 6;

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
      });

    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCreateRendering = (e) => {
    e.preventDefault();
    if (!newRenderForm.view.trim()) {
      alert("Please enter a description or view name.");
      return;
    }

    const created = {
      id: "rend-" + Date.now(),
      machine: newRenderForm.machine,
      category: "Industrial Machinery",
      view: newRenderForm.view,
      angle: newRenderForm.angle,
      resolution: "3840 × 2160 4K",
      format: "WebGL / PNG",
      image: newRenderForm.imageUrl || INITIAL_RENDERINGS[0].image,
      alt: newRenderForm.machine,
      status: newRenderForm.status,
      updated: "Just added",
      viewsCount: 1,
      link: "/machines",
    };

    setRenderings([created, ...renderings]);
    setIsUploadModalOpen(false);
    setNewRenderForm({
      machine: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
      view: "",
      angle: "Isometric 45°",
      imageUrl: "",
      status: "Published",
    });
    showToast("Rendering asset created successfully!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this 3D rendering asset?")) {
      setRenderings(renderings.filter((r) => (r.id || r._id) !== id));
      showToast("Rendering asset removed.");
    }
  };

  const filteredRenderings = renderings.filter((rend) => {
    const mach = rend.machine || rend.machineName || "";
    const view = rend.view || rend.caption || "";
    const angle = rend.angle || "";
    const status = (rend.status || "Published").toLowerCase();

    const matchesSearch =
      mach.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.toLowerCase().includes(searchTerm.toLowerCase()) ||
      angle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMachine =
      machineFilter === "All machines" || mach === machineFilter;

    const matchesStatus =
      statusFilter === "All statuses" ||
      status === statusFilter.toLowerCase();

    return matchesSearch && matchesMachine && matchesStatus;
  });

  const paginatedRenderings = filteredRenderings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Renderings &amp; 3D Assets</strong>
    </>
  );

  const uniqueMachines = Array.from(
    new Set(renderings.map((r) => r.machine || r.machineName).filter(Boolean))
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="page-wrap" style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 20px" }}>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 9999,
              background: "#1e201c",
              border: "1px solid #c94f2d",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ color: "#22c55e" }}></i>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Header */}
        <section className="content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>
              <span className="eyebrow-line" style={{ width: "16px", height: "2px", background: "var(--accent)", display: "inline-block" }}></span>
              VISUAL ASSET ENGINE
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
              Machine Renderings
            </h1>
            <p className="welcome-subtitle" style={{ color: "#858780", margin: 0, fontSize: "14px" }}>
              Manage interactive 3D perspectives, orthographic CAD blueprints, and configurator visual layers.
            </p>
          </div>

          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "inline-flex", background: "#f0ece7", borderRadius: "8px", padding: "3px", border: "1px solid #e2ddd6" }}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                style={{
                  background: viewMode === "grid" ? "#fff" : "transparent",
                  color: viewMode === "grid" ? "#171816" : "#858780",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  fontWeight: "600",
                }}
              >
                <i className="bi bi-grid-fill"></i> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table View"
                style={{
                  background: viewMode === "table" ? "#fff" : "transparent",
                  color: viewMode === "table" ? "#171816" : "#858780",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  fontWeight: "600",
                }}
              >
                <i className="bi bi-list-ul"></i> Table
              </button>
            </div>

            <button
              className="btn btn-accent"
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--accent, #c94f2d)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "9px 18px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(201, 79, 45, 0.25)",
              }}
            >
              <i className="bi bi-cloud-arrow-up-fill"></i> Upload rendering
            </button>
          </div>
        </section>

        {/* Summary Strip (KPI Stats) */}
        <section className="summary-strip" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div className="summary-item" style={{ background: "#fff", border: "1px solid #ebe7e1", borderRadius: "10px", padding: "16px 20px" }}>
            <span style={{ fontSize: "12px", color: "#858780", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Visual Assets</span>
            <strong style={{ fontSize: "24px", display: "block", marginTop: "4px", color: "#171816" }}>{renderings.length}</strong>
            <small style={{ color: "#22c55e", fontSize: "11px", fontWeight: "600" }}>
              <i className="bi bi-check-circle-fill"></i> Fully synced with catalog
            </small>
          </div>

          <div className="summary-item" style={{ background: "#fff", border: "1px solid #ebe7e1", borderRadius: "10px", padding: "16px 20px" }}>
            <span style={{ fontSize: "12px", color: "#858780", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active In Configurator</span>
            <strong style={{ fontSize: "24px", display: "block", marginTop: "4px", color: "#171816" }}>
              {renderings.filter((r) => (r.status || "").toLowerCase().includes("pub")).length}
            </strong>
            <small style={{ color: "#858780", fontSize: "11px" }}>High-Res 3D Viewports</small>
          </div>

          <div className="summary-item" style={{ background: "#fff", border: "1px solid #ebe7e1", borderRadius: "10px", padding: "16px 20px" }}>
            <span style={{ fontSize: "12px", color: "#858780", textTransform: "uppercase", letterSpacing: "0.5px" }}>Machine Platforms Covered</span>
            <strong style={{ fontSize: "24px", display: "block", marginTop: "4px", color: "#171816" }}>{uniqueMachines.length}</strong>
            <small style={{ color: "var(--accent)", fontSize: "11px", fontWeight: "600" }}>Milling, Laser &amp; Lathe</small>
          </div>

          <div className="summary-item" style={{ background: "#fff", border: "1px solid #ebe7e1", borderRadius: "10px", padding: "16px 20px" }}>
            <span style={{ fontSize: "12px", color: "#858780", textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Rendering Resolution</span>
            <strong style={{ fontSize: "24px", display: "block", marginTop: "4px", color: "#171816" }}>4K UHD</strong>
            <small style={{ color: "#858780", fontSize: "11px" }}>Color-calibrated orthographic</small>
          </div>
        </section>

        {/* Toolbar with Search and Filters */}
        <div className="toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#fff", padding: "14px 18px", borderRadius: "10px", border: "1px solid #ebe7e1", marginBottom: "24px" }}>
          <div className="toolbar-left" style={{ flex: "1 1 320px", maxWidth: "420px" }}>
            <label className="search-box" style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8f6f2", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "8px 14px" }}>
              <i className="bi bi-search" style={{ color: "#858780" }}></i>
              <input
                aria-label="Search renderings"
                placeholder="Search by machine, viewpoint, or angle..."
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#171816" }}
              />
            </label>
          </div>

          <div className="toolbar-right" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              aria-label="Filter by machine"
              className="filter-control"
              value={machineFilter}
              onChange={(e) => {
                setMachineFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e5e0d8", background: "#f8f6f2", fontSize: "13px", color: "#171816", outline: "none", cursor: "pointer" }}
            >
              <option>All machines</option>
              {uniqueMachines.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              className="filter-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e5e0d8", background: "#f8f6f2", fontSize: "13px", color: "#171816", outline: "none", cursor: "pointer" }}
            >
              <option>All statuses</option>
              <option>Published</option>
              <option>In Review</option>
            </select>

            {(searchTerm || machineFilter !== "All machines" || statusFilter !== "All statuses") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setMachineFilter("All machines");
                  setStatusFilter("All statuses");
                  setCurrentPage(1);
                }}
                style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "12px", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* View Mode: Grid View */}
        {viewMode === "grid" && (
          <section
            className="rendering-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            {paginatedRenderings.map((rend) => {
              const isPublished = (rend.status || "").toLowerCase().includes("pub");
              return (
                <article
                  key={rend.id || rend._id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #ebe7e1",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
                  }}
                >
                  {/* Media Viewport */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      background: "#141513",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      alt={rend.alt || rend.machine}
                      src={rend.image || rend.url}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_SVG;
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.35s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />

                    {/* Status Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        zIndex: 2,
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          background: isPublished ? "rgba(16, 185, 129, 0.9)" : "rgba(234, 179, 8, 0.9)",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "0.4px",
                          backdropFilter: "blur(4px)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }}></span>
                        {rend.status || "Published"}
                      </span>

                      {rend.angle && (
                        <span
                          style={{
                            background: "rgba(17, 18, 16, 0.75)",
                            color: "#e2e8f0",
                            padding: "4px 9px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}
                        >
                          {rend.angle}
                        </span>
                      )}
                    </div>

                    {/* Viewport Floating Action */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        zIndex: 2,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewItem(rend)}
                        title="Expand high-res 3D preview"
                        style={{
                          background: "rgba(17, 18, 16, 0.8)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <i className="bi bi-arrows-fullscreen"></i> Preview
                      </button>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                      {rend.category || "INDUSTRIAL SPEC"}
                    </div>
                    
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#171816", margin: "0 0 6px 0", lineHeight: "1.3" }}>
                      {rend.machine || rend.machineName}
                    </h3>

                    <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 16px 0", lineHeight: "1.5", flex: 1 }}>
                      {rend.view || rend.caption || "Standard operational visualization"}
                    </p>

                    {/* Technical Specs Pill Strip */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        background: "#f8f6f2",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "11px",
                        color: "#52525b",
                      }}
                    >
                      <span><i className="bi bi-aspect-ratio"></i> {rend.resolution || "4K UHD"}</span>
                      <span>•</span>
                      <span><i className="bi bi-layers"></i> {rend.viewsCount || 3} Views</span>
                      <span>•</span>
                      <span><i className="bi bi-cpu"></i> {rend.format || "WebGL"}</span>
                    </div>

                    {/* Card Footer Actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid #f1eeea",
                      }}
                    >
                      <Link
                        to={rend.link || "/machines"}
                        style={{
                          color: "var(--accent)",
                          fontSize: "12px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        View in catalog <i className="bi bi-arrow-right"></i>
                      </Link>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setPreviewItem(rend)}
                          title="Preview render"
                          style={{
                            background: "transparent",
                            border: "1px solid #e5e0d8",
                            borderRadius: "6px",
                            padding: "5px 8px",
                            color: "#52525b",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rend.id || rend._id)}
                          title="Delete render"
                          style={{
                            background: "transparent",
                            border: "1px solid #fee2e2",
                            borderRadius: "6px",
                            padding: "5px 8px",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* View Mode: Table View */}
        {viewMode === "table" && (
          <section className="table-panel" style={{ background: "#fff", border: "1px solid #ebe7e1", borderRadius: "10px", overflow: "hidden", marginBottom: "28px" }}>
            <div className="table-responsive">
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ebe7e1", background: "#faf8f5" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "700", color: "#64748b", fontSize: "11px", letterSpacing: "0.5px" }}>PREVIEW</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", color: "#64748b", fontSize: "11px", letterSpacing: "0.5px" }}>MACHINE MODEL</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", color: "#64748b", fontSize: "11px", letterSpacing: "0.5px" }}>ANGLE &amp; PERSPECTIVE</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", color: "#64748b", fontSize: "11px", letterSpacing: "0.5px" }}>SPECIFICATION</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", color: "#64748b", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRenderings.map((rend) => {
                    const isPublished = (rend.status || "").toLowerCase().includes("pub");
                    return (
                      <tr key={rend.id || rend._id} style={{ borderBottom: "1px solid #f3efe9" }}>
                        <td style={{ padding: "12px 18px" }}>
                          <img
                            src={rend.image || rend.url}
                            alt={rend.machine}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_SVG;
                            }}
                            style={{
                              width: "72px",
                              height: "46px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              background: "#171816",
                              display: "block",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <strong style={{ display: "block", color: "#171816" }}>{rend.machine}</strong>
                          <span style={{ color: "#858780", fontSize: "11px" }}>{rend.category || "Machinery"}</span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ fontWeight: "600", color: "#334155" }}>{rend.angle || "Primary View"}</span>
                          <div style={{ color: "#64748b", fontSize: "12px", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {rend.view}
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ color: "#475569", fontSize: "12px" }}>{rend.resolution || "4K UHD"}</span>
                          <span style={{ display: "block", color: "#858780", fontSize: "11px" }}>{rend.format || "WebGL"}</span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span
                            style={{
                              background: isPublished ? "#dcfce7" : "#fef9c3",
                              color: isPublished ? "#15803d" : "#854d0e",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "700",
                              display: "inline-block",
                            }}
                          >
                            {rend.status || "Published"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => setPreviewItem(rend)}
                            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "13px", fontWeight: "600", marginRight: "12px" }}
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rend.id || rend._id)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px" }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRenderings.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemName="rendering assets"
        />

        {/* High-Res Lightbox Modal */}
        {previewItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(10, 11, 9, 0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={() => setPreviewItem(null)}
          >
            <div
              style={{
                background: "#171816",
                border: "1px solid #333430",
                borderRadius: "14px",
                maxWidth: "960px",
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
                color: "#f5f5f0",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 22px",
                  borderBottom: "1px solid #2b2c28",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700" }}>{previewItem.machine}</h3>
                  <span style={{ fontSize: "12px", color: "var(--accent)" }}>{previewItem.angle} · {previewItem.resolution}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: "22px", cursor: "pointer" }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div style={{ position: "relative", width: "100%", maxHeight: "560px", background: "#0c0d0b", overflow: "hidden" }}>
                <img
                  src={previewItem.image || previewItem.url}
                  alt={previewItem.machine}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_SVG;
                  }}
                  style={{ width: "100%", height: "100%", maxHeight: "560px", objectFit: "contain", display: "block" }}
                />
              </div>

              <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1b1c19" }}>
                <div style={{ fontSize: "13px", color: "#a1a1aa", maxWidth: "600px" }}>
                  {previewItem.view}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <a
                    href={previewItem.image}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="btn btn-accent"
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bi bi-download"></i> Open Raw Asset
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Rendering Modal */}
        {isUploadModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(10, 11, 9, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setIsUploadModalOpen(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                maxWidth: "540px",
                width: "100%",
                padding: "26px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: "#171816" }}>
                  Upload Visual Rendering
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{ background: "none", border: "none", color: "#858780", fontSize: "20px", cursor: "pointer" }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleCreateRendering}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                    Machine Model
                  </label>
                  <select
                    className="form-control"
                    value={newRenderForm.machine}
                    onChange={(e) => setNewRenderForm({ ...newRenderForm, machine: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    {uniqueMachines.map((m, idx) => (
                      <option key={idx} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                    Perspective / Angle Tag
                  </label>
                  <select
                    className="form-control"
                    value={newRenderForm.angle}
                    onChange={(e) => setNewRenderForm({ ...newRenderForm, angle: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option>Isometric 45°</option>
                    <option>Front Orthographic</option>
                    <option>Side Profile</option>
                    <option>Cutaway / Internal Mechanism</option>
                    <option>Exploded Assembly</option>
                    <option>Blueprint Schematic</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                    Description &amp; Highlights
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dual shuttle enclosure & linear motor gantry"
                    value={newRenderForm.view}
                    onChange={(e) => setNewRenderForm({ ...newRenderForm, view: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                    Asset Image URL (CDN or Cloudinary)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (or leave blank for high-res standard render)"
                    value={newRenderForm.imageUrl}
                    onChange={(e) => setNewRenderForm({ ...newRenderForm, imageUrl: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "9px 16px", color: "#475569", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent"
                    style={{ background: "var(--accent)", border: "none", borderRadius: "8px", padding: "9px 20px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Save &amp; Publish Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default Renderings;
