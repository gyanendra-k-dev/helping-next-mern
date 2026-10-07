import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";

const STATUS_MAP = { success: "badge-active", pending: "badge-upcoming", failed: "badge-urgent", refunded: "badge-completed" };

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminDonations() {
  const { items, loading, error, update } = useAdminResource("/admin/donations");

  const markStatus = async (donation, status) => {
    await update(donation.id, { status });
  };

  return (
    <>
      <PageHeader title="Donations" subtitle="All donation transactions across every campaign." />

      <DataTable
        title="All Donations"
        searchPlaceholder="Search donor or campaign…"
        loading={loading}
        error={error}
        columns={[
          {
            key: "donor",
            label: "Donor",
            render: (r) => <span className="row-primary">{r.is_anonymous ? "Anonymous" : r.donor?.name || r.donor_name || "—"}</span>,
          },
          { key: "campaign", label: "Campaign", render: (r) => r.campaign?.title || "—" },
          { key: "amount", label: "Amount", render: (r) => `₹${Number(r.amount).toLocaleString("en-IN")}` },
          { key: "method", label: "Method", render: (r) => r.payment_method || "—" },
          { key: "date", label: "Date", render: (r) => formatDate(r.created_at) },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="row-actions">
                {r.status === "pending" ? (
                  <>
                    <button type="button" className="icon-btn" onClick={() => markStatus(r, "success")} title="Mark as successful">✓</button>
                    <button type="button" className="icon-btn danger" onClick={() => markStatus(r, "failed")} title="Mark as failed">✕</button>
                  </>
                ) : r.status === "success" ? (
                  <button type="button" className="icon-btn danger" onClick={() => markStatus(r, "refunded")} title="Mark as refunded">↩</button>
                ) : (
                  <span style={{ color: "var(--color-text-faint)", fontSize: 12.5 }}>—</span>
                )}
              </div>
            ),
          },
        ]}
        rows={items}
      />
    </>
  );
}

export default AdminDonations;
