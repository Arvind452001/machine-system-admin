import { useState, useMemo, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import defaultTiltData from "../data/tiltRotatorData.json";

const STORAGE_KEY = "tiltRotatorConfig_v2";

// Helper to compress uploaded images via canvas to ensure fast preview & prevent localStorage quota overflow
const shrinkDataUrl = (dataUrl, maxEdge = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const longest = Math.max(img.width, img.height) || 1;
      const scale = Math.min(1, maxEdge / longest);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

const TiltRotatorAdmin = () => {
  const fileInputRef = useRef(null);
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not parse config from localStorage:", e);
    }
    return defaultTiltData;
  });

  const [activeModelIdx, setActiveModelIdx] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState("steps"); // "steps" | "renders"

  const flash = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const saveConfig = (newConfig) => {
    // 1. Optimistic state update so UI and previews reflect IMMEDIATELY
    setConfig(newConfig);

    // 2. Persist to localStorage safely
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      window.dispatchEvent(new Event("storage"));
      flash("Configuration saved successfully!");
    } catch (err) {
      console.warn("Storage quota warning:", err);
      flash("Saved in memory! (Browser storage is near capacity)");
    }
  };

  const activeModel = useMemo(() => {
    if (!config?.models || config.models.length === 0) return null;
    return config.models[activeModelIdx] || config.models[0];
  }, [config, activeModelIdx]);

  // Statistics
  const stats = useMemo(() => {
    const totalModels = config?.models?.length || 0;
    const totalSteps = activeModel?.steps?.length || 0;
    let totalOptions = 0;
    if (activeModel?.steps) {
      activeModel.steps.forEach((s) => {
        totalOptions += s.options?.length || 0;
      });
    }
    const totalRenders = Object.keys(config?.combinationImages || {}).length;
    return { totalModels, totalSteps, totalOptions, totalRenders };
  }, [config, activeModel]);

  // Model Operations
  const handleUpdateModel = (field, val) => {
    const updatedModels = [...config.models];
    updatedModels[activeModelIdx] = {
      ...updatedModels[activeModelIdx],
      [field]: val,
    };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleAddModel = () => {
    const newId = `model_${Date.now()}`;
    const newModel = {
      id: newId,
      name: "VRX New Model",
      description: "For excavator class 6-10 ton",
      image: "",
      steps: [
        {
          id: "step_hose",
          name: "1. Hose system",
          options: [
            { id: "opt_h2", name: "2-Hose System", price: 0, description: "Direct dual-line hydraulics" }
          ]
        }
      ]
    };
    const updated = [...config.models, newModel];
    saveConfig({ ...config, models: updated });
    setActiveModelIdx(updated.length - 1);
  };

  const handleDeleteModel = (idx) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;
    const updated = config.models.filter((_, i) => i !== idx);
    saveConfig({ ...config, models: updated });
    setActiveModelIdx(Math.max(0, activeModelIdx - 1));
  };

  // Step Operations
  const handleAddStep = () => {
    const stepNum = (activeModel.steps?.length || 0) + 1;
    const newStep = {
      id: `step_${Date.now()}`,
      name: `${stepNum}. New Module Stage`,
      options: [
        { id: `opt_${Date.now()}`, name: "Standard Specification", price: 0, description: "" }
      ]
    };
    const updatedModels = [...config.models];
    updatedModels[activeModelIdx] = {
      ...activeModel,
      steps: [...(activeModel.steps || []), newStep],
    };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleUpdateStep = (stepIdx, field, val) => {
    const updatedModels = [...config.models];
    const steps = [...activeModel.steps];
    steps[stepIdx] = { ...steps[stepIdx], [field]: val };
    updatedModels[activeModelIdx] = { ...activeModel, steps };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleDeleteStep = (stepIdx) => {
    if (!window.confirm("Delete this step and all its options?")) return;
    const updatedModels = [...config.models];
    const steps = activeModel.steps.filter((_, i) => i !== stepIdx);
    updatedModels[activeModelIdx] = { ...activeModel, steps };
    saveConfig({ ...config, models: updatedModels });
  };

  // Option Operations
  const handleAddOption = (stepIdx) => {
    const newOpt = {
      id: `opt_${Date.now()}`,
      name: "New Modular Option",
      price: 0,
      description: "",
      partImage: "",
      requires: [],
    };
    const updatedModels = [...config.models];
    const steps = [...activeModel.steps];
    steps[stepIdx] = {
      ...steps[stepIdx],
      options: [...steps[stepIdx].options, newOpt],
    };
    updatedModels[activeModelIdx] = { ...activeModel, steps };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleUpdateOption = (stepIdx, optIdx, field, val) => {
    const updatedModels = [...config.models];
    const steps = [...activeModel.steps];
    const options = [...steps[stepIdx].options];
    options[optIdx] = { ...options[optIdx], [field]: val };
    steps[stepIdx] = { ...steps[stepIdx], options };
    updatedModels[activeModelIdx] = { ...activeModel, steps };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleMoveOption = (stepIdx, optIdx, direction) => {
    const updatedModels = [...config.models];
    const steps = [...activeModel.steps];
    const options = [...steps[stepIdx].options];
    const targetIdx = optIdx + direction;
    if (targetIdx < 0 || targetIdx >= options.length) return;
    const temp = options[optIdx];
    options[optIdx] = options[targetIdx];
    options[targetIdx] = temp;
    steps[stepIdx] = { ...steps[stepIdx], options };
    updatedModels[activeModelIdx] = { ...activeModel, steps };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleDeleteOption = (stepIdx, optIdx) => {
    const updatedModels = [...config.models];
    const steps = [...activeModel.steps];
    steps[stepIdx] = {
      ...steps[stepIdx],
      options: steps[stepIdx].options.filter((_, i) => i !== optIdx),
    };
    updatedModels[activeModelIdx] = { ...activeModel, steps };
    saveConfig({ ...config, models: updatedModels });
  };

  const handleUploadPartImage = (stepIdx, optIdx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const compressed = await shrinkDataUrl(ev.target.result, 400, 0.8);
        handleUpdateOption(stepIdx, optIdx, "partImage", compressed);
        flash("Part image updated!");
      } catch (err) {
        handleUpdateOption(stepIdx, optIdx, "partImage", ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUploadModelImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const compressed = await shrinkDataUrl(ev.target.result, 600, 0.8);
        handleUpdateModel("image", compressed);
        flash("Model photo updated successfully!");
      } catch (err) {
        handleUpdateModel("image", ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Import / Export
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `tilt_rotator_catalog_${Date.now()}.json`);
    dlAnchor.click();
    flash("Exported JSON file successfully!");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported?.models && Array.isArray(imported.models)) {
          saveConfig(imported);
          flash("Catalog JSON imported successfully!");
        } else {
          alert("Invalid catalog JSON format: 'models' array is required.");
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (!window.confirm("Reset all models and combination images back to factory demo defaults?")) return;
    saveConfig(defaultTiltData);
    flash("Reset to factory demo data!");
  };

  const breadcrumb = (
    <>
      <span>Workspace</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Tilt-Rotator CMS</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} title="Tilt-Rotator Catalog">
      <div className="page-wrap">
        {/* Content Header matching MACHINE Systems Design */}
        <section className="content-header" style={{ alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>3D CONFIGURATOR CMS
            </div>
            <h1 style={{ margin: "4px 0" }}>
              Tilt-Rotator <span>Catalog &amp; Rules</span>
            </h1>
            <p className="welcome-subtitle">
              Manage multi-stage excavator attachment models, modular options, EUR pricing rules, and live 3D assembly renders.
            </p>
          </div>

          <div
            className="header-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <a
              href="http://localhost:5173/tilt-rotator"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
              style={{
                height: "37px",
                padding: "0 14px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "11px",
                fontWeight: 600,
                textDecoration: "none",
                flexShrink: 0,
              }}
              title="Open public configurator preview"
            >
              <i className="bi bi-box-arrow-up-right" style={{ fontSize: "12px" }}></i>
              <span>Customer Preview</span>
            </a>

            <button
              type="button"
              className="btn-subtle"
              onClick={handleExport}
              style={{
                height: "37px",
                padding: "0 13px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "11px",
                fontWeight: 600,
                flexShrink: 0,
              }}
              title="Download backup JSON"
            >
              <i className="bi bi-download" style={{ fontSize: "12px" }}></i>
              <span>Export JSON</span>
            </button>

            <label
              className="btn-subtle"
              style={{
                height: "37px",
                padding: "0 13px",
                cursor: "pointer",
                margin: 0,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "11px",
                fontWeight: 600,
                flexShrink: 0,
              }}
              title="Import JSON catalog"
            >
              <i className="bi bi-upload" style={{ fontSize: "12px" }}></i>
              <span>Import JSON</span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </label>

            <button
              type="button"
              className="btn-subtle"
              onClick={handleResetDefaults}
              style={{
                height: "37px",
                padding: "0 13px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#c94f2d",
                flexShrink: 0,
              }}
              title="Restore demo dataset"
            >
              <i className="bi bi-arrow-counterclockwise" style={{ fontSize: "12px" }}></i>
              <span>Reset Demo</span>
            </button>
          </div>
        </section>

        {/* Status Toast Banner */}
        {statusMsg && (
          <div
            style={{
              background: "#edf7f2",
              border: "1px solid #b7e4ce",
              color: "#1c563e",
              padding: "10px 16px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "14px" }}></i>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Top Summary Metric Cards */}
        <section className="summary-strip">
          <div className="summary-item">
            <span>Base Models</span>
            <strong>{stats.totalModels}</strong>
            <small>Active machine lines</small>
          </div>
          <div className="summary-item">
            <span>Assembly Steps</span>
            <strong>{stats.totalSteps}</strong>
            <small>Active for {activeModel?.name}</small>
          </div>
          <div className="summary-item">
            <span>Modular Options</span>
            <strong>{stats.totalOptions}</strong>
            <small>Selectable components</small>
          </div>
        </section>

        {/* Model Tabs Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
            borderBottom: "1px solid #ebebe8",
            paddingBottom: "14px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#85867f", textTransform: "uppercase", marginRight: "4px" }}>
              Active Model:
            </span>
            {config.models?.map((m, idx) => {
              const isSelected = idx === activeModelIdx;
              return (
                <button
                  key={m.id || idx}
                  type="button"
                  onClick={() => setActiveModelIdx(idx)}
                  className={isSelected ? "btn-accent" : "btn-subtle"}
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="bi bi-box-seam"></i>
                  {m.name || "Unnamed"}
                  <span
                    style={{
                      marginLeft: "4px",
                      background: isSelected ? "rgba(255,255,255,0.25)" : "#ecece8",
                      color: isSelected ? "#fff" : "#62635d",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {m.id}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddModel}
              className="btn-subtle"
              style={{
                height: "36px",
                padding: "0 12px",
                borderStyle: "dashed",
                color: "#65665f",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="bi bi-plus-lg"></i> Add New Model
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              className={activeTab === "steps" ? "btn-accent" : "btn-subtle"}
              onClick={() => setActiveTab("steps")}
              style={{ height: "34px", padding: "0 12px", fontSize: "11px", whiteSpace: "nowrap" }}
            >
              <i className="bi bi-sliders"></i> Steps &amp; Parts
            </button>
            <button
              type="button"
              className={activeTab === "renders" ? "btn-accent" : "btn-subtle"}
              onClick={() => setActiveTab("renders")}
              style={{ height: "34px", padding: "0 12px", fontSize: "11px", whiteSpace: "nowrap" }}
            >
              <i className="bi bi-bounding-box-circles"></i> 3D Build Renders ({stats.totalRenders})
            </button>
          </div>
        </div>

        {activeModel && (
          <div style={{ display: "grid", gap: "22px" }}>
            {/* Model Profile Panel */}
            <section className="form-panel" style={{ padding: "20px 24px" }}>
              <div className="form-section-heading" style={{ marginBottom: "16px", paddingBottom: "12px" }}>
                <div>
                  <span className="form-kicker">MODEL SPECIFICATIONS</span>
                  <h2>
                    <i className="bi bi-cpu" style={{ color: "var(--accent)" }}></i>
                    {activeModel.name} Platform Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteModel(activeModelIdx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b84c2d",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="bi bi-trash3"></i> Delete Model
                </button>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Model Display Name</label>
                  <input
                    type="text"
                    value={activeModel.name}
                    onChange={(e) => handleUpdateModel("name", e.target.value)}
                    placeholder="e.g. VRX2 or VRX5"
                  />
                </div>

                <div className="form-field">
                  <label>Model ID (Unique lookup key)</label>
                  <input
                    type="text"
                    value={activeModel.id}
                    onChange={(e) => handleUpdateModel("id", e.target.value.replace(/\s+/g, ""))}
                    placeholder="e.g. 2ton or 5ton"
                  />
                </div>

                <div className="form-field">
                  <label>Machine Class Description</label>
                  <input
                    type="text"
                    value={activeModel.description || ""}
                    onChange={(e) => handleUpdateModel("description", e.target.value)}
                    placeholder="e.g. For machines up to ~5 ton"
                  />
                </div>

                <div className="form-field">
                  <label>Base Model Photo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minHeight: "56px" }}>
                    {activeModel.image ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img
                          src={activeModel.image}
                          alt={activeModel.name}
                          style={{
                            width: "74px",
                            height: "54px",
                            objectFit: "contain",
                            border: "1px solid #dcdfdc",
                            borderRadius: "5px",
                            background: "#ffffff",
                            padding: "3px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateModel("image", "")}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "#dc2626",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                            lineHeight: 1,
                          }}
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "74px",
                          height: "54px",
                          background: "#f1f0ec",
                          borderRadius: "5px",
                          border: "1px dashed #c8c8c2",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "10px",
                          color: "#999a93",
                          fontWeight: 500,
                        }}
                      >
                        No Photo
                      </div>
                    )}
                    <label
                      className="btn-accent"
                      style={{
                        height: "36px",
                        padding: "0 14px",
                        cursor: "pointer",
                        margin: 0,
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="bi bi-upload"></i> {activeModel.image ? "Change Photo" : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleUploadModelImage}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* TAB 1: STEPS & OPTIONS CONFIGURATION */}
            {activeTab === "steps" && (
              <section className="form-panel" style={{ padding: "20px 24px" }}>
                <div className="form-section-heading" style={{ marginBottom: "18px", paddingBottom: "12px" }}>
                  <div>
                    <span className="form-kicker">STEP BY STEP COMPONENT STAGES</span>
                    <h2>
                      <i className="bi bi-sliders" style={{ color: "var(--accent)" }}></i>
                      Configurator Stages ({activeModel.steps?.length || 0})
                    </h2>
                    <p style={{ margin: "4px 0 0", color: "#85867f", fontSize: "11px" }}>
                      Customers navigate through each step in sequence. The top option is selected by default.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-accent"
                    onClick={handleAddStep}
                    style={{ height: "34px", fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    <i className="bi bi-plus-lg"></i> Add New Step
                  </button>
                </div>

                <div style={{ display: "grid", gap: "20px" }}>
                  {activeModel.steps?.map((step, si) => (
                    <div
                      key={step.id || si}
                      style={{
                        background: "#fbfbfa",
                        border: "1px solid #e9e9e5",
                        borderRadius: "8px",
                        padding: "16px 18px",
                      }}
                    >
                      {/* Step Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 360px" }}>
                          <span
                            style={{
                              background: "var(--accent)",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "10px",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            STEP {si + 1}
                          </span>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => handleUpdateStep(si, "name", e.target.value)}
                            placeholder="Step Title (e.g. 1. Hose system)"
                            style={{
                              flex: 1,
                              height: "36px",
                              padding: "0 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              border: "1px solid #e2e2de",
                              borderRadius: "4px",
                              background: "#fff",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleAddOption(si)}
                            className="btn-subtle"
                            style={{ height: "32px", fontSize: "11px", padding: "0 10px", whiteSpace: "nowrap" }}
                          >
                            <i className="bi bi-plus-circle"></i> Add Part Option
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStep(si)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#b84c2d",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Delete Step
                          </button>
                        </div>
                      </div>

                      {/* Options Table for this Step */}
                      <div className="table-panel" style={{ border: "1px solid #ebebe8" }}>
                        <table className="data-table" style={{ width: "100%", tableLayout: "auto" }}>
                          <thead>
                            <tr>
                              <th style={{ width: "64px" }}>PHOTO</th>
                              <th style={{ minWidth: "160px" }}>PART NAME</th>
                              <th style={{ width: "140px" }}>PART ID</th>
                              <th style={{ width: "110px" }}>PRICE (€)</th>
                              <th style={{ minWidth: "180px" }}>REQUIREMENTS (REQUIRES)</th>
                              <th style={{ width: "70px", textAlign: "center" }}>ORDER</th>
                              <th style={{ width: "50px", textAlign: "center" }}>ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {step.options?.map((opt, oi) => (
                              <tr key={opt.id || oi}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {opt.partImage ? (
                                      <div style={{ position: "relative", display: "inline-block" }}>
                                        <img
                                          src={opt.partImage}
                                          alt={opt.name}
                                          style={{
                                            width: "38px",
                                            height: "36px",
                                            objectFit: "contain",
                                            border: "1px solid #e5e5e1",
                                            borderRadius: "4px",
                                            background: "#fff",
                                            padding: "2px",
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateOption(si, oi, "partImage", "")}
                                          style={{
                                            position: "absolute",
                                            top: "-4px",
                                            right: "-4px",
                                            width: "14px",
                                            height: "14px",
                                            borderRadius: "50%",
                                            background: "#dc2626",
                                            color: "#fff",
                                            border: "none",
                                            fontSize: "9px",
                                            cursor: "pointer",
                                            display: "grid",
                                            placeItems: "center",
                                            lineHeight: 1,
                                          }}
                                          title="Remove photo"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          width: "38px",
                                          height: "36px",
                                          background: "#f1f0ec",
                                          borderRadius: "4px",
                                          border: "1px dashed #d5d5d0",
                                          display: "grid",
                                          placeItems: "center",
                                          fontSize: "9px",
                                          color: "#999a93",
                                        }}
                                      >
                                        None
                                      </div>
                                    )}
                                    <label
                                      className="btn-subtle"
                                      style={{
                                        cursor: "pointer",
                                        height: "28px",
                                        padding: "0 7px",
                                        fontSize: "10px",
                                        margin: 0,
                                        whiteSpace: "nowrap",
                                      }}
                                      title="Upload part picture"
                                    >
                                      <i className="bi bi-camera"></i>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => handleUploadPartImage(si, oi, e)}
                                      />
                                    </label>
                                  </div>
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => handleUpdateOption(si, oi, "name", e.target.value)}
                                    style={{
                                      width: "100%",
                                      height: "32px",
                                      padding: "4px 8px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      border: "1px solid #e2e2de",
                                      borderRadius: "4px",
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={opt.description || ""}
                                    onChange={(e) => handleUpdateOption(si, oi, "description", e.target.value)}
                                    placeholder="Component engineering description..."
                                    style={{
                                      width: "100%",
                                      height: "26px",
                                      padding: "2px 8px",
                                      fontSize: "10px",
                                      color: "#777871",
                                      border: "1px solid #ebebe8",
                                      borderRadius: "3px",
                                      marginTop: "4px",
                                    }}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={opt.id}
                                    onChange={(e) => handleUpdateOption(si, oi, "id", e.target.value.replace(/\s+/g, ""))}
                                    style={{
                                      width: "100%",
                                      height: "32px",
                                      padding: "4px 8px",
                                      fontSize: "11px",
                                      fontFamily: "monospace",
                                      border: "1px solid #e2e2de",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </td>

                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span style={{ color: "#85867f", fontSize: "11px" }}>€</span>
                                    <input
                                      type="number"
                                      value={opt.price || 0}
                                      onChange={(e) => handleUpdateOption(si, oi, "price", Number(e.target.value) || 0)}
                                      style={{
                                        width: "75px",
                                        height: "32px",
                                        padding: "4px 6px",
                                        fontSize: "11px",
                                        border: "1px solid #e2e2de",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </div>
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={(opt.requires || []).join(", ")}
                                    onChange={(e) =>
                                      handleUpdateOption(
                                        si,
                                        oi,
                                        "requires",
                                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                      )
                                    }
                                    placeholder="Comma separated IDs (e.g. h2, S30)"
                                    style={{
                                      width: "100%",
                                      height: "32px",
                                      padding: "4px 8px",
                                      fontSize: "10px",
                                      border: "1px solid #e2e2de",
                                      borderRadius: "4px",
                                    }}
                                  />
                                  <small style={{ color: "#999a93", fontSize: "9px", display: "block", marginTop: "2px" }}>
                                    Requires any matching option ID to unlock
                                  </small>
                                </td>

                                <td style={{ textAlign: "center" }}>
                                  <div style={{ display: "inline-flex", gap: "2px" }}>
                                    <button
                                      type="button"
                                      disabled={oi === 0}
                                      onClick={() => handleMoveOption(si, oi, -1)}
                                      className="table-action"
                                      style={{ width: "24px", height: "24px", opacity: oi === 0 ? 0.3 : 1 }}
                                      title="Move option up"
                                    >
                                      <i className="bi bi-chevron-up" style={{ fontSize: "10px" }}></i>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={oi === (step.options.length - 1)}
                                      onClick={() => handleMoveOption(si, oi, 1)}
                                      className="table-action"
                                      style={{ width: "24px", height: "24px", opacity: oi === (step.options.length - 1) ? 0.3 : 1 }}
                                      title="Move option down"
                                    >
                                      <i className="bi bi-chevron-down" style={{ fontSize: "10px" }}></i>
                                    </button>
                                  </div>
                                </td>

                                <td style={{ textAlign: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOption(si, oi)}
                                    className="table-action"
                                    style={{ width: "26px", height: "26px", margin: "0 auto", color: "#b84c2d" }}
                                    title="Delete this option"
                                  >
                                    <i className="bi bi-x-lg" style={{ fontSize: "11px" }}></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB 2: COMBINATION IMAGES BROWSER */}
            {activeTab === "renders" && (
              <section className="form-panel" style={{ padding: "20px 24px" }}>
                <div className="form-section-heading" style={{ marginBottom: "16px", paddingBottom: "12px" }}>
                  <div>
                    <span className="form-kicker">LIVE VISUAL RENDERING MAPPING</span>
                    <h2>
                      <i className="bi bi-bounding-box-circles" style={{ color: "var(--accent)" }}></i>
                      3D Combination Renders ({stats.totalRenders} Images Configured)
                    </h2>
                    <p style={{ margin: "4px 0 0", color: "#85867f", fontSize: "11px" }}>
                      Each key corresponds to an assembled stage: <code>modelId|step1OptionId|step2OptionId...</code>
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "14px",
                    maxHeight: "540px",
                    overflowY: "auto",
                    padding: "14px",
                    background: "#fbfbfa",
                    border: "1px solid #ebebe8",
                    borderRadius: "8px",
                  }}
                >
                  {Object.keys(config.combinationImages || {}).map((key) => {
                    const imgUrl = config.combinationImages[key];
                    return (
                      <div
                        key={key}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e8e8e4",
                          borderRadius: "6px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={key}
                          style={{
                            width: "60px",
                            height: "54px",
                            objectFit: "contain",
                            border: "1px solid #f0f0ed",
                            borderRadius: "4px",
                            background: "#fafaf9",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              display: "block",
                              fontFamily: "monospace",
                              fontSize: "10px",
                              fontWeight: 600,
                              color: "#30312c",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={key}
                          >
                            {key}
                          </span>
                          <small style={{ color: "#85867f", fontSize: "9px" }}>
                            {key.split("|").length} stages combined
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        <Footer />
      </div>
    </AdminLayout>
  );
};

export default TiltRotatorAdmin;

