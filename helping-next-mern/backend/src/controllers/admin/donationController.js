const { Donation, Campaign } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

const REL = ["donor", "campaign"];

exports.index = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await paginate(req, Donation, { filter, populate: REL, perPage: 20 }));
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(Donation, req.params.id, REL)));

exports.update = asyncHandler(async (req, res) => {
  const donation = await findOrFail(Donation, req.params.id);
  const data = await validate(req.body, { status: ["required", "in:pending,success,failed,refunded"] });

  const wasSuccess = donation.status === "success";
  donation.status = data.status;
  await donation.save();
  const nowSuccess = donation.status === "success";

  // Keep the campaign's raised_amount in sync when status flips to/from success.
  if (donation.campaign_id && wasSuccess !== nowSuccess) {
    await Campaign.updateOne({ _id: donation.campaign_id }, { $inc: { raised_amount: nowSuccess ? donation.amount : -donation.amount } });
  }
  res.json(await donation.populate(REL));
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(Donation, req.params.id)).deleteOne();
  res.json({ message: "Donation record deleted." });
});
