import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const FIELDS = [
  { name: "name", label: "Name", required: true },
  { name: "role", label: "Role (Donor / Volunteer / Beneficiary)" },
  { name: "photo", label: "Photo", type: "image" },
  { name: "quote", label: "Message", type: "textarea", required: true },
];

function AdminTestimonials() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/testimonials");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (values) => {
    await create({ ...values, is_published: false });
    setShowModal(false);
  };

  const publish = async (item) => {
    await update(item.id, { is_published: true });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete testimonial from ${item.name}?`)) return;
    await remove(item.id);
  };

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="Approve and manage stories shared by donors, volunteers and beneficiaries."
        action="Add Testimonial"
        onAction={() => setShowModal(true)}
      />

      <DataTable
        title="All Testimonials"
        searchPlaceholder="Search testimonials…"
        loading={loading}
        error={error}
        columns={[
          { key: "name", label: "Name", render: (r) => <span className="row-primary">{r.name}</span> },
          { key: "role", label: "Role", render: (r) => r.role || "—" },
          { key: "quote", label: "Message" },
          {
            key: "status",
            label: "Status",
            render: (r) => <span className={`badge ${r.is_published ? "badge-active" : "badge-upcoming"}`}>{r.is_published ? "Published" : "Pending"}</span>,
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                {!r.is_published && (
                  <button type="button" className="icon-btn" onClick={() => publish(r)} title="Publish">✓</button>
                )}
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(r)} title="Delete">🗑</button>
              </div>
            ),
          },
        ]}
        rows={items}
      />

      {showModal && (
        <ResourceFormModal title="Add Testimonial" fields={FIELDS} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  );
}

export default AdminTestimonials;
