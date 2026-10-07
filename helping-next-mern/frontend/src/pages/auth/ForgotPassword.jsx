import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";
import api from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
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
          <h2>Locked out? We'll get you back in.</h2>
          <p>Enter the email on your account and we'll send a link to reset your password.</p>
        </div>
        <div></div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="auth-card-logo">
            <span>♥</span> Helping Next
          </Link>
          <div className="auth-eyebrow">Reset Password</div>
          <h1>Forgot your password?</h1>
          <p className="lead">No worries, we'll send you reset instructions.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {message && <p style={{ color: "var(--color-success)", fontSize: 13.5, marginBottom: 12 }}>{message}</p>}
            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <p className="auth-footer-note">
            Remembered your password? <Link to="/login">Back to log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
