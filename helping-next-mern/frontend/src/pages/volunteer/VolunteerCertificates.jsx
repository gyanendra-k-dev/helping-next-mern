import { useMemo } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";
import useAuth from "../../hooks/useAuth";
import printDocument, { escapeHtml } from "../../utils/printDocument";

// A certificate unlocks automatically once total logged hours cross a milestone.
const MILESTONES = [10, 25, 50, 100, 250];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function VolunteerCertificates() {
  const { user } = useAuth();
  const { items: applications, loading, error } = useAdminResource("/volunteer/applications");

  const { hoursLog, totalHours, certificates } = useMemo(() => {
    const log = applications.filter((a) => (a.hours_logged || 0) > 0);
    const total = log.reduce((sum, a) => sum + a.hours_logged, 0);
    const latest = log.reduce((max, a) => (a.updated_at > max ? a.updated_at : max), "");
    const certs = MILESTONES.filter((m) => total >= m).map((m) => ({
      id: m,
      hours: m,
      title: `${m} Hours of Service Recognition`,
      issued: latest,
    }));
    return { hoursLog: log, totalHours: total, certificates: certs };
  }, [applications]);

  const printCertificate = (c) =>
    printDocument(
      c.title,
      `<div class="doc center">
        <h1>Certificate of Appreciation</h1>
        <p class="muted">Helping Next — People · Purpose · Progress</p>
        <p style="margin-top:36px">This is proudly presented to</p>
        <p class="big"><strong>${escapeHtml(user?.name)}</strong></p>
        <p>in recognition of <strong>${c.hours} hours</strong> of dedicated volunteer service.</p>
        <p class="muted" style="margin-top:40px">Issued on ${formatDate(c.issued)}</p>
      </div>`
    );

  return (
    <>
      <PageHeader title="Hours & Certificates" subtitle="Your logged volunteer hours and earned certificates." />

      <div className="dash-stats" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <StatCard icon="⏱" label="Total Hours" value={loading ? "…" : `${totalHours} hrs`} tile="tile-1" />
        <StatCard icon="🏅" label="Certificates Earned" value={loading ? "…" : certificates.length} tile="tile-4" />
      </div>

      <DataTable
        title="Hours Log"
        searchPlaceholder="Search activity…"
        loading={loading}
        error={error}
        columns={[
          { key: "activity", label: "Activity", render: (r) => <span className="row-primary">{r.area_of_interest || "General volunteering"}</span> },
          { key: "date", label: "Last updated", render: (r) => formatDate(r.updated_at) },
          { key: "hours", label: "Hours", render: (r) => `${r.hours_logged} hrs` },
        ]}
        rows={hoursLog}
      />

      <div style={{ height: 20 }}></div>

      <DataTable
        title="Certificates"
        searchPlaceholder="Search certificates…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Certificate", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "issued", label: "Issued On", render: (r) => formatDate(r.issued) },
          {
            key: "actions",
            label: "Download",
            render: (r) => (
              <button type="button" className="icon-btn" onClick={() => printCertificate(r)} title="Download / print certificate">
                ⬇
              </button>
            ),
          },
        ]}
        rows={certificates}
      />

      <p style={{ marginTop: 14, fontSize: 13, color: "var(--color-text-muted)" }}>
        Certificates unlock at {MILESTONES.join(", ")} hours. Hours are logged by the Helping Next team after each activity.
      </p>
    </>
  );
}

export default VolunteerCertificates;
