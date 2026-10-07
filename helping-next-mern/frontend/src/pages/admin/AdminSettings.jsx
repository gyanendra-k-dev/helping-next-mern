import { useEffect, useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import api from "../../services/api";

const TABS = ["Organisation", "Social Links", "Payment Gateway"];

function AdminSettings() {
  const [tab, setTab] = useState("Organisation");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/settings")
      .then(({ data }) => setForm(data))
      .catch(() => setError("Failed to load settings."));
  }, []);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/admin/settings", form);
      setForm(data);
      setMessage("Settings saved.");
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      setError((apiErrors && Object.values(apiErrors)[0]?.[0]) || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}, full = false) => (
    <div className={`form-field ${full ? "full" : ""}`}>
      <label>{label}</label>
      <input className="form-control" value={form[name] ?? ""} onChange={handleChange(name)} {...props} />
    </div>
  );

  return (
    <>
      <PageHeader title="Settings" subtitle="Organisation details and social links used across the platform." />

      <div className="filter-tabs">
        {TABS.map((t) => (
          <button key={t} className={`filter-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="dash-panel">
        {!form && !error && <div className="table-loading">Loading…</div>}
        {!form && error && <div className="table-error">{error}</div>}

        {form && (
          <form className="dash-form" onSubmit={handleSubmit}>
            {tab === "Organisation" && (
              <div className="form-grid">
                {field("site_name", "Organisation name", {}, true)}
                {field("tagline", "Tagline", {}, true)}
                {field("contact_email", "Support email", { type: "email" })}
                {field("contact_phone", "Support phone", { type: "tel" })}
                {field("address", "Registered address", {}, true)}
              </div>
            )}

            {tab === "Social Links" && (
              <div className="form-grid">
                {field("facebook_url", "Facebook", { placeholder: "https://facebook.com/…" })}
                {field("instagram_url", "Instagram", { placeholder: "https://instagram.com/…" })}
                {field("twitter_url", "Twitter / X", { placeholder: "https://x.com/…" })}
              </div>
            )}

            {tab === "Payment Gateway" && (
              <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
                Razorpay keys are kept in the backend <code>.env</code> file (<code>RAZORPAY_KEY_ID</code> and{" "}
                <code>RAZORPAY_KEY_SECRET</code>) and are never stored in the database or shown here, for security.
              </p>
            )}

            {message && <p style={{ color: "var(--color-success)", fontSize: 13.5 }}>{message}</p>}
            {error && <p className="auth-error">{error}</p>}

            {tab !== "Payment Gateway" && (
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save Settings"}
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
}

export default AdminSettings;
