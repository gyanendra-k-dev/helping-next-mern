import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import Modal from "../../components/dashboard/Modal";
import useAdminResource from "../../hooks/useAdminResource";
import api from "../../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminMessages() {
  const { items, loading, error, setItems } = useAdminResource("/admin/messages");
  const [openMessage, setOpenMessage] = useState(null);

  const handleOpen = async (message) => {
    const { data } = await api.get(`/admin/messages/${message.id}`);
    setOpenMessage(data);
    setItems((prev) => prev.map((m) => (m.id === data.id ? data : m)));
  };

  return (
    <>
      <PageHeader title="Contact Messages" subtitle="Enquiries submitted through the public contact form." />

      <DataTable
        title="Inbox"
        searchPlaceholder="Search messages…"
        loading={loading}
        error={error}
        columns={[
          { key: "name", label: "From", render: (r) => <span className="row-primary">{r.name}</span> },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject", render: (r) => r.subject || "(no subject)" },
          { key: "date", label: "Date", render: (r) => formatDate(r.created_at) },
          {
            key: "status",
            label: "Status",
            render: (r) => <span className={`badge ${r.is_read ? "badge-active" : "badge-urgent"}`}>{r.is_read ? "Read" : "New"}</span>,
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <button type="button" className="icon-btn" onClick={() => handleOpen(r)} title="Open message">👁</button>
            ),
          },
        ]}
        rows={items}
      />

      {openMessage && (
        <Modal title={openMessage.subject || "(no subject)"} onClose={() => setOpenMessage(null)}>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12 }}>
            From <strong>{openMessage.name}</strong> ({openMessage.email}) — {formatDate(openMessage.created_at)}
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{openMessage.message}</p>
        </Modal>
      )}
    </>
  );
}

export default AdminMessages;
