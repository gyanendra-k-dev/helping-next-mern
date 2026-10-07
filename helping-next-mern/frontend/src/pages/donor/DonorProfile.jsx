import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

function DonorProfile() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const { data } = await api.put("/donor/profile", form);
      login(data, token);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Update your personal details." />

      <div className="dash-panel">
        <div className="profile-card">
          <div className="profile-avatar-lg">{initials}</div>
          <div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <form className="dash-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Full name</label>
              <input type="text" className="form-control" value={form.name} onChange={handleChange("name")} required />
            </div>
            <div className="form-field">
              <label>Phone number</label>
              <input type="tel" className="form-control" value={form.phone} onChange={handleChange("phone")} />
            </div>
            <div className="form-field full">
              <label>Email address</label>
              <input type="email" className="form-control" value={user?.email || ""} disabled />
            </div>
          </div>

          {message && <p style={{ color: "var(--color-success)", fontSize: 13.5 }}>{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </>
  );
}

export default DonorProfile;
