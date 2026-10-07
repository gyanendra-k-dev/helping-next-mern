import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import api from "../../services/api";
import "./InnerPages.css";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(""); // "sending" | "sent" | ""
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get("/settings").then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      await api.post("/contact", form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("");
      setError(err?.response?.data?.message || "Could not send your message. Please try again.");
    }
  };

  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.contact} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Contact</span>
          </div>
          <p className="page-hero-eyebrow">Get In Touch</p>
          <h1>Questions, partnerships or just want to say hi?</h1>
          <p>Send us a message and our team will get back to you within 1–2 working days.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="contact-layout">
            <div className="contact-info-card">
              <h3>Contact Information</h3>

              <div className="contact-info-row">
                <div className="contact-icon">📍</div>
                <div>
                  <strong>Office Address</strong>
                  <span>{settings.address || "Helping Next NGO, Uttar Pradesh, India"}</span>
                </div>
              </div>

              <div className="contact-info-row">
                <div className="contact-icon">📞</div>
                <div>
                  <strong>Phone</strong>
                  <span>{settings.contact_phone || "+91 XXXXX XXXXX"}</span>
                </div>
              </div>

              <div className="contact-info-row">
                <div className="contact-icon">✉</div>
                <div>
                  <strong>Email</strong>
                  <span>{settings.contact_email || "info@helpingnext.org"}</span>
                </div>
              </div>

              <div className="contact-info-row">
                <div className="contact-icon">🕒</div>
                <div>
                  <strong>Office Hours</strong>
                  <span>Mon – Sat, 10:00 AM – 6:00 PM</span>
                </div>
              </div>

              <div className="map-placeholder">Map will be embedded here</div>
            </div>

            <form className="donate-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Full name</label>
                  <input type="text" className="form-control" placeholder="Your name" value={form.name} onChange={handleChange("name")} required />
                </div>
                <div className="form-field full">
                  <label>Email address</label>
                  <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange("email")} required />
                </div>
                <div className="form-field full">
                  <label>Subject</label>
                  <input type="text" className="form-control" placeholder="What's this about?" value={form.subject} onChange={handleChange("subject")} required />
                </div>
                <div className="form-field full">
                  <label>Message</label>
                  <textarea className="form-control" placeholder="Write your message here" value={form.message} onChange={handleChange("message")} required></textarea>
                </div>
              </div>

              {status === "sent" && <p style={{ color: "var(--color-success)", fontSize: 13.5 }}>Thanks — your message has been sent!</p>}
              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
