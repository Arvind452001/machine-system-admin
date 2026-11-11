import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { contentApi } from "../api/contentApi";

const PAGES = [
  { slug: "privacy", label: "Privacy Policy", icon: "bi-shield-check", clientPath: "/privacy" },
  { slug: "terms", label: "Terms & Conditions", icon: "bi-file-earmark-text", clientPath: "/terms" },
];

const LegalContent = () => {
  const [activeSlug, setActiveSlug] = useState("privacy");
  const [activeTab, setActiveTab] = useState("edit"); // "edit" | "preview"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [publishedAt, setPublishedAt] = useState(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);

  const fetchContent = (slug) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    contentApi
      .getContentBySlug(slug)
      .then((res) => {
        const item = res?.data || res;
        if (item) {
          setTitle(item.title || "");
          setBody(item.body || "");
          setPublishedAt(item.publishedAt || item.updatedAt || null);
          setLastUpdatedBy(item.lastUpdatedBy || null);
        }
      })
      .catch((err) => {
        console.error("Failed to load content for " + slug, err);
        setError("Failed to load content. Please check server connection.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContent(activeSlug);
  }, [activeSlug]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and content body are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await contentApi.updateContent(activeSlug, {
        title: title.trim(),
        body: body.trim(),
      });

      if (res?.success) {
        setMessage(`"${res.data?.title || title}" updated successfully!`);
        setPublishedAt(new Date().toISOString());
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage("Content updated successfully!");
        setPublishedAt(new Date().toISOString());
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      console.error("Save error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not save changes. Please verify permissions.";
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Quick insertion helpers for editor
  const insertText = (template) => {
    const textarea = document.getElementById("content-body-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = body;

    const newVal = currentVal.substring(0, start) + template + currentVal.substring(end);
    setBody(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + template.length, start + template.length);
    }, 50);
  };

  // Parse preview sections
  const parseSections = (raw) => {
    const lines = (raw || "").split("\n");
    const sections = [];
    let current = null;

    for (const l of lines) {
      const line = l.trim();
      if (!line) continue;
      if (/^#{1,3}\s+/.test(line)) {
        if (current) sections.push(current);
        const heading = line.replace(/^#{1,3}\s+/, "").trim();
        current = { title: heading, paragraphs: [] };
        continue;
      }
      if (current) {
        current.paragraphs.push(line);
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  const sectionsList = parseSections(body);

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Legal &amp; Policy Content</strong>
    </>
  );

  const activePageObj = PAGES.find((p) => p.slug === activeSlug);

  return (
    <AdminLayout breadcrumb={breadcrumb} bodyClass="form-page">
      <div className="container-fluid page-wrap" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <section className="content-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>CONTENT MANAGEMENT SYSTEM
            </div>
            <h1>Legal &amp; Policy Content</h1>
            <p className="welcome-subtitle">
              Manage public customer-facing legal terms, privacy declarations, and regulatory disclosures.
            </p>
          </div>
          <div className="content-header-actions" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <a
              href={`http://localhost:5173${activePageObj?.clientPath}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dark"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "0.6rem 1rem",
                borderRadius: "6px",
              }}
            >
              <i className="bi bi-box-arrow-up-right"></i> View Live Site
            </a>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "0.6rem 1.25rem",
                borderRadius: "6px",
                background: "#c0392b",
                borderColor: "#c0392b",
                color: "#fff",
              }}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle"></i> Save &amp; Publish
                </>
              )}
            </button>
          </div>
        </section>

        {/* Page Selector Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.75rem" }}>
          {PAGES.map((page) => {
            const isSelected = activeSlug === page.slug;
            return (
              <button
                key={page.slug}
                onClick={() => setActiveSlug(page.slug)}
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "6px",
                  border: isSelected ? "1px solid #c0392b" : "1px solid #d1d5db",
                  background: isSelected ? "#c0392b" : "#fff",
                  color: isSelected ? "#fff" : "#374151",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <i className={`bi ${page.icon}`}></i>
                {page.label}
              </button>
            );
          })}
        </div>

        {/* Alerts */}
        {message && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
              borderRadius: "6px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ fontSize: "1.1rem" }}></i>
            <span style={{ fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "1.1rem" }}></i>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Status / Meta bar */}
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "0.85rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "center",
            fontSize: "0.825rem",
            color: "#6b7280",
          }}
        >
          <div>
            <strong style={{ color: "#111827" }}>Route:</strong>{" "}
            <code>api/v1/content/{activeSlug}</code>
          </div>
          <div>
            <strong style={{ color: "#111827" }}>Sections:</strong>{" "}
            <span>{sectionsList.length} defined</span>
          </div>
          <div>
            <strong style={{ color: "#111827" }}>Status:</strong>{" "}
            <span style={{ color: "#059669", fontWeight: 600 }}>
              <i className="bi bi-circle-fill" style={{ fontSize: "0.55rem", marginRight: "4px" }}></i>
              Published Live
            </span>
          </div>
          {publishedAt && (
            <div>
              <strong style={{ color: "#111827" }}>Last Published:</strong>{" "}
              <span>{new Date(publishedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Editor / Preview switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "5px",
                border: activeTab === "edit" ? "1px solid #111827" : "1px solid #e5e7eb",
                background: activeTab === "edit" ? "#111827" : "#fff",
                color: activeTab === "edit" ? "#fff" : "#4b5563",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className="bi bi-code-slash" style={{ marginRight: "6px" }}></i>
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "5px",
                border: activeTab === "preview" ? "1px solid #111827" : "1px solid #e5e7eb",
                background: activeTab === "preview" ? "#111827" : "#fff",
                color: activeTab === "preview" ? "#fff" : "#4b5563",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className="bi bi-eye" style={{ marginRight: "6px" }}></i>
              Live Preview
            </button>
          </div>

          {activeTab === "edit" && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => insertText("\n\n### 1. New Section Title\nSection content details here...")}
                className="btn btn-sm btn-light"
                style={{ fontSize: "0.75rem", border: "1px solid #e5e7eb" }}
              >
                + Add Section (###)
              </button>
              <button
                type="button"
                onClick={() => insertText(" [Contact Us page](/contact) ")}
                className="btn btn-sm btn-light"
                style={{ fontSize: "0.75rem", border: "1px solid #e5e7eb" }}
              >
                + Link [text](/url)
              </button>
              <button
                type="button"
                onClick={() => insertText(" **bold text** ")}
                className="btn btn-sm btn-light"
                style={{ fontSize: "0.75rem", border: "1px solid #e5e7eb" }}
              >
                + Bold
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading policy data...</p>
          </div>
        ) : activeTab === "edit" ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {/* Title Field */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="content-title-input"
                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}
              >
                Page Title
              </label>
              <input
                id="content-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Privacy Policy"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            {/* Content Body Field */}
            <div>
              <label
                htmlFor="content-body-textarea"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Policy Content (Markdown supported)</span>
                <span style={{ fontWeight: 400, color: "#6b7280" }}>
                  Use <code>### 1. Title</code> for sections
                </span>
              </label>
              <textarea
                id="content-body-textarea"
                rows={18}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter policy content..."
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none",
                  resize: "vertical",
                  background: "#fafafa",
                  color: "#1f2937",
                }}
              />
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => fetchContent(activeSlug)}
                className="btn btn-outline-secondary"
                style={{ fontSize: "0.85rem" }}
              >
                Reset to Last Saved
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{
                  background: "#c0392b",
                  borderColor: "#c0392b",
                  fontSize: "0.85rem",
                  padding: "0.6rem 1.5rem",
                }}
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          /* Live Customer Preview */
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "2rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#c0392b", fontWeight: 700 }}>
                CUSTOMER PREVIEW MODE
              </span>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0", color: "#111827" }}>
                {title || "Untitled Page"}
              </h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2.5rem" }}>
              {/* Preview Sidebar */}
              <div style={{ borderRight: "1px solid #f3f4f6", paddingRight: "1.5rem" }}>
                <strong style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", letterSpacing: "1px", marginBottom: "0.75rem" }}>
                  ON THIS PAGE
                </strong>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {sectionsList.map((sec, idx) => (
                    <li key={idx} style={{ marginBottom: "0.5rem" }}>
                      <span
                        style={{
                          color: "#c0392b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "block",
                          lineHeight: "1.4",
                        }}
                      >
                        {sec.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preview Content */}
              <div>
                {sectionsList.length > 0 ? (
                  sectionsList.map((sec, idx) => (
                    <div key={idx} style={{ marginBottom: "2rem" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>
                        {sec.title}
                      </h3>
                      {sec.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#4b5563", marginBottom: "0.75rem" }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  ))
                ) : (
                  <div style={{ whiteSpace: "pre-wrap", color: "#4b5563", lineHeight: "1.7" }}>
                    {body}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </AdminLayout>
  );
};

export default LegalContent;
