import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Auth.css";
import api from "../../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/reset-password", { token, email, password, password_confirmation: confirm });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      setError((apiErrors && Object.values(apiErrors)[0]?.[0]) || err?.response?.data?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <Link to="/" className="auth-visual-logo">
          <span className="icon">♥</span>
          Helping Next
        </Link>
        <div className="auth-visual-quote">
          <h2>Almost done — set a new password.</h2>
          <p>Choose a strong password you haven't used before on this account.</p>
        </div>
        <div></div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="auth-card-logo">
            <span>♥</span> Helping Next
          </Link>
          <div className="auth-eyebrow">Set New Password</div>
          <h1>Reset your password</h1>
          <p className="lead">This link is valid for a limited time.</p>

          {(!token || !email) && <p className="auth-error">This reset link is incomplete. Please request a new one.</p>}

          {done ? (
            <p style={{ color: "var(--color-success)" }}>Password updated! Redirecting to log in…</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>New password</label>
                <input type="password" className="form-control" placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Confirm new password</label>
                <input type="password" className="form-control" placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || !token || !email}>
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}

          <p className="auth-footer-note">
            <Link to="/login">Back to log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
