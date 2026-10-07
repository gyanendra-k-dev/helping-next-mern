import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_MAP = { success: "badge-active", pending: "badge-upcoming", failed: "badge-urgent", refunded: "badge-completed" };

function DonorOverview() {
  const { items: donations, loading, error } = useAdminResource("/donor/donations");

  const stats = useMemo(() => {
    const successful = donations.filter((d) => d.status === "success");
    const totalDonated = successful.reduce((sum, d) => sum + Number(d.amount), 0);
    const campaignsSupported = new Set(successful.map((d) => d.campaign_id)).size;
    const pendingCount = donations.filter((d) => d.status === "pending").length;
    return {
      totalDonated,
      campaignsSupported,
      receiptsIssued: successful.length,
      pendingCount,
    };
  }, [donations]);

  const recent = donations.slice(0, 5);

  return (
    <>
      <PageHeader title="Welcome back 👋" subtitle="Here's a summary of your giving with Helping Next." />

      <div className="dash-stats">
        <StatCard icon="₹" label="Total Donated" value={loading ? "…" : `₹${stats.totalDonated.toLocaleString("en-IN")}`} tile="tile-1" />
        <StatCard icon="✦" label="Campaigns Supported" value={loading ? "…" : stats.campaignsSupported} tile="tile-2" />
        <StatCard icon="🧾" label="Receipts Issued" value={loading ? "…" : stats.receiptsIssued} tile="tile-3" />
        <StatCard icon="⏳" label="Pending Donations" value={loading ? "…" : stats.pendingCount} tile="tile-4" />
      </div>

      <DataTable
        title="Recent Donations"
        subtitle="Your last few contributions"
        searchPlaceholder="Search donations…"
        loading={loading}
        error={error}
        columns={[
          { key: "campaign", label: "Campaign", render: (r) => <span className="row-primary">{r.campaign?.title || "—"}</span> },
          { key: "amount", label: "Amount", render: (r) => `₹${Number(r.amount).toLocaleString("en-IN")}` },
          { key: "date", label: "Date", render: (r) => formatDate(r.created_at) },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
        ]}
        rows={recent}
      />

      <p style={{ marginTop: 18, fontSize: 13.5, color: "var(--color-text-muted)" }}>
        <Link to="/dashboard/donor/donations">View all donations →</Link>
      </p>
    </>
  );
}

export default DonorOverview;
