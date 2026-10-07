import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

// Pulls a readable message out of an API validation error response,
// e.g. { message: "Validation failed", errors: { email: ["already taken"] } }
function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (data?.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField.length) return firstField[0];
  }
  return data?.message || "Something went wrong. Please try again.";
}

function Register() {
  const [role, setRole] = useState("donor");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/register", { ...form, role });
      login(data.user, data.token);
      navigate(`/dashboard/${role}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
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
          <h2>Create an account to start making a difference.</h2>
          <p>
            Donors track their giving and receipts. Volunteers manage
            applications, hours and certificates — all in one place.
          </p>
        </div>

        <div className="auth-visual-stats">
          <div>
            <strong>50+</strong>
            <span>Community Projects</span>
          </div>
          <div>
            <strong>8</strong>
            <span>Focus Areas</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="auth-card-logo">
            <span>♥</span> Helping Next
          </Link>

          <div className="auth-eyebrow">Get Started</div>
          <h1>Create your account</h1>
          <p className="lead">Join as a donor or a volunteer.</p>

          <div className="auth-role-toggle">
            <button type="button" className={role === "donor" ? "active" : ""} onClick={() => setRole("donor")}>
              I'm a Donor
            </button>
            <button type="button" className={role === "volunteer" ? "active" : ""} onClick={() => setRole("volunteer")}>
              I'm a Volunteer
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Full name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>

            <div className="form-field">
              <label>Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
            </div>

            <div className="form-field">
              <label>Phone number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={handleChange("phone")}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                minLength={8}
                value={form.password}
                onChange={handleChange("password")}
                required
              />
            </div>

            <div className="auth-row-between" style={{ marginTop: 4 }}>
              <label className="auth-checkbox">
                <input type="checkbox" required /> I agree to the{" "}
                <Link to="/terms">Terms</Link>&nbsp;&amp;&nbsp;<Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account…" : `Create Account as ${role === "donor" ? "Donor" : "Volunteer"}`}
            </button>
          </form>

          <p className="auth-footer-note">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
