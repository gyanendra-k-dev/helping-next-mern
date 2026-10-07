const crypto = require("node:crypto");

const slugify = (s) =>
  String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const randomString = (n = 6) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (const b of crypto.randomBytes(n)) out += chars[b % chars.length];
  return out;
};

// Same pattern as the Laravel code: Str::slug(title).'-'.Str::random(6)
module.exports = { slugify, randomString, makeSlug: (title) => `${slugify(title)}-${randomString(6)}` };
