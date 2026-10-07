import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";

function AdminDonors() {
  const { items, loading, error, update } = useAdminResource("/admin/users?role=donor");

  const toggleActive = async (donor) => {
    const verb = donor.is_active ? "block" : "unblock";
    if (!window.confirm(`Are you sure you want to ${verb} ${donor.name}?`)) return;
    await update(donor.id, { is_active: !donor.is_active });
  };

  return (
    <>
      <PageHeader title="Donors" subtitle="Everyone who has donated through the platform." />

      <DataTable
        title="All Donors"
        searchPlaceholder="Search donors…"
        loading={loading}
        error={error}
        columns={[
          { key: "name", label: "Name", render: (r) => <span className="row-primary">{r.name}</span> },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
          { key: "total_given", label: "Total Given", render: (r) => `₹${Number(r.total_given || 0).toLocaleString("en-IN")}` },
          { key: "donations_count", label: "Donations" },
          {
            key: "status",
            label: "Status",
            render: (r) => <span className={`badge ${r.is_active ? "badge-active" : "badge-urgent"}`}>{r.is_active ? "Active" : "Blocked"}</span>,
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                <button type="button" className="icon-btn danger" onClick={() => toggleActive(r)} title={r.is_active ? "Block donor" : "Unblock donor"}>
                  {r.is_active ? "⛔" : "✓"}
                </button>
              </div>
            ),
          },
        ]}
        rows={items}
      />
    </>
  );
}

export default AdminDonors;
