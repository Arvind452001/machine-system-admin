import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { contentApi } from "../api/contentApi";

const PAGES = [
  { slug: "privacy", label: "Privacy Policy", icon: "bi-shield-check", clientPath: "/privacy" },
  { slug: "terms", label: "Terms & Conditions", icon: "bi-file-earmark-text", clientPath: "/terms" },
  { slug: "about", label: "About Us Page", icon: "bi-building", clientPath: "/about" },
  { slug: "how-it-works", label: "How It Works", icon: "bi-diagram-3", clientPath: "/how-it-works" },
];

const defaultAboutState = {
  hero: {
    eyebrow: "People, machines, and know-how",
    title: "Good production starts with the right fit.",
    subtitle:
      "We bring industrial machinery and practical guidance together, helping you explore options that make sense for your work—not just a catalogue.",
  },
  stories: [],
};

const defaultHowItWorksState = {
  hero: {
    eyebrow: "A clearer path to the right machine",
    title: "From first look to the right quote.",
    subtitle:
      "Explore machine platforms, shape a configuration around your process, and speak with a representative before you make a decision.",
    artTag: "MACHINE SYSTEMS / YOUR PROCESS",
    artText: "Configure. Compare. Connect.",
  },
  sectionHeading: {
    eyebrow: "Four straightforward steps",
    title: "Good decisions start with good questions.",
    description:
      "There is no need to have every detail figured out before you begin. Use the catalogue to explore, then bring your priorities to a local expert.",
  },
  steps: [],
  bottomSection: {
    eyebrow: "Before you enquire",
    title: "Bring what you know.",
    description:
      "Helpful details can include the material and dimensions of your parts, target tolerances, current process, expected volumes, and any space or installation considerations. If you are still exploring, that is a good place to start too.",
    linkText: "Explore the machine range",
    linkUrl: "/machines",
  },
};

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

  // Dedicated States
  const [aboutState, setAboutState] = useState(defaultAboutState);
  const [howItWorksState, setHowItWorksState] = useState(defaultHowItWorksState);

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

          if (slug === "about") {
            try {
              if (typeof item.body === "string" && item.body.trim().startsWith("{")) {
                const parsed = JSON.parse(item.body);
                setAboutState({
                  hero: parsed.hero || defaultAboutState.hero,
                  stories: Array.isArray(parsed.stories) ? parsed.stories : [],
                });
              } else if (typeof item.body === "object") {
                setAboutState(item.body);
              }
            } catch (e) {
              console.warn("Could not parse about JSON:", e);
            }
          } else if (slug === "how-it-works") {
            try {
              if (typeof item.body === "string" && item.body.trim().startsWith("{")) {
                const parsed = JSON.parse(item.body);
                setHowItWorksState({
                  hero: parsed.hero || defaultHowItWorksState.hero,
                  sectionHeading: parsed.sectionHeading || defaultHowItWorksState.sectionHeading,
                  steps: Array.isArray(parsed.steps) ? parsed.steps : defaultHowItWorksState.steps,
                  bottomSection: parsed.bottomSection || defaultHowItWorksState.bottomSection,
                });
              } else if (typeof item.body === "object") {
                setHowItWorksState(item.body);
              }
            } catch (e) {
              console.warn("Could not parse how-it-works JSON:", e);
            }
          }
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

    let finalTitle = title.trim();
    let finalBody = body.trim();

    if (activeSlug === "about") {
      if (!finalTitle) finalTitle = "About MACHINE Systems";
      finalBody = JSON.stringify(aboutState, null, 2);
    } else if (activeSlug === "how-it-works") {
      if (!finalTitle) finalTitle = "How It Works";
      finalBody = JSON.stringify(howItWorksState, null, 2);
    } else {
      if (!finalTitle || !finalBody) {
        setError("Title and content body are required.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await contentApi.updateContent(activeSlug, {
        title: finalTitle,
        body: finalBody,
      });

      if (res?.success) {
        setMessage(`"${res.data?.title || finalTitle}" updated successfully!`);
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

  // Parse preview sections for privacy/terms
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

  // About story management helpers
  const handleAboutHeroChange = (field, val) => {
    setAboutState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: val,
      },
    }));
  };

  const handleStoryChange = (index, field, val) => {
    setAboutState((prev) => {
      const updated = [...prev.stories];
      updated[index] = {
        ...updated[index],
        [field]: val,
      };
      return { ...prev, stories: updated };
    });
  };

  const handleStoryParagraphChange = (storyIndex, pIndex, val) => {
    setAboutState((prev) => {
      const updated = [...prev.stories];
      const story = { ...updated[storyIndex] };
      const paragraphs = [...(story.paragraphs || [])];
      paragraphs[pIndex] = val;
      story.paragraphs = paragraphs;
      updated[storyIndex] = story;
      return { ...prev, stories: updated };
    });
  };

  const handleAddParagraph = (storyIndex) => {
    setAboutState((prev) => {
      const updated = [...prev.stories];
      const story = { ...updated[storyIndex] };
      story.paragraphs = [...(story.paragraphs || []), ""];
      updated[storyIndex] = story;
      return { ...prev, stories: updated };
    });
  };

  const handleRemoveParagraph = (storyIndex, pIndex) => {
    setAboutState((prev) => {
      const updated = [...prev.stories];
      const story = { ...updated[storyIndex] };
      story.paragraphs = (story.paragraphs || []).filter((_, idx) => idx !== pIndex);
      updated[storyIndex] = story;
      return { ...prev, stories: updated };
    });
  };

  const handleAddStory = () => {
    const newIndex = (aboutState.stories || []).length + 1;
    const newStory = {
      id: `story-${Date.now()}`,
      tag: `0${newIndex} / NEW STORY`,
      eyebrow: "Our Focus",
      title: "New Story Title",
      paragraphs: ["Add your story description text here."],
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Industrial factory machinery",
      isReversed: newIndex % 2 === 0,
      linkText: "Learn more",
      linkUrl: "/machines",
    };
    setAboutState((prev) => ({
      ...prev,
      stories: [...(prev.stories || []), newStory],
    }));
  };

  const handleRemoveStory = (index) => {
    if (window.confirm("Are you sure you want to delete this story card?")) {
      setAboutState((prev) => ({
        ...prev,
        stories: prev.stories.filter((_, idx) => idx !== index),
      }));
    }
  };

  const handleMoveStory = (index, direction) => {
    setAboutState((prev) => {
      const stories = [...prev.stories];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= stories.length) return prev;
      const temp = stories[index];
      stories[index] = stories[targetIndex];
      stories[targetIndex] = temp;
      return { ...prev, stories };
    });
  };

  // How It Works helpers
  const handleHowItWorksChange = (section, field, val) => {
    setHowItWorksState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: val,
      },
    }));
  };

  const handleStepChange = (index, field, val) => {
    setHowItWorksState((prev) => {
      const updated = [...prev.steps];
      updated[index] = {
        ...updated[index],
        [field]: val,
      };
      return { ...prev, steps: updated };
    });
  };

  const handleAddStep = () => {
    const newIndex = (howItWorksState.steps || []).length + 1;
    const newStep = {
      id: `step-${Date.now()}`,
      stepTag: `0${newIndex} / NEW STEP`,
      title: "Step Title",
      description: "Describe what the customer does in this step.",
    };
    setHowItWorksState((prev) => ({
      ...prev,
      steps: [...(prev.steps || []), newStep],
    }));
  };

  const handleRemoveStep = (index) => {
    if (window.confirm("Delete this process step?")) {
      setHowItWorksState((prev) => ({
        ...prev,
        steps: prev.steps.filter((_, idx) => idx !== index),
      }));
    }
  };

  const handleMoveStep = (index, direction) => {
    setHowItWorksState((prev) => {
      const steps = [...prev.steps];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= steps.length) return prev;
      const temp = steps[index];
      steps[index] = steps[targetIndex];
      steps[targetIndex] = temp;
      return { ...prev, steps };
    });
  };

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Site &amp; Policy Content</strong>
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
            <h1>Website &amp; Policy Content</h1>
            <p className="welcome-subtitle">
              Manage public customer-facing pages including How It Works, About Us, Privacy Policy, and Terms &amp; Conditions.
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
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.75rem", overflowX: "auto" }}>
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
                  whiteSpace: "nowrap",
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
          {activePageObj && (
            <div>
              <strong style={{ color: "#111827" }}>Page URL:</strong>{" "}
              <a
                href={`http://localhost:5173${activePageObj.clientPath}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#c94f2d",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="View live page on public site"
              >
                <span>{activePageObj.clientPath}</span>
                <i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.75rem" }}></i>
              </a>
            </div>
          )}
          <div>
            <strong style={{ color: "#111827" }}>Type:</strong>{" "}
            <span>
              {activeSlug === "about"
                ? `${aboutState.stories?.length || 0} Stories`
                : activeSlug === "how-it-works"
                ? `${howItWorksState.steps?.length || 0} Steps`
                : `${sectionsList.length} Sections`}
            </span>
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
              <i className="bi bi-pencil-square" style={{ marginRight: "6px" }}></i>
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
              Live Customer Preview
            </button>
          </div>

          {activeTab === "edit" && (activeSlug === "privacy" || activeSlug === "terms") && (
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

          {activeTab === "edit" && activeSlug === "about" && (
            <button
              type="button"
              onClick={handleAddStory}
              className="btn btn-sm btn-outline-dark"
              style={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              <i className="bi bi-plus-lg"></i> Add New Story Card
            </button>
          )}

          {activeTab === "edit" && activeSlug === "how-it-works" && (
            <button
              type="button"
              onClick={handleAddStep}
              className="btn btn-sm btn-outline-dark"
              style={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              <i className="bi bi-plus-lg"></i> Add New Process Step
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading content...</p>
          </div>
        ) : activeTab === "edit" ? (
          activeSlug === "how-it-works" ? (
            /* HOW IT WORKS DEDICATED CMS */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Hero Settings */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    <i className="bi bi-card-heading" style={{ marginRight: "8px", color: "#c0392b" }}></i>
                    Hero Section
                  </h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Hero Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.hero?.eyebrow || ""}
                      onChange={(e) => handleHowItWorksChange("hero", "eyebrow", e.target.value)}
                      placeholder="e.g. A clearer path to the right machine"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.hero?.title || ""}
                      onChange={(e) => handleHowItWorksChange("hero", "title", e.target.value)}
                      placeholder="e.g. From first look to the right quote."
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={howItWorksState.hero?.subtitle || ""}
                    onChange={(e) => handleHowItWorksChange("hero", "subtitle", e.target.value)}
                    placeholder="Brief intro description..."
                    style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", lineHeight: "1.5" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Hero Badge Art Tag
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.hero?.artTag || ""}
                      onChange={(e) => handleHowItWorksChange("hero", "artTag", e.target.value)}
                      placeholder="e.g. MACHINE SYSTEMS / YOUR PROCESS"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Hero Badge Slogan
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.hero?.artText || ""}
                      onChange={(e) => handleHowItWorksChange("hero", "artText", e.target.value)}
                      placeholder="e.g. Configure. Compare. Connect."
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Steps Section Heading Settings */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    <i className="bi bi-list-ol" style={{ marginRight: "8px", color: "#c0392b" }}></i>
                    Steps Section Header
                  </h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.sectionHeading?.eyebrow || ""}
                      onChange={(e) => handleHowItWorksChange("sectionHeading", "eyebrow", e.target.value)}
                      placeholder="e.g. Four straightforward steps"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Section Headline
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.sectionHeading?.title || ""}
                      onChange={(e) => handleHowItWorksChange("sectionHeading", "title", e.target.value)}
                      placeholder="e.g. Good decisions start with good questions."
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                    Section Description
                  </label>
                  <textarea
                    rows={2}
                    value={howItWorksState.sectionHeading?.description || ""}
                    onChange={(e) => handleHowItWorksChange("sectionHeading", "description", e.target.value)}
                    placeholder="Short description..."
                    style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                  />
                </div>
              </div>

              {/* Process Steps Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    Process Steps ({(howItWorksState.steps || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="btn btn-sm btn-primary"
                    style={{ background: "#c0392b", borderColor: "#c0392b", fontSize: "0.8rem" }}
                  >
                    <i className="bi bi-plus-lg"></i> Add Step
                  </button>
                </div>

                {(howItWorksState.steps || []).map((step, index) => (
                  <div
                    key={step.id || index}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1.25rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #f3f4f6",
                        paddingBottom: "0.6rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            background: "#111827",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Step {index + 1}
                        </span>
                        <strong style={{ fontSize: "0.95rem", color: "#111827" }}>
                          {step.stepTag || `0${index + 1} / STEP`}
                        </strong>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(index, -1)}
                          disabled={index === 0}
                          className="btn btn-sm btn-outline-secondary"
                          title="Move Up"
                        >
                          <i className="bi bi-arrow-up"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(index, 1)}
                          disabled={index === howItWorksState.steps.length - 1}
                          className="btn btn-sm btn-outline-secondary"
                          title="Move Down"
                        >
                          <i className="bi bi-arrow-down"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Step"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                          Step Tag Label
                        </label>
                        <input
                          type="text"
                          value={step.stepTag || ""}
                          onChange={(e) => handleStepChange(index, "stepTag", e.target.value)}
                          placeholder="e.g. 01 / SELECT PLATFORM"
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                          Step Title
                        </label>
                        <input
                          type="text"
                          value={step.title || ""}
                          onChange={(e) => handleStepChange(index, "title", e.target.value)}
                          placeholder="e.g. Choose a machine"
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                        Step Description
                      </label>
                      <textarea
                        rows={2}
                        value={step.description || ""}
                        onChange={(e) => handleStepChange(index, "description", e.target.value)}
                        placeholder="Detail process explanation..."
                        style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem", lineHeight: "1.5" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Section (Before you enquire) */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    <i className="bi bi-box-arrow-in-down-right" style={{ marginRight: "8px", color: "#c0392b" }}></i>
                    Bottom Section (Before You Enquire)
                  </h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.bottomSection?.eyebrow || ""}
                      onChange={(e) => handleHowItWorksChange("bottomSection", "eyebrow", e.target.value)}
                      placeholder="e.g. Before you enquire"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Headline
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.bottomSection?.title || ""}
                      onChange={(e) => handleHowItWorksChange("bottomSection", "title", e.target.value)}
                      placeholder="e.g. Bring what you know."
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={howItWorksState.bottomSection?.description || ""}
                    onChange={(e) => handleHowItWorksChange("bottomSection", "description", e.target.value)}
                    placeholder="Advisory notes for customer..."
                    style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Button Link Text
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.bottomSection?.linkText || ""}
                      onChange={(e) => handleHowItWorksChange("bottomSection", "linkText", e.target.value)}
                      placeholder="e.g. Explore the machine range"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Button Target URL
                    </label>
                    <input
                      type="text"
                      value={howItWorksState.bottomSection?.linkUrl || ""}
                      onChange={(e) => handleHowItWorksChange("bottomSection", "linkUrl", e.target.value)}
                      placeholder="e.g. /machines"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => fetchContent("how-it-works")}
                  className="btn btn-outline-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  Reset Changes
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
                  {saving ? "Saving Changes..." : "Save & Publish How It Works"}
                </button>
              </div>
            </div>
          ) : activeSlug === "about" ? (
            /* ABOUT US VISUAL STORY CMS */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Hero Settings Card */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    <i className="bi bi-card-heading" style={{ marginRight: "8px", color: "#c0392b" }}></i>
                    Hero Section
                  </h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={aboutState.hero?.eyebrow || ""}
                      onChange={(e) => handleAboutHeroChange("eyebrow", e.target.value)}
                      placeholder="e.g. People, machines, and know-how"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={aboutState.hero?.title || ""}
                      onChange={(e) => handleAboutHeroChange("title", e.target.value)}
                      placeholder="e.g. Good production starts with the right fit."
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={aboutState.hero?.subtitle || ""}
                    onChange={(e) => handleAboutHeroChange("subtitle", e.target.value)}
                    placeholder="Brief intro description..."
                    style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", lineHeight: "1.5" }}
                  />
                </div>
              </div>

              {/* Story Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    Story Cards ({(aboutState.stories || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddStory}
                    className="btn btn-sm btn-primary"
                    style={{ background: "#c0392b", borderColor: "#c0392b", fontSize: "0.8rem" }}
                  >
                    <i className="bi bi-plus-lg"></i> Add Story
                  </button>
                </div>

                {(aboutState.stories || []).map((story, index) => (
                  <div
                    key={story.id || index}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Story Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #f3f4f6",
                        paddingBottom: "0.75rem",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            background: "#111827",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Story #{index + 1}
                        </span>
                        <strong style={{ fontSize: "1rem", color: "#111827" }}>
                          {story.tag || `Story ${index + 1}`}
                        </strong>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveStory(index, -1)}
                          disabled={index === 0}
                          className="btn btn-sm btn-outline-secondary"
                          title="Move Up"
                        >
                          <i className="bi bi-arrow-up"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStory(index, 1)}
                          disabled={index === aboutState.stories.length - 1}
                          className="btn btn-sm btn-outline-secondary"
                          title="Move Down"
                        >
                          <i className="bi bi-arrow-down"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStory(index)}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Story"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
                      {/* Image Details */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                          Story Image URL
                        </label>
                        <input
                          type="text"
                          value={story.image || ""}
                          onChange={(e) => handleStoryChange(index, "image", e.target.value)}
                          placeholder="https://..."
                          style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                        />
                        <div
                          style={{
                            marginTop: "0.75rem",
                            height: "140px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          {story.image ? (
                            <img
                              src={story.image}
                              alt={story.imageAlt || "Preview"}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>No image set</span>
                          )}
                        </div>

                        <div style={{ marginTop: "0.75rem" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#374151", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={Boolean(story.isReversed)}
                              onChange={(e) => handleStoryChange(index, "isReversed", e.target.checked)}
                            />
                            <span>Reverse Layout (Image on right)</span>
                          </label>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                              Caption Tag
                            </label>
                            <input
                              type="text"
                              value={story.tag || ""}
                              onChange={(e) => handleStoryChange(index, "tag", e.target.value)}
                              placeholder="e.g. 01 / OUR PURPOSE"
                              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                              Eyebrow
                            </label>
                            <input
                              type="text"
                              value={story.eyebrow || ""}
                              onChange={(e) => handleStoryChange(index, "eyebrow", e.target.value)}
                              placeholder="e.g. What drives us"
                              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                            Story Headline
                          </label>
                          <input
                            type="text"
                            value={story.title || ""}
                            onChange={(e) => handleStoryChange(index, "title", e.target.value)}
                            placeholder="Headline text..."
                            style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600 }}
                          />
                        </div>

                        {/* Paragraphs */}
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                            <span>Paragraphs</span>
                            <button
                              type="button"
                              onClick={() => handleAddParagraph(index)}
                              style={{ border: "none", background: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                            >
                              + Add Paragraph
                            </button>
                          </label>
                          {(story.paragraphs || []).map((p, pIdx) => (
                            <div key={pIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                              <textarea
                                rows={2}
                                value={p}
                                onChange={(e) => handleStoryParagraphChange(index, pIdx, e.target.value)}
                                placeholder={`Paragraph ${pIdx + 1}...`}
                                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem", lineHeight: "1.5" }}
                              />
                              {(story.paragraphs || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParagraph(index, pIdx)}
                                  className="btn btn-sm btn-outline-secondary"
                                  style={{ alignSelf: "flex-start" }}
                                  title="Remove paragraph"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Optional Link */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                              Button Link Text (Optional)
                            </label>
                            <input
                              type="text"
                              value={story.linkText || ""}
                              onChange={(e) => handleStoryChange(index, "linkText", e.target.value)}
                              placeholder="e.g. Explore machine range"
                              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                              Button Target URL (Optional)
                            </label>
                            <input
                              type="text"
                              value={story.linkUrl || ""}
                              onChange={(e) => handleStoryChange(index, "linkUrl", e.target.value)}
                              placeholder="e.g. /machines"
                              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => fetchContent("about")}
                  className="btn btn-outline-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  Reset Changes
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
                  {saving ? "Saving Changes..." : "Save & Publish About Page"}
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD MARKDOWN EDITOR (Privacy & Terms) */
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
          )
        ) : (
          /* Live Customer Preview */
          activeSlug === "how-it-works" ? (
            /* HOW IT WORKS PREVIEW */
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "2rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#c0392b", fontWeight: 700 }}>
                  HOW IT WORKS PREVIEW
                </span>
                <p style={{ margin: "0.5rem 0 0.25rem", color: "#c0392b", fontSize: "0.85rem", fontWeight: 600 }}>
                  {howItWorksState.hero?.eyebrow}
                </p>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 700, margin: "0.5rem 0", color: "#111827" }}>
                  {howItWorksState.hero?.title}
                </h1>
                <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: "800px", lineHeight: "1.6" }}>
                  {howItWorksState.hero?.subtitle}
                </p>
              </div>

              {/* Steps heading */}
              <div style={{ marginBottom: "2rem" }}>
                <p style={{ color: "#c0392b", fontSize: "0.8rem", fontWeight: 600, margin: "0 0 0.25rem" }}>
                  {howItWorksState.sectionHeading?.eyebrow}
                </p>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem" }}>
                  {howItWorksState.sectionHeading?.title}
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                  {howItWorksState.sectionHeading?.description}
                </p>
              </div>

              {/* Steps Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                {(howItWorksState.steps || []).map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "1.25rem",
                      background: "#fafafa",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#c0392b", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>
                      {step.stepTag}
                    </span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom split */}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "2rem", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#c0392b", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                    {howItWorksState.bottomSection?.eyebrow}
                  </span>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#111827" }}>
                    {howItWorksState.bottomSection?.title}
                  </h2>
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: "1.7", marginBottom: "1rem" }}>
                    {howItWorksState.bottomSection?.description}
                  </p>
                  {howItWorksState.bottomSection?.linkText && howItWorksState.bottomSection?.linkUrl && (
                    <span style={{ color: "#c0392b", fontWeight: 600, fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      {howItWorksState.bottomSection?.linkText} <i className="bi bi-arrow-right"></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : activeSlug === "about" ? (
            /* ABOUT PREVIEW */
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "2rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#c0392b", fontWeight: 700 }}>
                  ABOUT US PREVIEW
                </span>
                <p style={{ margin: "0.5rem 0 0.25rem", color: "#c0392b", fontSize: "0.85rem", fontWeight: 600 }}>
                  {aboutState.hero?.eyebrow}
                </p>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 700, margin: "0.5rem 0", color: "#111827" }}>
                  {aboutState.hero?.title}
                </h1>
                <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: "800px", lineHeight: "1.6" }}>
                  {aboutState.hero?.subtitle}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                {(aboutState.stories || []).map((story, idx) => {
                  const isRev = Boolean(story.isReversed);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: isRev ? "1.2fr 1fr" : "1fr 1.2fr",
                        gap: "2.5rem",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ order: isRev ? 2 : 1 }}>
                        <div
                          style={{
                            height: "260px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            background: "#f3f4f6",
                            position: "relative",
                          }}
                        >
                          <img
                            src={story.image}
                            alt={story.imageAlt || story.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              left: "10px",
                              background: "rgba(0,0,0,0.75)",
                              color: "#fff",
                              fontSize: "0.7rem",
                              padding: "4px 8px",
                              borderRadius: "3px",
                              letterSpacing: "1px",
                            }}
                          >
                            {story.tag}
                          </span>
                        </div>
                      </div>
                      <div style={{ order: isRev ? 1 : 2 }}>
                        {story.eyebrow && (
                          <span style={{ fontSize: "0.8rem", color: "#c0392b", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                            {story.eyebrow}
                          </span>
                        )}
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.85rem" }}>
                          {story.title}
                        </h2>
                        {(story.paragraphs || []).map((p, pIdx) => (
                          <p key={pIdx} style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#4b5563", marginBottom: "0.75rem" }}>
                            {p}
                          </p>
                        ))}
                        {story.linkText && story.linkUrl && (
                          <span style={{ color: "#c0392b", fontWeight: 600, fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                            {story.linkText} <i className="bi bi-arrow-right"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LEGAL PREVIEW (Privacy & Terms) */
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
          )
        )}
      </div>
      <Footer />
    </AdminLayout>
  );
};

export default LegalContent;
