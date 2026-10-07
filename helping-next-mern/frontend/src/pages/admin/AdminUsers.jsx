import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import ResourceFormModal from "../../components/dashboard/ResourceFormModal";
import useAdminResource from "../../hooks/useAdminResource";

const ROLE_FIELDS = [
  { name: "name", label: "Full name", required: true },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { value: "admin", label: "Admin" },
      { value: "donor", label: "Donor" },
      { value: "volunteer", label: "Volunteer" },
    ],
  },
];

function AdminUsers() {
  const { items, loading, error, update, remove } = useAdminResource("/admin/users");
  const [editingUser, setEditingUser] = useState(null);

  const handleUpdate = async (values) => {
    await update(editingUser.id, values);
    setEditingUser(null);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;
    await remove(user.id);
  };

  return (
    <>
      <PageHeader title="Users & Roles" subtitle="Manage every account and its role across the platform." action="Add User" />

      <DataTable
        title="All Users"
        searchPlaceholder="Search users…"
        loading={loading}
        error={error}
        columns={[
          { key: "name", label: "Name", render: (r) => <span className="row-primary">{r.name}</span> },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (r) => <span style={{ textTransform: "capitalize" }}>{r.role}</span> },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                <button type="button" className="icon-btn" onClick={() => setEditingUser(r)} title="Edit role">
                  ✎
                </button>
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(r)} title="Delete user">
                  ⛔
                </button>
              </div>
            ),
          },
        ]}
        rows={items}
      />

      {editingUser && (
        <ResourceFormModal
          title={`Edit ${editingUser.name}`}
          fields={ROLE_FIELDS}
          initialValues={editingUser}
          onCancel={() => setEditingUser(null)}
          onSubmit={handleUpdate}
        />
      )}
    </>
  );
}

export default AdminUsers;
