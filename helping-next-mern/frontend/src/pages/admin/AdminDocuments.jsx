import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "category", label: "Category (Annual Report / Financial / Registration / Impact)" },
  { name: "year", label: "Year", type: "number" },
  { name: "file_path", label: "File (PDF or image)", type: "file", required: true },
  { name: "is_public", label: "Show on public Transparency page", type: "checkbox" },
];

function AdminDocuments() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/documents");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (values) => {
    await create(values);
    setShowModal(false);
  };

  const togglePublic = async (doc) => {
    await update(doc.id, { is_public: !doc.is_public });
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    await remove(doc.id);
  };

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Registration, financial and transparency documents shown on the public Transparency page."
        action="Upload Document"
        onAction={() => setShowModal(true)}
      />

      <DataTable
        title="All Documents"
        searchPlaceholder="Search documents…"
        loading={loading}
        error={error}
        columns={[
          { key: "title", label: "Title", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "category", label: "Category", render: (r) => r.category || "—" },
          { key: "year", label: "Year", render: (r) => r.year || "—" },
          {
            key: "visibility",
            label: "Visibility",
            render: (r) => <span className={`badge ${r.is_public ? "badge-active" : "badge-completed"}`}>{r.is_public ? "Public" : "Internal"}</span>,
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                <a href={r.file_path} target="_blank" rel="noreferrer" className="icon-btn" title="Download">⬇</a>
                <button type="button" className="icon-btn" onClick={() => togglePublic(r)} title={r.is_public ? "Make internal" : "Make public"}>
                  {r.is_public ? "🔒" : "🌐"}
                </button>
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(r)} title="Delete">🗑</button>
              </div>
            ),
          },
        ]}
        rows={items}
      />

      {showModal && (
        <ResourceFormModal title="Upload Document" fields={FIELDS} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  );
}

export default AdminDocuments;
