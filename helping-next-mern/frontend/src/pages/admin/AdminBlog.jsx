import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { published: "badge-active", draft: "badge-completed" };

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "cover_image", label: "Cover Image", type: "image" },
  { name: "excerpt", label: "Short excerpt", type: "textarea" },
  { name: "body", label: "Body", type: "textarea", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminBlog() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/blog");
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const openCreate = () => {
    setEditingItem(null);
    setModalMode("create");
  };

  const openEdit = (post) => {
    setEditingItem(post);
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

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await remove(post.id);
  };

  return (
    <>
      <PageHeader title="Blog & News" subtitle="Write and publish articles and updates." action="New Post" onAction={openCreate} />

      <DataTable
        title="All Posts"
        searchPlaceholder="Search posts…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "author", label: "Author", render: (r) => r.author?.name || "—" },
          { key: "date", label: "Published", render: (r) => formatDate(r.published_at) },
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
          title={modalMode === "edit" ? `Edit post` : "New Post"}
          fields={FIELDS}
          initialValues={editingItem || {}}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export default AdminBlog;
