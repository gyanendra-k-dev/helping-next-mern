import { useMemo, useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

function AdminBeneficiaries() {
  const { items, loading, error, create, update, remove } = useAdminResource("/admin/beneficiaries");
  const { items: projects } = useAdminResource("/admin/projects");
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const fields = useMemo(
    () => [
      { name: "name", label: "Name", required: true },
      { name: "age", label: "Age", type: "number" },
      { name: "gender", label: "Gender" },
      { name: "location", label: "Location" },
      {
        name: "project_id",
        label: "Linked Project",
        type: "select",
        options: projects.map((p) => ({ value: p.id, label: p.title })),
      },
      { name: "notes", label: "Support given / notes", type: "textarea" },
    ],
    [projects]
  );

  const openCreate = () => {
    setEditingItem(null);
    setModalMode("create");
  };

  const openEdit = (beneficiary) => {
    setEditingItem(beneficiary);
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

  const handleDelete = async (beneficiary) => {
    if (!window.confirm(`Delete "${beneficiary.name}"? This cannot be undone.`)) return;
    await remove(beneficiary.id);
  };

  return (
    <>
      <PageHeader
        title="Beneficiaries"
        subtitle="People and families supported through Helping Next projects."
        action="Add Beneficiary"
        onAction={openCreate}
      />

      <DataTable
        title="All Beneficiaries"
        searchPlaceholder="Search beneficiaries…"
        loading={loading}
        error={error}
        columns={[
          { key: "name", label: "Name", render: (r) => <span className="row-primary">{r.name}</span> },
          { key: "project", label: "Linked Project", render: (r) => r.project?.title || "—" },
          { key: "location", label: "Location", render: (r) => r.location || "—" },
          { key: "notes", label: "Support / Notes", render: (r) => r.notes || "—" },
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
          title={modalMode === "edit" ? `Edit ${editingItem.name}` : "New Beneficiary"}
          fields={fields}
          initialValues={editingItem || {}}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export default AdminBeneficiaries;
