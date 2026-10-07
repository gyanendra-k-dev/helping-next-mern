import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import useAdminResource from "../../hooks/useAdminResource";
import "../public/InnerPages.css";

function DonorCampaigns() {
  const { items: campaigns, loading: loadingCampaigns, error: campaignsError } = useAdminResource("/donor/campaigns/supported");
  const { items: donations, loading: loadingDonations } = useAdminResource("/donor/donations");

  const loading = loadingCampaigns || loadingDonations;

  const supported = useMemo(() => {
    return campaigns.map((c) => {
      const given = donations
        .filter((d) => d.campaign_id === c.id && d.status === "success")
        .reduce((sum, d) => sum + Number(d.amount), 0);
      return { ...c, given };
    });
  }, [campaigns, donations]);

  return (
    <>
      <PageHeader title="Supported Campaigns" subtitle="Campaigns you've contributed to and how they're progressing." />

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>}
      {!loading && campaignsError && <p className="auth-error">{campaignsError}</p>}
      {!loading && !campaignsError && supported.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>
          You haven't donated to any campaign yet. <Link to="/donate">Browse campaigns to donate →</Link>
        </p>
      )}

      <div className="grid grid-3">
        {supported.map((c) => {
          const percent = Math.min(100, Math.round((Number(c.raised_amount) / Number(c.goal_amount || 1)) * 100));
          return (
            <div className="card" key={c.id}>
              <div className="card-media">
                {c.cover_image ? (
                  <img src={c.cover_image} alt={c.title} loading="lazy" />
                ) : (
                  <div style={{ height: 160, background: "var(--color-accent-soft)" }} />
                )}
              </div>
              <div className="entity-card-body">
                <h3>{c.title}</h3>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="progress-meta">
                  <span>{percent}% funded</span>
                  <span>Your total: ₹{c.given.toLocaleString("en-IN")}</span>
                </div>
                <div className="entity-actions">
                  <Link to="/donate" className="btn btn-primary btn-sm">Donate again</Link>
                  <Link to={`/campaigns/${c.id}`} className="btn btn-outline-dark btn-sm">Details</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default DonorCampaigns;
