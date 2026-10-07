const { Donation, Campaign, User, Project, Event } = require("../../models");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  const [raised, activeCampaigns, donors, volunteers, ongoingProjects, upcomingEvents, recent] = await Promise.all([
    Donation.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Campaign.countDocuments({ status: "active" }),
    User.countDocuments({ role: "donor" }),
    User.countDocuments({ role: "volunteer" }),
    Project.countDocuments({ status: "ongoing" }),
    Event.countDocuments({ status: "upcoming" }),
    Donation.find().sort({ created_at: -1, _id: -1 }).limit(10).populate(["donor", "campaign"]),
  ]);

  res.json({
    total_raised: raised[0]?.total || 0,
    active_campaigns: activeCampaigns,
    registered_donors: donors,
    active_volunteers: volunteers,
    ongoing_projects: ongoingProjects,
    upcoming_events: upcomingEvents,
    recent_donations: recent,
  });
});
