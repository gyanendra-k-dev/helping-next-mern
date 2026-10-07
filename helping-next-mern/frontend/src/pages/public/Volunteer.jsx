import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import "./InnerPages.css";

const SKILLS = [
  "Teaching", "Healthcare", "Event Support", "Fundraising",
  "Social Media", "Photography", "Logistics", "Counselling",
];

const PROCESS = [
  { title: "Apply Online", text: "Fill out the volunteer form with your skills and availability." },
  { title: "Quick Review", text: "Our team reviews your application, usually within a few days." },
  { title: "Onboarding", text: "A short orientation call to match you with the right activity." },
  { title: "Start Helping", text: "Join events, campaigns or ongoing projects that fit your time." },
];

function Volunteer() {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const isVolunteer = isAuthenticated && user?.role === "volunteer";

  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", availability: "Weekends only", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // New visitors get a volunteer account created first, then the application is filed under it.
      if (!isAuthenticated) {
        const { data } = await api.post("/register", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "volunteer",
        });
        login(data.user, data.token);
      }

      await api.post("/volunteer/applications", {
        area_of_interest: selectedSkills.join(", "),
        availability: form.availability,
        message: form.message,
      });
      navigate("/dashboard/volunteer/applications", { replace: true });
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      setError((apiErrors && Object.values(apiErrors)[0]?.[0]) || err?.response?.data?.message || "Could not submit your application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Volunteer</span>
          </div>
          <p className="page-hero-eyebrow">Become A Volunteer</p>
          <h1>Give your time, skills, or both</h1>
          <p>
            From weekend events to ongoing project support, there's a place
            for every kind of volunteer at Helping Next.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="section-heading center">
            <div className="section-label" style={{ justifyContent: "center" }}>How It Works</div>
            <h2 className="section-title">Four simple steps</h2>
          </div>

          <div className="process-grid">
            {PROCESS.map((step, index) => (
              <div className="process-step" key={step.title}>
                <div className="process-step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-container">
          <div className="split-block">
            <div>
              <div className="section-label">Volunteer Registration</div>
              <h2 className="section-title">Tell us about yourself</h2>
              <p className="section-subtitle">
                Share your availability and skills — we'll match you to
                activities and events that fit, and keep you posted on
                upcoming opportunities.
              </p>
            </div>

            <form className="donate-card" onSubmit={handleSubmit}>
              {isAuthenticated && !isVolunteer && (
                <p className="auth-error">You're logged in as a {user?.role}. Please log out to apply as a volunteer.</p>
              )}

              {isVolunteer ? (
                <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginBottom: 14 }}>
                  Applying as <strong>{user.name}</strong> ({user.email})
                </p>
              ) : (
                <div className="form-grid">
                  <div className="form-field">
                    <label>Full name</label>
                    <input type="text" className="form-control" placeholder="Your name" value={form.name} onChange={handleChange("name")} required />
                  </div>
                  <div className="form-field">
                    <label>Phone number</label>
                    <input type="tel" className="form-control" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange("phone")} required />
                  </div>
                  <div className="form-field full">
                    <label>Email address</label>
                    <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange("email")} required />
                  </div>
                  <div className="form-field full">
                    <label>Create a password <span className="hint">(to track your application)</span></label>
                    <input type="password" className="form-control" placeholder="At least 8 characters" minLength={8} value={form.password} onChange={handleChange("password")} required />
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>Areas you can help with</label>
                <div className="checkbox-group">
                  {SKILLS.map((skill) => (
                    <label
                      key={skill}
                      className={`checkbox-chip ${selectedSkills.includes(skill) ? "checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Availability</label>
                <select className="form-control" value={form.availability} onChange={handleChange("availability")}>
                  <option>Weekends only</option>
                  <option>Weekday evenings</option>
                  <option>Flexible / on-call</option>
                  <option>Full-time</option>
                </select>
              </div>

              <div className="form-field">
                <label>Anything else we should know? <span className="hint">(optional)</span></label>
                <textarea className="form-control" placeholder="Tell us a bit more about you" value={form.message} onChange={handleChange("message")}></textarea>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || (isAuthenticated && !isVolunteer)}>
                {loading ? "Submitting…" : "Submit application"}
              </button>
              {!isAuthenticated && (
                <p style={{ fontSize: 12.5, marginTop: 10, color: "var(--color-text-muted)" }}>
                  Already registered? <Link to="/login">Log in</Link> first.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Volunteer;
