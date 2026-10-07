const { Campaign, Donation } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const { makeSlug } = require("../../utils/slug");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, Campaign, { perPage: 20 })));

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["required", "string", "max:255"],
    cover_image: ["nullable", "string"],
    summary: ["nullable", "string"],
    description: ["nullable", "string"],
    goal_amount: ["required", "numeric", "min:0"],
    start_date: ["nullable", "date"],
    end_date: ["nullable", "date", "after_or_equal:start_date"],
    status: ["required", "in:draft,active,completed,archived"],
  });
  const campaign = await Campaign.create({ ...data, slug: makeSlug(data.title), created_by: req.user._id });
  res.status(201).json(campaign);
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(Campaign, req.params.id, "donations")));

exports.update = asyncHandler(async (req, res) => {
  const campaign = await findOrFail(Campaign, req.params.id);
  const data = await validate(req.body, {
    title: ["sometimes", "string", "max:255"],
    cover_image: ["nullable", "string"],
    summary: ["nullable", "string"],
    description: ["nullable", "string"],
    goal_amount: ["sometimes", "numeric", "min:0"],
    start_date: ["nullable", "date"],
    end_date: ["nullable", "date"],
    status: ["sometimes", "in:draft,active,completed,archived"],
  });
  campaign.set(data);
  await campaign.save();
  res.json(campaign);
});

exports.destroy = asyncHandler(async (req, res) => {
  const campaign = await findOrFail(Campaign, req.params.id);
  await Donation.updateMany({ campaign_id: campaign._id }, { $set: { campaign_id: null } }); // nullOnDelete
  await campaign.deleteOne();
  res.json({ message: "Campaign deleted." });
});
