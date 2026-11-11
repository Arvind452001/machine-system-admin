import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";
import { machinesApi } from "../api/machinesApi";

const MachineDetails = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const machineId = (searchParams.get("id") || location.hash.replace("#", "")).trim();

  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(Boolean(machineId));

  useEffect(() => {
    let mounted = true;

    if (!machineId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    machinesApi
      .getMachine(machineId)
      .then((res) => {
        if (!mounted) return;
        const m = res?.data || res;
        setMachine(m || null);
      })
      .catch((err) => {
        console.warn("Could not load machine details:", err.message);
        if (mounted) setMachine(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [machineId]);

  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>{machine?.name || "Machine details"}</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
        <div className="page-wrap text-center p-5">
          <div style={{ color: "var(--text-muted, #85867f)", padding: "4rem 0" }}>
            <i className="bi bi-arrow-repeat me-2" style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "2rem" }}></i>
            <p className="mt-3">Loading machine details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!machine) {
    return (
      <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
        <div className="page-wrap">
          <EmptyState
            icon="bi-cpu"
            title="Data is not found"
            message={
              machineId
                ? `The machine record with ID "${machineId}" could not be found or has been removed.`
                : "No machine identifier was provided in the request URL."
            }
            actionText="Back to all machines"
            actionLink="/machines"
          />
        </div>
      </AdminLayout>
    );
  }

  const isPublished =
    (machine.status || "").toLowerCase() === "published" ||
    (machine.status || "").toLowerCase() === "active";

  const FALLBACK_SVG =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <rect width="100%" height="100%" fill="#141513" />
  <circle cx="400" cy="225" r="70" fill="none" stroke="#c94f2d" stroke-width="2" stroke-dasharray="6 6"/>
  <rect x="330" y="170" width="140" height="110" rx="8" fill="#1b1c19" stroke="#41433e" stroke-width="2"/>
  <text x="400" y="320" fill="#f5f5f0" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">MACHINE SYSTEMS</text>
</svg>
`);

  const resolveImage = (raw) => {
    if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "string") {
      return FALLBACK_SVG;
    }
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
      return raw;
    }
    if (raw.startsWith("/")) {
      return `https://node.aitechnotech.in/machine${raw}`;
    }
    return FALLBACK_SVG;
  };

  const rawCandidate =
    machine.imageUrl ||
    machine.image ||
    machine.thumbnail ||
    (Array.isArray(machine.images) && machine.images.length > 0 ? machine.images[0] : "");

  const mainImage = resolveImage(rawCandidate);

  const optionsList = Array.isArray(machine.availableOptions) ? machine.availableOptions : [];

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="detail-shell-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATOR CATALOG
            </div>
            <h1>{machine.name}</h1>
            <p className="welcome-subtitle">
              Machine specifications, compatible options, and publication status.
            </p>
          </div>
          <div className="header-actions">
            <Link className="btn btn-outline" to="/machines">
              <i className="bi bi-arrow-left"></i> Back to machines
            </Link>
            <Link className="btn btn-accent" to={`/add-machine?id=${machine._id || machine.slug || machineId}`}>
              <i className="bi bi-pencil-square"></i> Edit machine
            </Link>
          </div>
        </section>

        <section aria-label="Machine specifications details" className="machine-detail">
          <div className="machine-detail-media">
            <img
              alt={machine.name}
              src={mainImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_SVG;
              }}
            />
            <span className={`table-status ${isPublished ? "" : "status-draft"}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <article className="machine-detail-copy">
            <div className="machine-detail-heading">
              <div>
                <span className="form-kicker">
                  {machine.sku || machine.slug} · {(machine.category || "GENERAL").toUpperCase()}
                </span>
                <h2>{machine.name}</h2>
              </div>
              <span className="machine-detail-price">
                {formatPrice(machine.basePrice)}
                <small>Starting price</small>
              </span>
            </div>
            <p className="machine-detail-description">
              {machine.description || "Configurable industrial precision machine system."}
            </p>

            <dl className="record-fields">
              <div>
                <dt>Machine code / SKU</dt>
                <dd>{machine.sku || machine.slug}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{machine.category || "General"}</dd>
              </div>
              <div>
                <dt>Compatible options</dt>
                <dd>{optionsList.length} selectable add-ons</dd>
              </div>
              <div>
                <dt>Catalog status</dt>
                <dd>{isPublished ? "Published in Configurator" : "Draft"}</dd>
              </div>
              <div>
                <dt>Base currency</dt>
                <dd>{machine.currency || "USD"}</dd>
              </div>
              <div>
                <dt>Base price</dt>
                <dd>{formatPrice(machine.basePrice)}</dd>
              </div>
            </dl>

            {machine.specifications && Object.keys(machine.specifications).length > 0 && (
              <div className="mt-4">
                <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Engineering Specifications
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {Object.entries(machine.specifications).map(([key, val]) => (
                    <div key={key} style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border, #eee)" }}>
                      <span style={{ fontSize: "11px", color: "gray", display: "block" }}>{key}</span>
                      <strong style={{ fontSize: "13px" }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="machine-detail-actions mt-4">
              <Link className="btn btn-accent" to="/options">
                <i className="bi bi-sliders2"></i> View catalog options
              </Link>
              <Link className="btn btn-subtle" to="/renderings">
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

export default MachineDetails;
