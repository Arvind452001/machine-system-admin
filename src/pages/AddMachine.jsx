import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { machinesApi } from "../api/machinesApi";
import { categoryService } from "../services/categoryService";

const AddMachine = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState({
    error: "",
    success: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    category: "",
    price: "",
    description: "",
    status: "published",
  });

  // Load categories and existing machine details if in edit mode
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoadingCategories(true);
      try {
        const res = await machinesApi.getCategories();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.names)
          ? res.names
          : Array.isArray(res)
          ? res
          : [];

        if (active) {
          if (list.length > 0) {
            setCategories(list);
          } else {
            setCategories(categoryService.getCategoriesSync());
          }
        }
      } catch (err) {
        if (active) {
          setCategories(categoryService.getCategoriesSync());
        }
      } finally {
        if (active) setLoadingCategories(false);
      }

      if (!editId) return;

      try {
        const res = await machinesApi.getMachine(editId);
        const machine = res?.data || res;

        if (!active || !machine) return;

        setFormData({
          name: machine.name || "",
          model: machine.sku || machine.slug || "",
          category:
            typeof machine.category === "object"
              ? machine.category?.name || ""
              : machine.category || "",
          price: machine.basePrice ?? "",
          description: machine.description || "",
          status: machine.status || "published",
        });

        const image =
          machine.image ||
          machine.imageUrl ||
          machine.thumbnail ||
          machine.images?.[0]?.url ||
          machine.images?.[0] ||
          "";

        setExistingImage(
          typeof image === "string" ? image : image?.url || ""
        );
      } catch (err) {
        if (active) {
          setFeedback({
            error: "Could not load machine details.",
            success: "",
          });
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [editId]);

  // Clean up object URL on preview unmount
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback({ error: "", success: "" });

    if (!file.type.startsWith("image/")) {
      setFeedback({
        error: "Please select a valid image file.",
        success: "",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        error: "Image size must be 5 MB or less.",
        success: "",
      });
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("sku", formData.model.trim());
      payload.append("category", formData.category);
      payload.append("basePrice", String(Number(formData.price) || 0));
      payload.append("description", formData.description.trim());
      payload.append(
        "summary",
        formData.description.trim().slice(0, 100) || formData.name.trim()
      );
      payload.append("status", formData.status.toLowerCase());

      if (selectedImage) {
        payload.append("image", selectedImage);
      }

      if (editId) {
        await machinesApi.updateMachine(editId, payload);
        setFeedback({
          success: "Machine successfully updated!",
          error: "",
        });
      } else {
        await machinesApi.createMachine(payload);
        setFeedback({
          success: "Machine created successfully!",
          error: "",
        });
      }

      setTimeout(() => navigate("/machines"), 1000);
    } catch (err) {
      setFeedback({
        error: err.message || "Failed to save machine.",
        success: "",
      });
      setSubmitting(false);
    }
  };

  const breadcrumb = (
    <>
      <Link to="/machines">Machines</Link>
      <i className="bi bi-chevron-right"></i>
      <strong>{editId ? "Edit machine" : "Add machine"}</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="page-wrap">
        <section className="content-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONFIGURATOR CATALOG
            </div>
            <h1>{editId ? "Edit machine" : "Add machine"}</h1>
            <p className="welcome-subtitle">
              {editId
                ? "Update machine specifications, image and pricing."
                : "Create a machine listing and set its starting configuration."}
            </p>
          </div>
        </section>

        {feedback.error && (
          <div
            className="alert alert-danger mb-3"
            style={{
              background: "#fde8e8",
              color: "#9b1c1c",
              padding: "12px 16px",
              borderRadius: "6px",
            }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {feedback.error}
          </div>
        )}

        {feedback.success && (
          <div
            className="alert alert-success mb-3"
            style={{
              background: "#def7ec",
              color: "#03543f",
              padding: "12px 16px",
              borderRadius: "6px",
            }}
          >
            <i className="bi bi-check-circle me-2"></i>
            {feedback.success}
          </div>
        )}

        <form className="form-layout" onSubmit={handleSubmit}>
          <section className="form-panel">
            <div className="form-section-heading">
              <div>
                <span className="form-kicker">01 / MACHINE DETAILS</span>
                <h2>Machine information</h2>
              </div>
              <span className="required-note">* Required</span>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Machine name *</span>
                <input
                  autoComplete="off"
                  name="name"
                  placeholder="e.g. FX-420 Press"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Model code *</span>
                <input
                  autoComplete="off"
                  name="model"
                  placeholder="e.g. FW-FX420-01"
                  required
                  value={formData.model}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Category *</span>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">
                    {loadingCategories ? "Loading categories..." : "Select category"}
                  </option>
                  {categories.map((cat, i) => {
                    const catName = typeof cat === "string" ? cat : cat.name;
                    return (
                      <option key={cat._id || cat.id || i} value={catName}>
                        {catName}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>Base price *</span>
                <div className="input-prefix">
                  <span>$</span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="price"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </label>

              <label className="form-field field-wide">
                <span>Customer description</span>
                <textarea
                  name="description"
                  placeholder="Describe the machine and its primary capabilities"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </label>

              <label className="form-field">
                <span>Machine image</span>
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  name="image"
                  type="file"
                  onChange={handleImageChange}
                />
                {(imagePreview || existingImage) && (
                  <div
                    style={{
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={imagePreview || existingImage}
                      alt="Preview"
                      style={{
                        width: "48px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #e2e2de",
                      }}
                    />
                    <small style={{ color: "#777871" }}>
                      {selectedImage ? selectedImage.name : "Current image"}
                    </small>
                  </div>
                )}
              </label>

              <label className="form-field">
                <span>Publication status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
          </section>

          <div className="form-actions">
            <Link className="btn-subtle" to="/machines">
              Cancel
            </Link>
            <button
              className="btn btn-accent"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>{" "}
                  {editId ? "Update machine" : "Save machine"}
                </>
              )}
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default AddMachine;
