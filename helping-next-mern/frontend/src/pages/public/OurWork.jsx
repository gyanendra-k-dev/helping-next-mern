import { Link } from "react-router-dom";
import { CATEGORY_IMAGES, CATEGORY_ICONS, HERO_IMAGES } from "../../utils/images";
import "./InnerPages.css";

const FOCUS_AREAS = [
  { key: "education", title: "Education", text: "Learning support, school kits and scholarships for children who need them most." },
  { key: "healthcare", title: "Healthcare", text: "Basic health camps, awareness drives and access to essential care." },
  { key: "food", title: "Food Support", text: "Meal programmes and ration support for families facing food insecurity." },
  { key: "women", title: "Women Empowerment", text: "Skill-building and support groups that help women become self-reliant." },
  { key: "childWelfare", title: "Child Welfare", text: "Safe spaces, nutrition and protection programmes for vulnerable children." },
  { key: "environment", title: "Environment", text: "Tree plantation, cleanup drives and awareness for sustainable living." },
  { key: "skillDevelopment", title: "Skill Development", text: "Vocational training that helps youth and adults find steady work." },
  { key: "emergency", title: "Emergency Relief", text: "Rapid response support during floods, disasters and urgent crises." },
];

function OurWork() {
  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.ourWork} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Our Work</span>
          </div>
          <p className="page-hero-eyebrow">What We Do</p>
          <h1>Eight areas of focus, one shared goal</h1>
          <p>
            From classrooms to disaster zones, our programmes are designed
            around what communities actually need — not what's easiest to run.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="focus-areas-grid">
            {FOCUS_AREAS.map((area) => (
              <article className="card focus-area-card" key={area.title}>
                <div className="card-media">
                  <img src={CATEGORY_IMAGES[area.key]} alt={area.title} loading="lazy" />
                  <span className="card-media-icon">{CATEGORY_ICONS[area.key]}</span>
                </div>
                <div className="card-body">
                  <h3>{area.title}</h3>
                  <p>{area.text}</p>
                  <Link to="/projects" className="focus-list-link">
                    See related projects →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-container">
          <div className="stat-strip">
            <div className="stat">
              <h2>1000+</h2>
              <p>People Helped</p>
            </div>
            <div className="stat">
              <h2>50+</h2>
              <p>Community Projects</p>
            </div>
            <div className="stat">
              <h2>100+</h2>
              <p>Active Volunteers</p>
            </div>
            <div className="stat">
              <h2>8</h2>
              <p>Focus Areas</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="cta-band">
            <div>
              <h2>See these focus areas in action</h2>
              <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 10 }}>
                Browse ongoing projects and active campaigns to see exactly where support goes.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/campaigns" className="btn btn-primary">View campaigns</Link>
              <Link to="/projects" className="btn btn-outline-light">Browse projects</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default OurWork;
