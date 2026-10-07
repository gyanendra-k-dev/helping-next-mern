const { Campaign, Donation } = require("../../models");
const { paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  res.json(await paginate(req, Campaign, { filter: { status: "active" }, perPage: 20 }));
});

// Campaigns this donor has actually given to.
exports.supported = asyncHandler(async (req, res) => {
  const ids = await Donation.distinct("campaign_id", { donor_id: req.user._id, status: "success", campaign_id: { $ne: null } });
  res.json(await Campaign.find({ _id: { $in: ids } }));
});
