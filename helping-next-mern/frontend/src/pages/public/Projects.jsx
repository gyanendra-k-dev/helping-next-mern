import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import useAdminResource from "../../hooks/useAdminResource";
import "./InnerPages.css";

const FILTERS = ["All", "Ongoing", "Upcoming", "Completed"];

function Projects() {
  const { items: projects, loading, error } = useAdminResource("/projects");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter((p) => p.status === filter.toLowerCase());
  }, [filter, projects]);

  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.projects} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Projects</span>
          </div>
          <p className="page-hero-eyebrow">On-Ground Projects</p>
          <h1>Where our campaigns turn into real work</h1>
          <p>Each project tracks its own objectives, location and status — from planning through to completion.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="inline-note">Loading projects…</p>}
          {!loading && error && <p className="inline-note">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-3">
              {filtered.map((p) => (
                <div className="card" key={p.id}>
                  <div className="card-media">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} loading="lazy" />
                    ) : (
                      <div style={{ height: 180, background: "var(--color-accent-soft)" }} />
                    )}
                  </div>
                  <div className="entity-card-body">
                    <div className="entity-meta-row">
                      <span className={`badge badge-${p.status === "ongoing" ? "active" : p.status}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>
                    <h3>{p.title}</h3>
                    {p.location && <div className="entity-location">📍 {p.location}</div>}
                    {p.summary && <p style={{ marginTop: 10 }}>{p.summary}</p>}
                    <div className="entity-actions">
                      <Link to={`/projects/${p.id}`} className="btn btn-outline-dark btn-sm">View project</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="inline-note">No projects match this filter right now.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Projects;
