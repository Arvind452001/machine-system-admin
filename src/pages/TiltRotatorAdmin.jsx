import { useState, useEffect, useMemo, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import defaultTiltData from "../data/tiltRotatorData.json";

const STORAGE_KEY = "tiltRotatorConfig_v2";

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
  const [comboStepIdx, setComboStepIdx] = useState(0);
  const [comboSelections, setComboSelections] = useState({});
  const [comboPreview, setComboPreview] = useState("");

  const flash = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const saveConfig = (newConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      window.dispatchEvent(new Event("storage"));
      setConfig(newConfig);
      flash("Configuration saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      flash("Error saving: Browser storage might be full.");
    }
  };

  const activeModel = useMemo(() => {
    if (!config?.models || config.models.length === 0) return null;
    return config.models[activeModelIdx] || config.models[0];
  }, [config, activeModelIdx]);

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
      name: "New Model",
      description: "Excavator attachment platform",
      image: "",
      steps: [
        {
          id: "step1",
          name: "1. Hose system",
          options: [
            { id: "opt1", name: "Standard Hoses", price: 0, description: "Standard hydraulic routing" }
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
      name: `${stepNum}. New Step`,
      options: [
        { id: `opt_${Date.now()}`, name: "Default Option", price: 0, description: "" }
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
      name: "New Option",
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
    reader.onload = (ev) => {
      handleUpdateOption(stepIdx, optIdx, "partImage", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadModelImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleUpdateModel("image", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Import / Export
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `tilt_rotator_catalog_${Date.now()}.json`);
    dlAnchor.click();
    flash("Exported JSON file!");
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
          flash("Catalog imported and applied successfully!");
        } else {
          alert("Invalid catalog JSON format.");
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

  return (
    <AdminLayout>
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <div className="eyebrow">
            <span></span> DYNAMIC 3D CONFIGURATOR CMS
          </div>
          <h1>Tilt-Rotator Product Catalog</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
            Add models, customize multi-step options, assign prices and compatibility rules dynamically without code changes.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {statusMsg && (
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#065f46", background: "#e8fdf2", padding: "4px 10px", borderRadius: "4px", border: "1px solid #a7f3d0" }}>
              <i className="bi bi-check2-circle" style={{ marginRight: "4px" }}></i>{statusMsg}
            </span>
          )}

          <a
            href="http://localhost:5173/tilt-rotator"
            target="_blank"
            rel="noopener noreferrer"
            className="button button-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
          >
            <i className="bi bi-box-arrow-up-right"></i> Live Customer Preview
          </a>

          <button
            type="button"
            className="button button-outline"
            onClick={handleExport}
            style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <i className="bi bi-download"></i> Export JSON
          </button>

          <label
            className="button button-outline"
            style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0 }}
          >
            <i className="bi bi-upload"></i> Import JSON
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
            className="button button-outline"
            onClick={handleResetDefaults}
            style={{ fontSize: "12px", color: "#991b1b" }}
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px", overflowX: "auto" }}>
        {config.models?.map((m, idx) => (
          <button
            key={m.id || idx}
            type="button"
            onClick={() => setActiveModelIdx(idx)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid",
              borderColor: idx === activeModelIdx ? "#173f35" : "#cbd5e1",
              background: idx === activeModelIdx ? "#173f35" : "#ffffff",
              color: idx === activeModelIdx ? "#ffffff" : "#334155",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {m.name || "Unnamed Model"}
          </button>
        ))}

        <button
          type="button"
          onClick={handleAddModel}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px dashed #94a3b8",
            background: "#f8fafc",
            color: "#475569",
            fontWeight: 600,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          <i className="bi bi-plus-lg"></i> Add Model
        </button>
      </div>

      {activeModel && (
        <div style={{ display: "grid", gap: "24px" }}>
          {/* Active Model Overview Card */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                Model Details: {activeModel.name}
              </h3>
              <button
                type="button"
                onClick={() => handleDeleteModel(activeModelIdx)}
                style={{ background: "none", border: "none", color: "#dc2626", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              >
                <i className="bi bi-trash3"></i> Delete Model
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Model Display Name
                </label>
                <input
                  type="text"
                  value={activeModel.name}
                  onChange={(e) => handleUpdateModel("name", e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Model ID (Unique key)
                </label>
                <input
                  type="text"
                  value={activeModel.id}
                  onChange={(e) => handleUpdateModel("id", e.target.value.replace(/\s+/g, ""))}
                  style={{ width: "100%", padding: "7px 10px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Description
                </label>
                <input
                  type="text"
                  value={activeModel.description || ""}
                  onChange={(e) => handleUpdateModel("description", e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {activeModel.image && (
                  <img
                    src={activeModel.image}
                    alt={activeModel.name}
                    style={{ width: "42px", height: "42px", objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: "4px" }}
                  />
                )}
                <label className="button button-outline" style={{ fontSize: "11px", cursor: "pointer", margin: 0, padding: "7px 12px" }}>
                  <i className="bi bi-image"></i> Change Model Photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadModelImage} />
                </label>
              </div>
            </div>
          </div>

          {/* Steps & Options Configuration */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                  Configurator Steps ({activeModel.steps?.length || 0})
                </h3>
                <small style={{ color: "#64748b", fontSize: "12px" }}>
                  Customer walks through these steps in sequence. The first option in each step is selected by default.
                </small>
              </div>

              <button
                type="button"
                className="button button-lime"
                onClick={handleAddStep}
                style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <i className="bi bi-plus-circle"></i> Add Step
              </button>
            </div>

            <div style={{ display: "grid", gap: "20px" }}>
              {activeModel.steps?.map((step, si) => (
                <div
                  key={step.id || si}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 300px" }}>
                      <strong style={{ fontSize: "12px", color: "#475569" }}>STEP {si + 1}:</strong>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleUpdateStep(si, "name", e.target.value)}
                        placeholder="Step title (e.g. 1. Hose system)"
                        style={{ flex: 1, padding: "5px 8px", fontSize: "12px", fontWeight: "600", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleAddOption(si)}
                        className="button button-outline"
                        style={{ fontSize: "10px", padding: "4px 8px", height: "auto" }}
                      >
                        <i className="bi bi-plus"></i> Add Option
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(si)}
                        style={{ background: "none", border: "none", color: "#dc2626", fontSize: "11px", cursor: "pointer" }}
                      >
                        Delete Step
                      </button>
                    </div>
                  </div>

                  {/* Options List */}
                  <div style={{ display: "grid", gap: "10px" }}>
                    {step.options?.map((opt, oi) => (
                      <div
                        key={opt.id || oi}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "12px",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 100px auto auto auto", gap: "10px", alignItems: "center" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#64748b" }}>Part Name</label>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) => handleUpdateOption(si, oi, "name", e.target.value)}
                              style={{ width: "100%", padding: "4px 6px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "3px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#64748b" }}>ID (Stable key)</label>
                            <input
                              type="text"
                              value={opt.id}
                              onChange={(e) => handleUpdateOption(si, oi, "id", e.target.value.replace(/\s+/g, ""))}
                              style={{ width: "100%", padding: "4px 6px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "3px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#64748b" }}>Price (€)</label>
                            <input
                              type="number"
                              value={opt.price || 0}
                              onChange={(e) => handleUpdateOption(si, oi, "price", Number(e.target.value) || 0)}
                              style={{ width: "100%", padding: "4px 6px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "3px" }}
                            />
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {opt.partImage ? (
                              <img
                                src={opt.partImage}
                                alt={opt.name}
                                style={{ width: "32px", height: "32px", objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: "3px" }}
                              />
                            ) : (
                              <div style={{ width: "32px", height: "32px", background: "#f1f5f9", display: "grid", placeItems: "center", fontSize: "9px", color: "#94a3b8" }}>
                                N/A
                              </div>
                            )}
                            <label style={{ fontSize: "10px", color: "#2563eb", cursor: "pointer", textDecoration: "underline", margin: 0 }}>
                              Photo
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleUploadPartImage(si, oi, e)} />
                            </label>
                          </div>

                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              type="button"
                              disabled={oi === 0}
                              onClick={() => handleMoveOption(si, oi, -1)}
                              style={{ width: "24px", height: "24px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", borderRadius: "3px", fontSize: "11px" }}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={oi === (step.options.length - 1)}
                              onClick={() => handleMoveOption(si, oi, 1)}
                              style={{ width: "24px", height: "24px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", borderRadius: "3px", fontSize: "11px" }}
                            >
                              ↓
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteOption(si, oi)}
                            style={{ background: "none", border: "none", color: "#dc2626", fontSize: "14px", cursor: "pointer" }}
                            title="Delete option"
                          >
                            &times;
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px", marginTop: "8px" }}>
                          <div>
                            <input
                              type="text"
                              value={opt.description || ""}
                              onChange={(e) => handleUpdateOption(si, oi, "description", e.target.value)}
                              placeholder="Description or engineering specifications"
                              style={{ width: "100%", padding: "4px 6px", fontSize: "11px", border: "1px solid #e2e8f0", borderRadius: "3px" }}
                            />
                          </div>
                          <div>
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
                              placeholder="Requires IDs (e.g. h2, S30SemiAutomatic)"
                              style={{ width: "100%", padding: "4px 6px", fontSize: "11px", border: "1px solid #e2e8f0", borderRadius: "3px" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combination Images Overview */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                  Combination Build Images ({Object.keys(config.combinationImages || {}).length} configured)
                </h3>
                <small style={{ color: "#64748b", fontSize: "12px" }}>
                  These are the live 3D assembly renders shown on the customer page for each combination of selected parts.
                </small>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "240px", overflowY: "auto", padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              {Object.keys(config.combinationImages || {}).map((key) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "11px",
                  }}
                >
                  <img
                    src={config.combinationImages[key]}
                    alt={key}
                    style={{ width: "24px", height: "24px", objectFit: "contain" }}
                  />
                  <span style={{ fontFamily: "monospace", color: "#334155" }}>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </AdminLayout>
  );
};

export default TiltRotatorAdmin;
