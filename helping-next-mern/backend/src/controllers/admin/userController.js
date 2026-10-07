const { User, Donation, VolunteerApplication, EventRegistration, UserNotification, Campaign, BlogPost, DocumentFile, ActivityLog } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate, groupedCount, groupedSum, escapeRegex } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

// Adds donations_count and total_given (successful donations) like Eloquent withCount/withSum.
async function decorate(docs) {
  const ids = docs.map((d) => d._id);
  const [counts, sums] = await Promise.all([
    groupedCount(Donation, "donor_id", ids),
    groupedSum(Donation, "donor_id", "amount", ids, { status: "success" }),
  ]);
  return docs.map((d) => ({
    ...d.toJSON(),
    donations_count: counts.get(String(d._id)) || 0,
    total_given: sums.has(String(d._id)) ? sums.get(String(d._id)) : null,
  }));
}

exports.index = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }
  res.json(await paginate(req, User, { filter, perPage: 20, decorate }));
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(User, req.params.id)));

exports.update = asyncHandler(async (req, res) => {
  const user = await findOrFail(User, req.params.id);
  const data = await validate(req.body, {
    name: ["sometimes", "string", "max:255"],
    phone: ["sometimes", "nullable", "string", "max:20"],
    role: ["sometimes", "in:admin,donor,volunteer"],
    is_active: ["sometimes", "boolean"],
  });
  user.set(data);
  await user.save();
  res.json((await decorate([user]))[0]);
});

exports.destroy = asyncHandler(async (req, res) => {
  const user = await findOrFail(User, req.params.id);
  const id = user._id;
  // Replaces the SQL foreign keys: cascadeOnDelete ...
  await Promise.all([
    VolunteerApplication.deleteMany({ user_id: id }),
    EventRegistration.deleteMany({ user_id: id }),
    UserNotification.deleteMany({ user_id: id }),
    // ... and nullOnDelete
    Donation.updateMany({ donor_id: id }, { $set: { donor_id: null } }),
    Campaign.updateMany({ created_by: id }, { $set: { created_by: null } }),
    BlogPost.updateMany({ author_id: id }, { $set: { author_id: null } }),
    DocumentFile.updateMany({ uploaded_by: id }, { $set: { uploaded_by: null } }),
    ActivityLog.updateMany({ user_id: id }, { $set: { user_id: null } }),
  ]);
  await user.deleteOne();
  res.json({ message: "User deleted." });
});
