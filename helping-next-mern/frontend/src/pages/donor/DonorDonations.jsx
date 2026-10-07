import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";
import printDocument, { escapeHtml } from "../../utils/printDocument";

const STATUS_MAP = { success: "badge-active", pending: "badge-upcoming", failed: "badge-urgent", refunded: "badge-completed" };

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Mongo ids are long; show the last 8 characters as the human-friendly reference.
const refNo = (id) => String(id).slice(-8).toUpperCase();

function printReceipt(d) {
  const date = new Date(d.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  printDocument(
    `Receipt HN-${refNo(d.id)}`,
    `<div class="doc">
      <h1>Helping Next</h1><p class="muted">People · Purpose · Progress</p>
      <h2>Donation Receipt</h2>
      <p class="big">₹${Number(d.amount).toLocaleString("en-IN")}</p>
      <table>
        <tr><td>Receipt No.</td><td>HN-${refNo(d.id)}</td></tr>
        <tr><td>Date</td><td>${date}</td></tr>
        <tr><td>Received from</td><td>${escapeHtml(d.donor_name)} (${escapeHtml(d.donor_email)})</td></tr>
        <tr><td>Towards</td><td>${escapeHtml(d.campaign?.title || "General fund")}</td></tr>
        <tr><td>Payment reference</td><td>${escapeHtml(d.transaction_ref || "—")}</td></tr>
        <tr><td>Status</td><td>Paid</td></tr>
      </table>
      <p class="muted" style="margin-top:24px">Thank you for your generosity. This is a computer-generated receipt.</p>
    </div>`
  );
}

function DonorDonations() {
  const { items, loading, error } = useAdminResource("/donor/donations");

  return (
    <>
      <PageHeader title="My Donations" subtitle="Every contribution you've made, with downloadable receipts." />

      <DataTable
        title="Donation History"
        searchPlaceholder="Search by campaign…"
        loading={loading}
        error={error}
        columns={[
          { key: "id", label: "Ref. No.", render: (r) => <span className="row-muted">#{refNo(r.id)}</span> },
          { key: "campaign", label: "Campaign", render: (r) => <span className="row-primary">{r.campaign?.title || "—"}</span> },
          { key: "amount", label: "Amount", render: (r) => `₹${Number(r.amount).toLocaleString("en-IN")}` },
          { key: "date", label: "Date", render: (r) => formatDate(r.created_at) },
          { key: "method", label: "Method", render: (r) => r.payment_method || "—" },
          { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
          {
            key: "actions",
            label: "Receipt",
            render: (r) => (
              r.status === "success" ? (
                <button type="button" className="icon-btn" onClick={() => printReceipt(r)} title="Download / print receipt">
                  ⬇
                </button>
              ) : (
                <span style={{ color: "var(--color-text-faint)", fontSize: 12.5 }}>—</span>
              )
            ),
          },
        ]}
        rows={items}
      />
    </>
  );
}

export default DonorDonations;
