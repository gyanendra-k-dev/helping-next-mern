import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { active: "badge-active", draft: "badge-upcoming", completed: "badge-completed", archived: "badge-urgent" };

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "cover_image", label: "Cover Image", type: "image" },
  { name: "summary", label: "Short summary", type: "textarea" },
  { name: "goal_amount", label: "Goal amount (₹)", type: "number", required: true },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "end_date", label: "End date", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "draft", label: "Draft" },
      { value: "active", label: "Active" },
      { value: "completed", label: "Completed" },
      { value: "archived", label: "Archived" },
    ],
  },
];

function AdminCampaigns() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/campaigns");
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | null
  const [editingItem, setEditingItem] = useState(null);

  const openCreate = () => {
    setEditingItem(null);
    setModalMode("create");
  };

  const openEdit = (campaign) => {
    setEditingItem(campaign);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingItem(null);
  };

  const handleSubmit = async (values) => {
    if (modalMode === "edit") {
      await update(editingItem.id, values);
    } else {
      await create(values);
    }
    closeModal();
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Delete "${campaign.title}"? This cannot be undone.`)) return;
    await remove(campaign.id);
  };

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle="Create, publish and manage fundraising campaigns."
        action="Add Campaign"
        onAction={openCreate}
      />

      <DataTable
        title="All Campaigns"
        searchPlaceholder="Search campaigns…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "goal_amount", label: "Goal", render: (r) => `₹${Number(r.goal_amount).toLocaleString("en-IN")}` },
          { key: "raised_amount", label: "Raised", render: (r) => `₹${Number(r.raised_amount).toLocaleString("en-IN")}` },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                <button type="button" className="icon-btn" onClick={() => openEdit(r)} title="Edit">✎</button>
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(r)} title="Delete">🗑</button>
              </div>
            ),
          },
        ]}
        rows={items}
      />

      {modalMode && (
        <ResourceFormModal
          title={modalMode === "edit" ? `Edit ${editingItem.title}` : "New Campaign"}
          fields={FIELDS}
          initialValues={editingItem || {}}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export default AdminCampaigns;
