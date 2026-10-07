import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import useAdminResource from "../../hooks/useAdminResource";
import "./InnerPages.css";

const FILTERS = ["All", "Active", "Completed"];

function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function Campaigns() {
  const { items: campaigns, loading, error } = useAdminResource("/campaigns");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") return campaigns;
    return campaigns.filter((c) => c.status === filter.toLowerCase());
  }, [filter, campaigns]);

  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.campaigns} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Campaigns</span>
          </div>
          <p className="page-hero-eyebrow">Fundraising Campaigns</p>
          <h1>Give to a cause you can see progress on</h1>
          <p>Every campaign shows its goal, what's been raised so far and how many people have already contributed.</p>
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

          {loading && <p className="inline-note">Loading campaigns…</p>}
          {!loading && error && <p className="inline-note">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-3">
              {filtered.map((c) => {
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
                      <div className="entity-meta-row">
                        <span className={`badge badge-${c.status === "active" ? "active" : "completed"}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </div>
                      <h3>{c.title}</h3>

                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                      <div className="progress-meta">
                        <span><strong>{formatINR(c.raised_amount)}</strong> raised</span>
                        <span>of {formatINR(c.goal_amount)}</span>
                      </div>
                      <p style={{ marginTop: 10 }}>{c.contributions_count || 0} contributions · {percent}% funded</p>

                      <div className="entity-actions">
                        <Link to="/donate" className="btn btn-primary btn-sm">Donate</Link>
                        <Link to={`/campaigns/${c.id}`} className="btn btn-outline-dark btn-sm">Details</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="inline-note">No campaigns match this filter right now.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Campaigns;
