import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { registered: "badge-upcoming", attended: "badge-active", cancelled: "badge-urgent" };

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function VolunteerOverview() {
  const { items: applications, loading: loadingApps } = useAdminResource("/volunteer/applications");
  const { items: myEvents, loading: loadingEvents, error } = useAdminResource("/volunteer/my-events");

  const loading = loadingApps || loadingEvents;

  const stats = useMemo(() => {
    const hours = applications.reduce((sum, a) => sum + (a.hours_logged || 0), 0);
    const attended = myEvents.filter((r) => r.status === "attended").length;
    return {
      hours,
      applicationsCount: applications.length,
      eventsRegistered: myEvents.length,
      eventsAttended: attended,
    };
  }, [applications, myEvents]);

  return (
    <>
      <PageHeader title="Welcome back 👋" subtitle="Here's what's happening with your volunteering." />

      <div className="dash-stats">
        <StatCard icon="⏱" label="Hours Contributed" value={loading ? "…" : `${stats.hours} hrs`} tile="tile-1" />
        <StatCard icon="📋" label="Applications" value={loading ? "…" : stats.applicationsCount} tile="tile-2" />
        <StatCard icon="🎟" label="Events Registered" value={loading ? "…" : stats.eventsRegistered} tile="tile-3" />
        <StatCard icon="✓" label="Events Attended" value={loading ? "…" : stats.eventsAttended} tile="tile-4" />
      </div>

      <DataTable
        title="Your Event Registrations"
        searchPlaceholder="Search events…"
        loading={loading}
        error={error}
        columns={[
          { key: "event", label: "Event", render: (r) => <span className="row-primary">{r.event?.title || "—"}</span> },
          { key: "date", label: "Date", render: (r) => formatDate(r.event?.starts_at) },
          { key: "location", label: "Venue", render: (r) => r.event?.location || "—" },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
        ]}
        rows={myEvents}
      />

      <p style={{ marginTop: 18, fontSize: 13.5, color: "var(--color-text-muted)" }}>
        <Link to="/dashboard/volunteer/events">Browse more events to register →</Link>
      </p>
    </>
  );
}

export default VolunteerOverview;
