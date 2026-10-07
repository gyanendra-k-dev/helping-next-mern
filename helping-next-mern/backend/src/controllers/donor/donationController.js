const { Donation } = require("../../models");
const { validate } = require("../../utils/validator");
const { paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");
const razorpay = require("../../services/razorpay");

exports.index = asyncHandler(async (req, res) => {
  res.json(await paginate(req, Donation, { filter: { donor_id: req.user._id }, populate: "campaign", perPage: 20 }));
});

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    campaign_id: ["required", "exists:Campaign"],
    amount: ["required", "numeric", "min:1"],
    is_anonymous: ["boolean"],
  });

  const user = req.user;
  const donation = await Donation.create({
    donor_id: user._id,
    campaign_id: data.campaign_id,
    donor_name: user.name,
    donor_email: user.email,
    amount: data.amount,
    is_anonymous: data.is_anonymous ?? false,
    status: "pending",
  });

  const order = await razorpay.createOrder(donation.amount, `donation_${donation._id}`);
  donation.transaction_ref = order.id;
  await donation.save();

  res.status(201).json({
    donation,
    razorpay: { key: razorpay.keyId(), order_id: order.id, amount: order.amount, currency: order.currency },
  });
});
