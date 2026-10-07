const { Setting } = require("../../models");
const { validate } = require("../../utils/validator");
const asyncHandler = require("../../utils/asyncHandler");

// Keys the admin Settings page is allowed to manage.
const KEYS = ["site_name", "tagline", "contact_email", "contact_phone", "address", "facebook_url", "instagram_url", "twitter_url"];

async function current() {
  const rows = await Setting.find({ key: { $in: KEYS } });
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(KEYS.map((k) => [k, stored[k] ?? ""]));
}

exports.show = asyncHandler(async (req, res) => res.json(await current()));

exports.update = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    site_name: ["nullable", "string", "max:255"],
    tagline: ["nullable", "string", "max:255"],
    contact_email: ["nullable", "email", "max:255"],
    contact_phone: ["nullable", "string", "max:50"],
    address: ["nullable", "string", "max:500"],
    facebook_url: ["nullable", "string", "max:255"],
    instagram_url: ["nullable", "string", "max:255"],
    twitter_url: ["nullable", "string", "max:255"],
  });
  await Promise.all(Object.entries(data).map(([key, value]) => Setting.updateOne({ key }, { $set: { value } }, { upsert: true })));
  res.json(await current());
});
