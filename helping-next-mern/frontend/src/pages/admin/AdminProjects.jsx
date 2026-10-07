import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { ongoing: "badge-active", completed: "badge-completed", upcoming: "badge-upcoming" };

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "cover_image", label: "Cover Image", type: "image" },
  { name: "location", label: "Location" },
  { name: "summary", label: "Short summary", type: "textarea" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "ongoing", label: "Ongoing" },
      { value: "completed", label: "Completed" },
    ],
  },
];

function AdminProjects() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/projects");
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const openCreate = () => {
    setEditingItem(null);
    setModalMode("create");
  };

  const openEdit = (project) => {
    setEditingItem(project);
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

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    await remove(project.id);
  };

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="On-ground projects linked to campaigns and beneficiaries."
        action="Add Project"
        onAction={openCreate}
      />

      <DataTable
        title="All Projects"
        searchPlaceholder="Search projects…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "location", label: "Location", render: (r) => r.location || "—" },
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
          title={modalMode === "edit" ? `Edit ${editingItem.title}` : "New Project"}
          fields={FIELDS}
          initialValues={editingItem || {}}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export default AdminProjects;
