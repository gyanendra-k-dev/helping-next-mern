import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { approved: "badge-active", pending: "badge-upcoming", rejected: "badge-urgent" };

const FIELDS = [
  { name: "area_of_interest", label: "Area of interest", required: true },
  { name: "availability", label: "Your availability", type: "textarea" },
  { name: "message", label: "Message to the team", type: "textarea" },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function VolunteerApplications() {
  const { items, loading, error, create } = useAdminResource("/volunteer/applications");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (values) => {
    await create(values);
    setShowModal(false);
  };

  return (
    <>
      <PageHeader
        title="My Applications"
        subtitle="Track the status of activities you've applied to."
        action="New Application"
        onAction={() => setShowModal(true)}
      />

      <DataTable
        title="Applications"
        searchPlaceholder="Search applications…"
        loading={loading}
        error={error}
        columns={[
          { key: "area_of_interest", label: "Area of Interest", render: (r) => <span className="row-primary">{r.area_of_interest || "General"}</span> },
          { key: "applied_on", label: "Applied On", render: (r) => formatDate(r.created_at) },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
        ]}
        rows={items}
      />

      {showModal && (
        <ResourceFormModal title="New Application" fields={FIELDS} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  );
}

export default VolunteerApplications;
