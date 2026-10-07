import { useEffect, useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import api from "../../services/api";

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/admin/dashboard")
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Failed to load dashboard stats.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const donations = stats?.recent_donations || [];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="An overview of platform activity across the NGO." />

      {error && <p className="auth-error">{error}</p>}

      <div className="dash-stats">
        <StatCard icon="₹" label="Total Raised (All Time)" value={loading ? "…" : formatCurrency(stats?.total_raised)} tile="tile-1" />
        <StatCard icon="✦" label="Active Campaigns" value={loading ? "…" : stats?.active_campaigns ?? 0} tile="tile-2" />
        <StatCard icon="👥" label="Registered Donors" value={loading ? "…" : stats?.registered_donors ?? 0} tile="tile-3" />
        <StatCard icon="🙋" label="Active Volunteers" value={loading ? "…" : stats?.active_volunteers ?? 0} tile="tile-4" />
      </div>

      <div className="dash-stats">
        <StatCard icon="🗂" label="Ongoing Projects" value={loading ? "…" : stats?.ongoing_projects ?? 0} tile="tile-5" />
        <StatCard icon="🎟" label="Upcoming Events" value={loading ? "…" : stats?.upcoming_events ?? 0} tile="tile-6" />
      </div>

      <DataTable
        title="Recent Donations"
        subtitle="Latest transactions across all campaigns"
        searchPlaceholder="Search donor or campaign…"
        loading={loading}
        error={error && !stats ? error : ""}
        columns={[
          {
            key: "donor",
            label: "Donor",
            render: (r) => <span className="row-primary">{r.is_anonymous ? "Anonymous" : r.donor?.name || r.donor_name || "—"}</span>,
          },
          { key: "campaign", label: "Campaign", render: (r) => r.campaign?.title || "—" },
          { key: "amount", label: "Amount", render: (r) => `₹${Number(r.amount).toLocaleString("en-IN")}` },
          { key: "date", label: "Date", render: (r) => formatDate(r.created_at) },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span className={`badge ${r.status === "success" ? "badge-active" : r.status === "pending" ? "badge-upcoming" : "badge-urgent"}`}>
                {r.status}
              </span>
            ),
          },
        ]}
        rows={donations}
      />
    </>
  );
}

export default AdminOverview;
