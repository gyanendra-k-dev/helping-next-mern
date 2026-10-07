import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";
import api from "../../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function DonorNotifications() {
  const { items, loading, error, setItems } = useAdminResource("/notifications");

  const markRead = async (n) => {
    const { data } = await api.post(`/notifications/${n.id}/read`);
    setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="Announcements and updates from Helping Next." />

      <DataTable
        title="All Notifications"
        searchPlaceholder="Search notifications…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "message", label: "Message" },
          { key: "date", label: "Date", render: (r) => formatDate(r.created_at) },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${r.is_read ? "badge-completed" : "badge-urgent"}`}>{r.is_read ? "Read" : "Unread"}</span> },
          {
            key: "actions",
            label: "",
            render: (r) => (!r.is_read ? <button type="button" className="icon-btn" onClick={() => markRead(r)} title="Mark as read">✓</button> : null),
          },
        ]}
        rows={items}
      />
    </>
  );
}

export default DonorNotifications;
