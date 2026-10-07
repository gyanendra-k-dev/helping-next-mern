import { useState } from "react";
import Modal from "./Modal";
import api from "../../services/api";

// Generic create/edit form driven by a field config array, e.g.:
//   [{ name: "title", label: "Title", required: true },
//    { name: "status", label: "Status", type: "select", options: [...] },
//    { name: "cover_image", label: "Cover Image", type: "image" }]
// Supported types: text (default), textarea, number, date, datetime-local,
// select, checkbox, image (upload w/ preview), file (upload, any type incl. PDF).
function ResourceFormModal({ title, fields, initialValues = {}, onCancel, onSubmit }) {
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.name] = initialValues[f.name] ?? (f.type === "checkbox" ? false : "");
    });
    return base;
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  const handleChange = (name, type) => (e) => {
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleFileUpload = (name) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((u) => ({ ...u, [name]: true }));
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setValues((v) => ({ ...v, [name]: data.url }));
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading((u) => ({ ...u, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const firstError = apiErrors && Object.values(apiErrors)[0]?.[0];
      setError(firstError || err?.response?.data?.message || "Could not save. Please check the fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        {fields.map((f) => (
          <div className="form-field" key={f.name}>
            <label>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                className="form-control"
                rows={4}
                value={values[f.name]}
                onChange={handleChange(f.name)}
                required={f.required}
              />
            ) : f.type === "select" ? (
              <select
                className="form-control"
                value={values[f.name]}
                onChange={handleChange(f.name)}
                required={f.required}
              >
                <option value="">Select…</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <input type="checkbox" checked={values[f.name]} onChange={handleChange(f.name, "checkbox")} />
            ) : f.type === "image" ? (
              <div>
                {values[f.name] && (
                  <img
                    src={values[f.name]}
                    alt="Preview"
                    style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, marginBottom: 8, display: "block" }}
                  />
                )}
                <input type="file" accept="image/*" onChange={handleFileUpload(f.name)} />
                {uploading[f.name] && <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Uploading…</p>}
              </div>
            ) : f.type === "file" ? (
              <div>
                {values[f.name] && (
                  <p style={{ fontSize: 12.5, marginBottom: 8 }}>
                    <a href={values[f.name]} target="_blank" rel="noreferrer">📄 View uploaded file</a>
                  </p>
                )}
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload(f.name)} required={f.required && !values[f.name]} />
                {uploading[f.name] && <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Uploading…</p>}
              </div>
            ) : (
              <input
                type={f.type || "text"}
                className="form-control"
                value={values[f.name]}
                onChange={handleChange(f.name)}
                required={f.required}
                step={f.type === "number" ? f.step || "any" : undefined}
              />
            )}
          </div>
        ))}

        {error && <p className="auth-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving || Object.values(uploading).some(Boolean)}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ResourceFormModal;
