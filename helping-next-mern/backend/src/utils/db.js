const mongoose = require("../config/mongoose");
const { HttpError } = require("./errors");
const { isId } = require("./validator");

// Route-model-binding equivalent: load by id or answer 404.
async function findOrFail(Model, id, populate = []) {
  if (!isId(id)) throw new HttpError(404, "Not found.");
  let q = Model.findById(id);
  for (const p of [].concat(populate)) q = q.populate(p);
  const doc = await q;
  if (!doc) throw new HttpError(404, "Not found.");
  return doc;
}

// Laravel-style paginator ({ data, current_page, per_page, total, last_page, from, to }).
// `decorate(docs)` may add computed fields (counts, sums) and must return plain objects.
async function paginate(req, Model, { filter = {}, sort = { created_at: -1, _id: -1 }, populate = [], perPage = 20, decorate } = {}) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const total = await Model.countDocuments(filter);
  let q = Model.find(filter).sort(sort).skip((page - 1) * perPage).limit(perPage);
  for (const p of [].concat(populate)) q = q.populate(p);
  const docs = await q;
  const data = decorate ? await decorate(docs) : docs.map((d) => d.toJSON());
  return {
    current_page: page,
    data,
    from: total ? (page - 1) * perPage + 1 : null,
    to: total ? (page - 1) * perPage + data.length : null,
    last_page: Math.max(1, Math.ceil(total / perPage)),
    per_page: perPage,
    total,
  };
}

// withCount / withSum equivalents -> Map<idString, number>
async function groupedCount(Model, refField, ids, extra = {}) {
  if (!ids.length) return new Map();
  const rows = await Model.aggregate([
    { $match: { [refField]: { $in: ids }, ...extra } },
    { $group: { _id: `$${refField}`, n: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
}
async function groupedSum(Model, refField, sumField, ids, extra = {}) {
  if (!ids.length) return new Map();
  const rows = await Model.aggregate([
    { $match: { [refField]: { $in: ids }, ...extra } },
    { $group: { _id: `$${refField}`, total: { $sum: `$${sumField}` } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.total]));
}

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const truthy = (v) => ["1", "true", "on", "yes"].includes(String(v).toLowerCase());

module.exports = { findOrFail, paginate, groupedCount, groupedSum, escapeRegex, truthy, mongoose };
