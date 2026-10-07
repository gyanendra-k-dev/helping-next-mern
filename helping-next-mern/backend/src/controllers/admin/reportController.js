const { Donation, Campaign, VolunteerApplication } = require("../../models");
const asyncHandler = require("../../utils/asyncHandler");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

exports.index = asyncHandler(async (req, res) => {
  // Last 6 calendar months (UTC), oldest first, zero-filled.
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const buckets = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    buckets.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, month: `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`, total: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  const recent = await Donation.find({ status: "success", created_at: { $gte: start } }, "amount created_at");
  for (const d of recent) {
    const b = byKey.get(`${d.created_at.getUTCFullYear()}-${d.created_at.getUTCMonth()}`);
    if (b) b.total += d.amount;
  }

  // Single-accumulator pipelines only (portable across MongoDB-compatible servers).
  const [statusCounts, statusTotals, topCampaigns, hours, successTotal, successCount] = await Promise.all([
    Donation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Donation.aggregate([{ $group: { _id: "$status", total: { $sum: "$amount" } } }]),
    Campaign.find({}, "title goal_amount raised_amount status").sort({ raised_amount: -1, _id: 1 }).limit(5),
    VolunteerApplication.aggregate([{ $group: { _id: null, total: { $sum: "$hours_logged" } } }]),
    Donation.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Donation.countDocuments({ status: "success" }),
  ]);
  const totals = new Map(statusTotals.map((r) => [r._id, r.total]));
  const byStatus = statusCounts.map((r) => ({ status: r._id, count: r.count, total: totals.get(r._id) || 0 }));

  res.json({
    monthly_donations: buckets.map(({ month, total }) => ({ month, total })),
    donations_by_status: byStatus,
    top_campaigns: topCampaigns,
    total_volunteer_hours: hours[0]?.total || 0,
    average_donation: successCount ? (successTotal[0]?.total || 0) / successCount : 0,
  });
});
