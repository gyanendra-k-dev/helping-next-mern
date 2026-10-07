import { useEffect, useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import api from "../../services/api";

const inr = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminReports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/reports")
      .then(({ data }) => setReport(data))
      .catch(() => setError("Failed to load reports."));
  }, []);

  if (error) return <p className="auth-error">{error}</p>;
  if (!report) return <div className="table-loading">Loading…</div>;

  const maxMonthly = Math.max(1, ...report.monthly_donations.map((m) => Number(m.total)));
  const thisMonth = report.monthly_donations[report.monthly_donations.length - 1];
  const lastMonth = report.monthly_donations[report.monthly_donations.length - 2];
  const successStats = report.donations_by_status.find((s) => s.status === "success");

  const exportCsv = () =>
    downloadCsv("monthly-donations.csv", [
      ["Month", "Total Donations (INR)"],
      ...report.monthly_donations.map((m) => [m.month, m.total]),
    ]);

  return (
    <>
      <PageHeader title="Reports" subtitle="Donation and campaign performance at a glance." />

      <div className="dash-stats">
        <StatCard icon="₹" label="Donations — This Month" value={inr(thisMonth?.total)} tile="tile-1" />
        <StatCard icon="↻" label="Last Month" value={inr(lastMonth?.total)} tile="tile-2" />
        <StatCard icon="📊" label="Avg. Donation" value={inr(report.average_donation)} tile="tile-3" />
        <StatCard icon="⏱" label="Volunteer Hours Logged" value={`${report.total_volunteer_hours} hrs`} tile="tile-4" />
      </div>

      <div className="dash-panel" style={{ marginBottom: 24 }}>
        <div className="dash-panel-header">
          <div>
            <h2>Donations — Last 6 Months</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
              Successful payments only{successStats ? ` · ${successStats.count} total` : ""}
            </p>
          </div>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200, padding: "20px 24px 8px" }}>
          {report.monthly_donations.map((m) => (
            <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginBottom: 4 }}>{inr(m.total)}</span>
              <div
                title={`${m.month}: ${inr(m.total)}`}
                style={{
                  width: "100%",
                  maxWidth: 56,
                  height: `${Math.max(2, (Number(m.total) / maxMonthly) * 100)}%`,
                  background: "var(--color-accent)",
                  borderRadius: "6px 6px 0 0",
                }}
              />
              <span style={{ fontSize: 12, marginTop: 6 }}>{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2>Top Campaigns by Amount Raised</h2>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Raised</th>
                <th>Goal</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {report.top_campaigns.map((c) => {
                const pct = Math.min(100, Math.round((Number(c.raised_amount) / Number(c.goal_amount || 1)) * 100));
                return (
                  <tr key={c.id}>
                    <td><span className="row-primary">{c.title}</span></td>
                    <td>{inr(c.raised_amount)}</td>
                    <td>{inr(c.goal_amount)}</td>
                    <td>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {report.top_campaigns.length === 0 && <div className="table-empty">No campaigns yet.</div>}
        </div>
      </div>
    </>
  );
}

export default AdminReports;
