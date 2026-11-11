import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { machinesApi } from "../api/machinesApi";

const UploadRendering = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [formData, setFormData] = useState({
    machine: "",
    view: "",
    alt: "",
    status: "In review",
  });

  useEffect(() => {
    let mounted = true;
    machinesApi
      .getMachines()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMachines(list);
      })
      .catch((err) => {
        console.warn("Could not load machines for rendering upload:", err.message);
      })
      .finally(() => {
        if (mounted) setLoadingMachines(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/renderings");
  };

  const breadcrumb = (
    <>
      <Link to="/renderings">Renderings</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>Upload rendering</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>VISUAL CONFIGURATION
            </div>
            <h1>Upload rendering</h1>
            <p className="welcome-subtitle">
              Add a product image to a machine's customer-facing configuration.
            </p>
          </div>
          <Link className="btn-subtle" to="/renderings">
            <i className="bi bi-arrow-left"></i> Back to renderings
          </Link>
        </section>

        <form
          className="form-layout"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">01 / RENDERING ASSET</span>
                <h2>Image details</h2>
              </div>
              <span className="required-note">* Required</span>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Machine *</span>
                <select
                  name="machine"
                  required
                  value={formData.machine}
                  onChange={handleChange}
                >
                  <option value="">
                    {loadingMachines ? "Loading machines..." : "Select machine"}
                  </option>
                  {machines.map((m) => {
                    const id = m._id || m.id;
                    const name = m.name || m.model || "Machine";
                    return (
                      <option key={id} value={name}>
                        {name} {m.model ? `(${m.model})` : ""}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="form-field">
                <span>View name *</span>
                <input
                  name="view"
                  placeholder="e.g. Front and tooling layout"
                  required
                  value={formData.view}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field field-wide">
                <span>Image file *</span>
                <input accept="image/*" name="image" type="file" required />
              </label>
              <label className="form-field">
                <span>Alt text *</span>
                <input
                  name="alt"
                  placeholder="Describe the machine image"
                  required
                  value={formData.alt}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Publication status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>In review</option>
                  <option>Published</option>
                </select>
              </label>
            </div>
          </section>
          <div className="form-actions">
            <Link className="btn-subtle" to="/renderings">
              Cancel
            </Link>
            <button className="btn btn-accent" type="submit">
              <i className="bi bi-upload"></i> Upload rendering
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default UploadRendering;
