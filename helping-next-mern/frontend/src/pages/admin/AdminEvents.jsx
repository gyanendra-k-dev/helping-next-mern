import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { upcoming: "badge-upcoming", ongoing: "badge-active", completed: "badge-completed", cancelled: "badge-urgent" };

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "location", label: "Venue" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "starts_at", label: "Starts at", type: "datetime-local" },
  { name: "ends_at", label: "Ends at", type: "datetime-local" },
  { name: "capacity", label: "Capacity", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "ongoing", label: "Ongoing" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminEvents() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/events");
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const openCreate = () => {
    setEditingItem(null);
    setModalMode("create");
  };

  const openEdit = (event) => {
    setEditingItem(event);
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

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    await remove(event.id);
  };

  return (
    <>
      <PageHeader title="Events" subtitle="Plan events and track registrations." action="Add Event" onAction={openCreate} />

      <DataTable
        title="All Events"
        searchPlaceholder="Search events…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "location", label: "Venue", render: (r) => r.location || "—" },
          { key: "date", label: "Date", render: (r) => formatDate(r.starts_at) },
          {
            key: "registered",
            label: "Registered",
            render: (r) => `${r.registrations_count ?? 0} / ${r.capacity || "Open"}`,
          },
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
          title={modalMode === "edit" ? `Edit ${editingItem.title}` : "New Event"}
          fields={FIELDS}
          initialValues={editingItem || {}}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export default AdminEvents;
