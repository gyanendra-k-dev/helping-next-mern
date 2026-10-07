import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { approved: "badge-active", pending: "badge-upcoming", rejected: "badge-urgent" };

function AdminVolunteers() {
  const { items, loading, error, update } = useAdminResource("/admin/volunteers");

  const setStatus = async (application, status) => {
    await update(application.id, { status });
  };

  return (
    <>
      <PageHeader title="Volunteers" subtitle="Review applications and manage active volunteers." />

      <DataTable
        title="All Volunteers"
        searchPlaceholder="Search volunteers…"
        loading={loading}
        error={error}
        columns={[
          { key: "name", label: "Name", render: (r) => <span className="row-primary">{r.user?.name || "—"}</span> },
          { key: "email", label: "Email", render: (r) => r.user?.email || "—" },
          { key: "area_of_interest", label: "Area of Interest", render: (r) => r.area_of_interest || "—" },
          { key: "hours_logged", label: "Hours Logged", render: (r) => `${r.hours_logged || 0} hrs` },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                {r.status === "pending" ? (
                  <>
                    <button type="button" className="icon-btn" onClick={() => setStatus(r, "approved")} title="Approve">✓</button>
                    <button type="button" className="icon-btn danger" onClick={() => setStatus(r, "rejected")} title="Reject">✕</button>
                  </>
                ) : (
                  <span style={{ color: "var(--color-text-faint)", fontSize: 12.5 }}>—</span>
                )}
              </div>
            ),
          },
        ]}
        rows={items}
      />
    </>
  );
}

export default AdminVolunteers;
