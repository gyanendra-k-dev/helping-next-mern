import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import "./InnerPages.css";

function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/campaigns/${id}`)
      .then(({ data }) => {
        if (active) setCampaign(data);
      })
      .catch(() => {
        if (active) setError("Campaign not found.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="section">
        <div className="section-container">
          <p className="inline-note">Loading campaign…</p>
        </div>
      </section>
    );
  }

  if (error || !campaign) {
    return (
      <section className="section">
        <div className="section-container">
          <p className="inline-note">{error || "Campaign not found."}</p>
          <Link to="/campaigns" className="btn btn-outline-dark btn-sm" style={{ marginTop: 12 }}>
            ← Back to Campaigns
          </Link>
        </div>
      </section>
    );
  }

  const percent = Math.min(100, Math.round((Number(campaign.raised_amount) / Number(campaign.goal_amount || 1)) * 100));

  return (
    <>
      <section className="page-hero">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/campaigns">Campaigns</Link>
            <span>/</span>
            <span>#{id}</span>
          </div>
          <h1>{campaign.title}</h1>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="split-block">
            <div>
              {campaign.cover_image && (
                <div className="card-media" style={{ borderRadius: "var(--radius-md)", marginBottom: 30 }}>
                  <img src={campaign.cover_image} alt={campaign.title} />
                </div>
              )}

              <div className="section-label">Campaign Story</div>
              <h2 className="section-title">Why this matters</h2>
              {campaign.summary && <p className="section-subtitle" style={{ marginBottom: 14 }}>{campaign.summary}</p>}
              {campaign.description && <p className="section-subtitle" style={{ whiteSpace: "pre-wrap" }}>{campaign.description}</p>}
            </div>

            <div>
              <div className="donate-card">
                <span className={`badge badge-${campaign.status === "active" ? "active" : "completed"}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
                <div className="progress-track" style={{ marginTop: 16 }}>
                  <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="progress-meta">
                  <span><strong>{formatINR(campaign.raised_amount)}</strong> raised</span>
                  <span>of {formatINR(campaign.goal_amount)}</span>
                </div>
                <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--color-text-muted)" }}>{percent}% funded</p>

                <Link to={`/donate?campaign=${campaign.id}`} className="btn btn-primary btn-block" style={{ marginTop: 20 }}>
                  Donate to this campaign
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CampaignDetail;
