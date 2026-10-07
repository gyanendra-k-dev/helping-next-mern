// Laravel's TrimStrings + ConvertEmptyStringsToNull middleware. The React forms
// send "" for blank optional fields and rely on the API treating them as null.
const SKIP = new Set(["password", "current_password", "password_confirmation"]);

function clean(value, key) {
  if (typeof value === "string") {
    if (SKIP.has(key)) return value;
    const t = value.trim();
    return t === "" ? null : t;
  }
  if (Array.isArray(value)) return value.map((v) => clean(v));
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out = {};
    for (const k of Object.keys(value)) out[k] = clean(value[k], k);
    return out;
  }
  return value;
}

module.exports = (req, res, next) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) req.body = clean(req.body);
  next();
};
