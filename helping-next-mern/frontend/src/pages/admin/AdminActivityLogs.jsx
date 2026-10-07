import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";

const ACTION_BADGE = { created: "badge-active", updated: "badge-upcoming", deleted: "badge-urgent" };

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function AdminActivityLogs() {
  const { items, loading, error } = useAdminResource("/admin/activity-logs");

  return (
    <>
      <PageHeader title="Activity Logs" subtitle="An audit trail of changes made across the platform." />

      <DataTable
        title="Recent Activity"
        searchPlaceholder="Search logs…"
        loading={loading}
        error={error}
        columns={[
          { key: "user", label: "User", render: (r) => <span className="row-primary">{r.user?.name || "System"}</span> },
          { key: "action", label: "Action", render: (r) => <span className={`badge ${ACTION_BADGE[r.action]}`}>{r.action}</span> },
          { key: "description", label: "Details" },
          { key: "date", label: "Date & Time", render: (r) => formatDateTime(r.created_at) },
        ]}
        rows={items}
      />
    </>
  );
}

export default AdminActivityLogs;
