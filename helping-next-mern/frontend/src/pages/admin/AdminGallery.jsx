import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

// image_path stores the uploaded file's public URL (see ResourceFormModal's "image" field).
const FIELDS = [
  { name: "title", label: "Title" },
  { name: "image_path", label: "Image", type: "image", required: true },
  { name: "album", label: "Album / linked to" },
];

function AdminGallery() {
  const { items, loading, error, create, remove } = useAdminResource("/admin/gallery");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (values) => {
    await create(values);
    setShowModal(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Remove this image from the gallery?")) return;
    await remove(item.id);
  };

  return (
    <>
      <PageHeader title="Gallery" subtitle="Photos linked to campaigns and events." action="Add Image" onAction={() => setShowModal(true)} />

      <DataTable
        title="Media Library"
        searchPlaceholder="Search media…"
        loading={loading}
        error={error}
        columns={[
          {
            key: "title",
            label: "Preview",
            render: (r) =>
              r.image_path ? (
                <img src={r.image_path} alt={r.title || "Gallery item"} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }} />
              ) : (
                "—"
              ),
          },
          { key: "title2", label: "Title", render: (r) => <span className="row-primary">{r.title || "Untitled"}</span> },
          { key: "album", label: "Album", render: (r) => r.album || "—" },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(r)} title="Delete">🗑</button>
              </div>
            ),
          },
        ]}
        rows={items}
      />

      {showModal && (
        <ResourceFormModal title="Add Image" fields={FIELDS} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  );
}

export default AdminGallery;
