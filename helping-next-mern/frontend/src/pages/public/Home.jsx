import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import "./InnerPages.css";
import useAdminResource from "../../hooks/useAdminResource";

import hero1 from "../../assets/hero/hero1.png";
import hero2 from "../../assets/hero/hero2.png";
import hero3 from "../../assets/hero/hero3.png";
import hero4 from "../../assets/hero/hero4.png";
import hero5 from "../../assets/hero/hero5.png";

function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function Home() {
  const heroImages = [
    hero1,
    hero2,
    hero3,
    hero4,
    hero5,
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const { items: campaigns } = useAdminResource("/campaigns");
  const { items: projects } = useAdminResource("/projects");
  const { items: events } = useAdminResource("/events");
  const { items: testimonials } = useAdminResource("/testimonials");

  const featuredCampaigns = campaigns.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);
  const upcomingEvents = events.filter((e) => ["upcoming", "ongoing"].includes(e.status)).slice(0, 2);
  const featuredTestimonials = testimonials.slice(0, 3);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((previous) => {
        return (previous + 1) % heroImages.length;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Next
  const nextSlide = () => {
    setCurrentSlide((previous) => {
      return (previous + 1) % heroImages.length;
    });
  };

  // Previous
  const previousSlide = () => {
    setCurrentSlide((previous) => {
      return (
        (previous - 1 + heroImages.length) %
        heroImages.length
      );
    });
  };

  return (
    <main className="home-page">

      {/* HERO SLIDER */}
      <section className="hero-section">

        {/* Background Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={
              index === currentSlide
                ? "hero-slide active"
                : "hero-slide"
            }
            style={{
              backgroundImage: "url(" + image + ")",
            }}
          ></div>
        ))}

        {/* Dark Overlay */}
        <div className="hero-overlay"></div>

        {/* Left Arrow */}
        <button
          className="hero-arrow hero-arrow-left"
          onClick={previousSlide}
          aria-label="Previous slide"
        >
          &#10094;
        </button>

        {/* Right Arrow */}
        <button
          className="hero-arrow hero-arrow-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          &#10095;
        </button>

        {/* Content */}
        <div className="hero-content">

          <p className="hero-small-title">
            WELCOME TO HELPING NEXT
          </p>

          <h1>
            Together We Can
            <span>Make A Difference</span>
          </h1>

          <p className="hero-description">
            Helping people, supporting communities and creating
            a better tomorrow through compassion and action.
          </p>

          <div className="hero-buttons">

            <Link
              to="/donate"
              className="btn btn-primary"
            >
              Donate Now
            </Link>

            <Link
              to="/volunteer"
              className="btn btn-secondary"
            >
              Become a Volunteer
            </Link>

          </div>

        </div>
        {/* HERO INFO CARD */}
<div className="hero-info-card">

  <div className="hero-card-top">
    <div className="hero-card-icon">
      ♥
    </div>

    <div>
      <span>HELPING NEXT</span>
      <strong>Make A Difference</strong>
    </div>
  </div>

  <div className="hero-card-line"></div>

  <div className="hero-card-text">
    <p>Every helping hand creates hope.</p>
    <p>Together we can support communities.</p>
    <p>Small actions can change lives.</p>
    <p>Be a part of something meaningful.</p>
  </div>

  <div className="hero-card-bottom">
    <span>Join Our Mission</span>
    <Link to="/volunteer">→</Link>
  </div>

</div>

        {/* Slider Dots */}
        <div className="hero-dots">

          {heroImages.map((image, index) => (
            <button
              key={index}
              type="button"
              className={
                index === currentSlide
                  ? "hero-dot active"
                  : "hero-dot"
              }
              onClick={() => setCurrentSlide(index)}
              aria-label={"Go to slide " + (index + 1)}
            ></button>
          ))}

        </div>

        {/* Slide Number */}
        <div className="hero-counter">
          <span>
            0{currentSlide + 1}
          </span>
          <i></i>
          <span>
            0{heroImages.length}
          </span>
        </div>

      </section>

      {/* IMPACT */}
      <section className="impact-section">

        <div className="section-container">

          <div className="impact-card">
            <h2>1000+</h2>
            <p>People Helped</p>
          </div>

          <div className="impact-card">
            <h2>50+</h2>
            <p>Community Projects</p>
          </div>

          <div className="impact-card">
            <h2>100+</h2>
            <p>Volunteers</p>
          </div>

          <div className="impact-card">
            <h2>10+</h2>
            <p>Active Campaigns</p>
          </div>

        </div>

      </section>

      {/* ABOUT */}
    {/* ABOUT HELPING NEXT */}
<section className="about-section">
  <div className="about-container">

    {/* LEFT IMAGE AREA */}
    <div className="about-visual">

      <div className="about-image-main">
        <img
          src="/images/about-helping.jpg"
          alt="Helping Next community support"
        />
      </div>

      <div className="about-image-shape"></div>

      {/* Floating Card */}
      <div className="about-impact-card">
        <div className="about-impact-icon">♥</div>

        <div>
          <strong>Making A Difference</strong>
          <span>One Step At A Time</span>
        </div>
      </div>

      {/* Small Badge */}
      <div className="about-badge">
        <span className="about-badge-number">01</span>
        <div className="about-badge-copy">
          <strong>Our Journey</strong>
          <span>Since day one</span>
        </div>
      </div>
    </div>

    {/* RIGHT CONTENT */}
    <div className="about-content">

      <div className="section-label">
        <span></span>
        ABOUT HELPING NEXT
      </div>

      <h2>
        Together We Can
        <span>Build A Better Tomorrow</span>
      </h2>

      <p className="about-intro">
        Helping Next is built on a simple belief — when people come
        together with compassion and purpose, meaningful change becomes
        possible.
      </p>

      <p className="about-description">
        We aim to support individuals and communities by creating
        opportunities, spreading awareness and encouraging people to
        participate in positive social change.
      </p>

      {/* Mission Vision */}
      <div className="about-points">

        <div className="about-point">
          <div className="about-point-icon">◎</div>

          <div>
            <h3>Our Mission</h3>
            <p>
              To create opportunities, support communities and help
              people move towards a better future.
            </p>
          </div>
        </div>

        <div className="about-point">
          <div className="about-point-icon">✦</div>

          <div>
            <h3>Our Vision</h3>
            <p>
              A world where every person gets the opportunity to live
              with dignity, hope and purpose.
            </p>
          </div>
        </div>

      </div>

      {/* Button */}
      <div className="about-action">
        <Link to="/about" className="about-read-more">
          Discover Our Story
          <span>→</span>
        </Link>

        <div className="about-mini-text">
          <span className="about-mini-line"></span>
          <span>Be a part of the change</span>
        </div>
      </div>

    </div>

  </div>
</section>

      {/* OUR WORK */}
      <section className="work-section">

        <div className="section-container">

          <div className="section-heading">

            <p className="section-label">
              WHAT WE DO
            </p>

            <h2 className="section-title">
              Our Areas of Work
            </h2>

            <p className="section-subtitle">
              Working together for a stronger and better community.
            </p>

          </div>

          <div className="work-grid">

            <div className="work-card">
              <div className="work-icon">📚</div>
              <h3>Education</h3>
              <p>
                Supporting education and learning opportunities
                for children and communities.
              </p>
            </div>

            <div className="work-card">
              <div className="work-icon">❤️</div>
              <h3>Healthcare</h3>
              <p>
                Helping communities access basic healthcare
                and awareness.
              </p>
            </div>

            <div className="work-card">
              <div className="work-icon">🍲</div>
              <h3>Food Support</h3>
              <p>
                Supporting families and people facing
                food insecurity.
              </p>
            </div>

            <div className="work-card">
              <div className="work-icon">🌱</div>
              <h3>Community</h3>
              <p>
                Building stronger communities through
                meaningful initiatives.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* FEATURED CAMPAIGNS */}
      <section className="section">
        <div className="section-container">
          <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, maxWidth: "100%" }}>
            <div>
              <p className="section-label">Fundraising</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Featured Campaigns</h2>
            </div>
            <Link to="/campaigns" className="btn btn-outline-dark btn-sm">View all campaigns</Link>
          </div>

          <div className="grid grid-3">
            {featuredCampaigns.map((c) => {
              const percent = Math.min(100, Math.round((Number(c.raised_amount) / Number(c.goal_amount || 1)) * 100));
              return (
                <div className="card" key={c.id}>
                  <div className="card-media">
                    {c.cover_image ? (
                      <img src={c.cover_image} alt={c.title} loading="lazy" />
                    ) : (
                      <div style={{ height: 180, background: "var(--color-accent-soft)" }} />
                    )}
                  </div>
                  <div className="entity-card-body">
                    <span className={`badge badge-${c.status === "active" ? "active" : "completed"}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                    <h3 style={{ marginTop: 10 }}>{c.title}</h3>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="progress-meta">
                      <span><strong>{formatINR(c.raised_amount)}</strong> raised</span>
                      <span>{percent}% funded</span>
                    </div>
                    <div className="entity-actions">
                      <Link to="/donate" className="btn btn-primary btn-sm">Donate</Link>
                      <Link to={`/campaigns/${c.id}`} className="btn btn-outline-dark btn-sm">Details</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {featuredCampaigns.length === 0 && <p className="inline-note">No active campaigns right now — check back soon.</p>}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="section section-alt">
        <div className="section-container">
          <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, maxWidth: "100%" }}>
            <div>
              <p className="section-label">On The Ground</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Projects</h2>
            </div>
            <Link to="/projects" className="btn btn-outline-dark btn-sm">View all projects</Link>
          </div>

          <div className="grid grid-3">
            {featuredProjects.map((p) => (
              <div className="card" key={p.id}>
                <div className="card-media">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} loading="lazy" />
                  ) : (
                    <div style={{ height: 180, background: "var(--color-accent-soft)" }} />
                  )}
                </div>
                <div className="entity-card-body">
                  <span className={`badge ${p.status === "ongoing" ? "badge-active" : `badge-${p.status}`}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                  <h3 style={{ marginTop: 10 }}>{p.title}</h3>
                  {p.location && <div className="entity-location">📍 {p.location}</div>}
                  <div className="entity-actions">
                    <Link to={`/projects/${p.id}`} className="btn btn-outline-dark btn-sm">View project</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {featuredProjects.length === 0 && <p className="inline-note">No projects listed yet.</p>}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section">
        <div className="section-container">
          <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, maxWidth: "100%" }}>
            <div>
              <p className="section-label">Get Involved</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Upcoming Events</h2>
            </div>
            <Link to="/events" className="btn btn-outline-dark btn-sm">View all events</Link>
          </div>

          <div className="grid grid-2">
            {upcomingEvents.map((ev) => {
              const d = ev.starts_at ? new Date(ev.starts_at) : null;
              const day = d ? d.getDate().toString().padStart(2, "0") : "--";
              const month = d ? d.toLocaleString("en-IN", { month: "short" }).toUpperCase() : "";
              return (
                <div className="card event-card" key={ev.id}>
                  <div className="event-date-badge">
                    <strong>{day}</strong>
                    <span>{month}</span>
                  </div>
                  <div className="event-info">
                    <span className="badge badge-upcoming">Upcoming</span>
                    <h3 style={{ marginTop: 10 }}>{ev.title}</h3>
                    {ev.location && <p>📍 {ev.location}</p>}
                    <Link to="/events" className="btn btn-outline-dark btn-sm" style={{ marginTop: 10 }}>Learn more</Link>
                  </div>
                </div>
              );
            })}
          </div>
          {upcomingEvents.length === 0 && <p className="inline-note">No upcoming events right now.</p>}
        </div>
      </section>

      {/* TESTIMONIALS / SUCCESS STORIES */}
      <section className="section section-alt">
        <div className="section-container">
          <div className="section-heading center">
            <p className="section-label" style={{ justifyContent: "center" }}>Success Stories</p>
            <h2 className="section-title">What people say about us</h2>
          </div>

          <div className="grid grid-3">
            {featuredTestimonials.map((t) => (
              <div className="card" key={t.id}>
                <div className="card-body">
                  <div style={{ fontSize: 26, color: "var(--color-accent)", lineHeight: 1, marginBottom: 10 }}>“</div>
                  <p style={{ marginBottom: 20 }}>{t.quote}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "var(--color-accent-soft)", color: "var(--color-accent-dark)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontFamily: "var(--font-heading)", fontSize: 14,
                      }}
                    >
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: 14, color: "var(--color-primary)" }}>{t.name}</strong>
                      <span style={{ fontSize: 12.5, color: "var(--color-text-faint)" }}>{t.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {featuredTestimonials.length === 0 && <p className="inline-note">No testimonials published yet.</p>}
        </div>
      </section>

      {/* FINAL CTA */}
      {/* JOIN OUR MISSION */}
<section className="mission-section">
  <div className="mission-bg-circle mission-circle-one"></div>
  <div className="mission-bg-circle mission-circle-two"></div>

  <div className="mission-container">

    {/* LEFT CONTENT */}
    <div className="mission-content">
      <div className="mission-label">
        <span className="mission-label-line"></span>
        JOIN OUR MISSION
      </div>

      <h2>
        Be The Reason
        <span>Someone Smiles Today</span>
      </h2>

      <p>
        Real change begins when we choose to care, support and take action.
        Join Helping Next and become a part of something meaningful.
      </p>

      <div className="mission-buttons">
        <Link to="/volunteer" className="mission-btn mission-btn-primary">
          Become a Volunteer
          <span>→</span>
        </Link>

        <Link to="/donate" className="mission-btn mission-btn-outline">
          Support Our Cause
          <span>♥</span>
        </Link>
      </div>
    </div>

    {/* RIGHT IMPACT CARD */}
    <div className="mission-visual">

      <div className="mission-card">

        <div className="mission-card-icon">
          ♥
        </div>

        <span className="mission-card-small">
          TOGETHER WE CAN
        </span>

        <h3>
          Small Actions.
          <br />
          <strong>Big Impact.</strong>
        </h3>

        <p>
          Your time, support and kindness can help create opportunities
          and bring hope to communities.
        </p>

        <div className="mission-card-bottom">
          <div>
            <strong>Helping Next</strong>
            <span>Making a difference together</span>
          </div>

          <div className="mission-heart">
            ♥
          </div>
        </div>

      </div>

      <div className="mission-floating-badge">
        <span>✦</span>
        <div>
          <strong>Be A Changemaker</strong>
          <small>Start today</small>
        </div>
      </div>

    </div>

  </div>
</section>

    </main>
  );
}

export default Home;