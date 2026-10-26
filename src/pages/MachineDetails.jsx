import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { machinesApi } from "../api/machinesApi";

const FALLBACK_DETAIL = {
  _id: "6ad9fc28e39daefd54e568ff",
  name: "MS-L4000 Ultra-Speed Fiber Laser Cutter",
  slug: "ms-l4000",
  sku: "MS-LC-4000-FIBER",
  category: "Laser processing",
  basePrice: 228000,
  description:
    "Cuts up to 40mm stainless steel and copper with clean-edge nitrogen cutting technology. Features linear motor drives achieving 2.8G acceleration.",
  status: "published",
  images: [
    "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
  ],
  availableOptions: [
    { name: "High-Pressure Coolant (70 Bar)", code: "OPT-COOL-70B", priceDelta: 8500 },
    { name: "Automatic Robotic Arm Workpiece Loading", code: "OPT-AUTO-ROBOT", priceDelta: 28000 },
    { name: "Optical Tool Setter & Renishaw Probe", code: "OPT-TOOL-PROBE", priceDelta: 6200 },
  ],
  specifications: {
    "Laser Power": "12 kW Fiber Source",
    "Working Sheet Size": "4000 x 2000 mm",
    "Max Positioning Speed": "180 m/min",
    "Acceleration": "2.8 G",
  },
};

const MachineDetails = () => {
  const [searchParams] = useSearchParams();
  const machineId = searchParams.get("id") || "6ad9fc28e39daefd54e568ff";

  const [machine, setMachine] = useState(FALLBACK_DETAIL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    machinesApi
      .getMachine(machineId)
      .then((res) => {
        if (!mounted) return;
        const m = res?.data || res;
        if (m) {
          setMachine(m);
        }
      })
      .catch((err) => {
        console.warn("Using offline fallback in MachineDetails:", err.message);
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
      <strong>{machine.name || "Machine details"}</strong>
    </>
  );

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const isPublished =
    (machine.status || "").toLowerCase() === "published" ||
    (machine.status || "").toLowerCase() === "active";

  const mainImage =
    Array.isArray(machine.images) && machine.images.length > 0
      ? machine.images[0]
      : "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=85";

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
            <img alt={machine.name} src={mainImage} />
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
