const mongoose = require("mongoose");

// Makes every document serialise exactly like the old Laravel/Eloquent JSON the
// React app already understands:
//   * `_id`  -> `id` (string)           * ObjectId refs -> strings
//   * `__v`, password, token_version are never exposed
//   * populated relations appear under their relation name (donor, campaign, ...)
function normalize(v) {
  if (v instanceof mongoose.Types.ObjectId) return v.toString();
  if (v instanceof Date || Buffer.isBuffer(v)) return v;
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === "object" && v.constructor === Object) {
    const out = {};
    for (const k of Object.keys(v)) out[k] = normalize(v[k]);
    return out;
  }
  return v;
}

mongoose.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    if (ret._id !== undefined) ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.token_version;
    for (const k of Object.keys(ret)) ret[k] = normalize(ret[k]);
    return ret;
  },
});
mongoose.set("strictQuery", true);

module.exports = mongoose;
