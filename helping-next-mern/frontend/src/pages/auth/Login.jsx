import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (data?.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField.length) return firstField[0];
  }
  return data?.message || "Something went wrong. Please try again.";
}

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/login", form);
      login(data.user, data.token);
      const redirectTo = location.state?.from || `/dashboard/${data.user.role}`;
      navigate(redirectTo, { replace: true });
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
          <h2>Welcome back to a community that shows up.</h2>
          <p>
            Log in to track your donations, manage your volunteer
            activities, or run the platform as an admin.
          </p>
        </div>

        <div className="auth-visual-stats">
          <div>
            <strong>1000+</strong>
            <span>People Helped</span>
          </div>
          <div>
            <strong>100+</strong>
            <span>Volunteers</span>
          </div>
          <div>
            <strong>10+</strong>
            <span>Active Campaigns</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="auth-card-logo">
            <span>♥</span> Helping Next
          </Link>

          <div className="auth-eyebrow">Welcome Back</div>
          <h1>Log in to your account</h1>
          <p className="lead">Enter your details to continue.</p>

          <form onSubmit={handleSubmit}>
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
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
                required
              />
            </div>

            <div className="auth-row-between">
              <label className="auth-checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <div className="auth-demo-box">
            <strong>Demo logins</strong> (seed data se, <code>npm run seed</code> (backend folder) chalane ke baad):
            <ul>
              <li>Admin — admin@helpingnext.org / admin123</li>
              <li>Donor — donor@helpingnext.org / donor123</li>
              <li>Volunteer — volunteer@helpingnext.org / volunteer123</li>
            </ul>
          </div>

          <p className="auth-footer-note">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
