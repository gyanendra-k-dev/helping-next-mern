const { Donation, Campaign } = require("../models");
const { validate } = require("../utils/validator");
const { HttpError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");
const razorpay = require("../services/razorpay");

// Atomically flips a pending donation to success and bumps the campaign total exactly once,
// even if /payment/verify and the webhook arrive at the same moment.
async function markSuccess(filter, fields) {
  const donation = await Donation.findOneAndUpdate({ ...filter, status: { $ne: "success" } }, { $set: { status: "success", ...fields } }, { new: true });
  if (donation && donation.campaign_id) {
    await Campaign.updateOne({ _id: donation.campaign_id }, { $inc: { raised_amount: donation.amount } });
  }
  return donation;
}

// Called by the frontend after Razorpay Checkout succeeds. The signature is verified
// server-side (never trust the browser alone) before the donation is marked paid.
exports.verify = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    donation_id: ["required", "exists:Donation"],
    razorpay_order_id: ["required", "string"],
    razorpay_payment_id: ["required", "string"],
    razorpay_signature: ["required", "string"],
  });

  if (!razorpay.verifySignature(data)) {
    throw new HttpError(422, "Payment verification failed. Please contact support.");
  }

  const existing = await Donation.findById(data.donation_id);
  if (existing.status !== "success") {
    // The signed order must be the order created for THIS donation.
    if (existing.transaction_ref !== data.razorpay_order_id) {
      throw new HttpError(422, "Payment verification failed. Please contact support.");
    }
    await markSuccess({ _id: existing._id }, { transaction_ref: data.razorpay_payment_id });
  }

  res.json({ message: "Payment verified.", donation: await Donation.findById(data.donation_id) });
});

// Razorpay webhook (events: payment.captured, order.paid) - safety net for donors who pay
// but close the browser before verify() runs. Needs the RAW body for the HMAC check.
exports.webhook = asyncHandler(async (req, res) => {
  if (!razorpay.verifyWebhook(req.rawBody, req.get("X-Razorpay-Signature"))) {
    return res.status(400).json({ message: "Invalid signature." });
  }

  const { event, payload } = req.body || {};
  if (["payment.captured", "order.paid"].includes(event)) {
    const payment = payload?.payment?.entity;
    const orderId = payment?.order_id;
    if (orderId) {
      await markSuccess(
        { transaction_ref: orderId, status: "pending" },
        { transaction_ref: payment.id || orderId, payment_method: payment.method || null }
      );
    }
  }
  res.json({ status: "ok" });
});
