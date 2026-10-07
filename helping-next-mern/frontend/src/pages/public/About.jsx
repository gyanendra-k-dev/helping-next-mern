import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import "./InnerPages.css";

const VALUES = [
  { icon: "◎", title: "Compassion", text: "We lead with empathy in every project, campaign and conversation." },
  { icon: "✦", title: "Transparency", text: "Every rupee raised is tracked and reported back to our donors." },
  { icon: "⬡", title: "Community", text: "Lasting change is built with communities, not just for them." },
  { icon: "⌁", title: "Accountability", text: "We measure our impact and hold ourselves to it, year after year." },
];

const TIMELINE = [
  { year: "Year 1", text: "Helping Next began as a small volunteer group running neighbourhood food drives." },
  { year: "Year 2", text: "Formalised as an NGO and launched our first education and healthcare projects." },
  { year: "Year 3", text: "Expanded into skill development and emergency relief with a growing volunteer base." },
  { year: "Today", text: "Building a transparent, technology-driven platform to scale our impact further." },
];

function About() {
  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.about} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>About</span>
          </div>
          <p className="page-hero-eyebrow">About Helping Next</p>
          <h1>People, purpose and a shared belief in progress</h1>
          <p>
            We're an NGO built on the idea that real change happens when
            compassion is paired with consistent, accountable action.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="split-block">
            <div>
              <div className="section-label">Our Story</div>
              <h2 className="section-title">Why Helping Next exists</h2>
              <p className="section-subtitle">
                Helping Next was founded to close the gap between people who
                want to help and communities that need support — through
                education, healthcare, food security and skill-building
                programmes run with honesty and care.
              </p>
              <p className="section-subtitle" style={{ marginTop: 14 }}>
                Everything we do is organised around three questions: who
                needs support today, what will genuinely help them, and how
                do we prove it worked.
              </p>
              <div className="about-links">
                <Link to="/our-work" className="btn btn-outline-dark">Explore our work</Link>
                <Link to="/transparency" className="btn btn-outline-dark">Transparency reports</Link>
              </div>
            </div>

            <div className="mission-vision-stack">
              <div className="mv-card">
                <div className="mv-icon">◎</div>
                <h3>Our Mission</h3>
                <p>To create opportunities, support communities and help people move towards a better future.</p>
              </div>
              <div className="mv-card">
                <div className="mv-icon">✦</div>
                <h3>Our Vision</h3>
                <p>A world where every person gets the opportunity to live with dignity, hope and purpose.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-container">
          <div className="section-heading center">
            <div className="section-label" style={{ justifyContent: "center" }}>What We Stand For</div>
            <h2 className="section-title">Our core values</h2>
          </div>

          <div className="grid grid-4">
            {VALUES.map((v) => (
              <div className="card" key={v.title}>
                <div className="card-body">
                  <div className="value-icon">{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="section-heading center">
            <div className="section-label" style={{ justifyContent: "center" }}>Our Journey</div>
            <h2 className="section-title">How we got here</h2>
          </div>

          <div className="timeline">
            {TIMELINE.map((t) => (
              <div className="timeline-item" key={t.year}>
                <div className="timeline-dot"></div>
                <span className="timeline-year">{t.year}</span>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-container">
          <div className="cta-band">
            <div>
              <h2>Want to know the people behind Helping Next?</h2>
              <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 10 }}>
                Meet our founding team and staff, or reach out directly with questions.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/contact" className="btn btn-primary">Contact us</Link>
              <Link to="/volunteer" className="btn btn-outline-light">Join as a volunteer</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
