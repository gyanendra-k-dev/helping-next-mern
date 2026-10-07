import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const AUDIENCE_LABEL = { all: "All users", donor: "Donors", volunteer: "Volunteers" };

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "message", label: "Message", type: "textarea", required: true },
  {
    name: "audience",
    label: "Send to",
    type: "select",
    required: true,
    options: [
      { value: "all", label: "All donors & volunteers" },
      { value: "donor", label: "Donors only" },
      { value: "volunteer", label: "Volunteers only" },
    ],
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminNotifications() {
  const { items, loading, error, create } = useAdminResource("/admin/notifications");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (values) => {
    await create(values);
    setShowModal(false);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Send announcements to donors and volunteers."
        action="New Notification"
        onAction={() => setShowModal(true)}
      />

      <DataTable
        title="Sent Notifications"
        searchPlaceholder="Search notifications…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "message", label: "Message" },
          { key: "audience", label: "Audience", render: (r) => AUDIENCE_LABEL[r.audience] || r.audience },
          { key: "recipients", label: "Recipients" },
          { key: "date", label: "Sent", render: (r) => formatDate(r.created_at) },
        ]}
        rows={items}
      />

      {showModal && (
        <ResourceFormModal title="New Notification" fields={FIELDS} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  );
}

export default AdminNotifications;
