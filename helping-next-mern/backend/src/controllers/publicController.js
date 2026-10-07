const { Campaign, Project, Event, BlogPost, GalleryItem, Testimonial, Setting, DocumentFile, ContactMessage, Donation } = require("../models");
const { validate } = require("../utils/validator");
const { HttpError } = require("../utils/errors");
const { findOrFail, paginate, groupedCount } = require("../utils/db");
const asyncHandler = require("../utils/asyncHandler");
const razorpay = require("../services/razorpay");

// Read-only public endpoints for the marketing site + contact form + guest donations.

exports.campaigns = asyncHandler(async (req, res) => {
  res.json(
    await paginate(req, Campaign, {
      filter: { status: { $in: ["active", "completed"] } },
      perPage: 20,
      decorate: async (docs) => {
        const counts = await groupedCount(Donation, "campaign_id", docs.map((d) => d._id), { status: "success" });
        return docs.map((d) => ({ ...d.toJSON(), contributions_count: counts.get(String(d._id)) || 0 }));
      },
    })
  );
});

exports.campaignShow = asyncHandler(async (req, res) => res.json(await findOrFail(Campaign, req.params.id)));

exports.projects = asyncHandler(async (req, res) => res.json(await paginate(req, Project, { perPage: 20 })));
exports.projectShow = asyncHandler(async (req, res) => res.json(await findOrFail(Project, req.params.id)));

exports.events = asyncHandler(async (req, res) => {
  const { EventRegistration } = require("../models");
  res.json(
    await paginate(req, Event, {
      sort: { starts_at: -1, _id: -1 },
      perPage: 40,
      decorate: async (docs) => {
        const counts = await groupedCount(EventRegistration, "event_id", docs.map((d) => d._id));
        return docs.map((d) => ({ ...d.toJSON(), registrations_count: counts.get(String(d._id)) || 0 }));
      },
    })
  );
});

exports.blog = asyncHandler(async (req, res) => {
  res.json(
    await paginate(req, BlogPost, {
      filter: { status: "published" },
      sort: { published_at: -1, _id: -1 },
      populate: "author",
      perPage: 20,
    })
  );
});

exports.blogShow = asyncHandler(async (req, res) => {
  const post = await findOrFail(BlogPost, req.params.id, "author");
  if (post.status !== "published") throw new HttpError(404, "Not found.");
  res.json(post);
});

exports.gallery = asyncHandler(async (req, res) => res.json(await paginate(req, GalleryItem, { perPage: 24 })));

exports.testimonials = asyncHandler(async (req, res) => {
  res.json(await Testimonial.find({ is_published: true }).sort({ created_at: -1, _id: -1 }));
});

const PUBLIC_SETTING_KEYS = ["site_name", "tagline", "contact_email", "contact_phone", "address", "facebook_url", "instagram_url", "twitter_url"];
exports.settings = asyncHandler(async (req, res) => {
  const rows = await Setting.find({ key: { $in: PUBLIC_SETTING_KEYS } });
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

exports.documents = asyncHandler(async (req, res) => {
  res.json(await DocumentFile.find({ is_public: true }).sort({ created_at: -1, _id: -1 }));
});

exports.contactStore = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    name: ["required", "string", "max:255"],
    email: ["required", "email", "max:255"],
    subject: ["nullable", "string", "max:255"],
    message: ["required", "string"],
  });
  const message = await ContactMessage.create(data);
  res.status(201).json({ message: "Thank you — we'll get back to you soon.", data: message });
});

// Guest / logged-in donation: creates a pending Donation + a Razorpay Order. The frontend
// opens Razorpay Checkout, then calls POST /payment/verify once payment completes.
exports.donate = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    campaign_id: ["nullable", "exists:Campaign"],
    donor_name: ["required", "string", "max:255"],
    donor_email: ["required", "email", "max:255"],
    amount: ["required", "numeric", "min:1"],
    is_anonymous: ["boolean"],
  });

  const donation = await Donation.create({ ...data, status: "pending" });
  const order = await razorpay.createOrder(donation.amount, `donation_${donation._id}`);
  donation.transaction_ref = order.id;
  await donation.save();

  res.status(201).json({
    donation,
    razorpay: { key: razorpay.keyId(), order_id: order.id, amount: order.amount, currency: order.currency },
  });
});
