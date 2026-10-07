const { ContactMessage } = require("../../models");
const { findOrFail, paginate, truthy } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  const filter = truthy(req.query.unread_only) ? { is_read: false } : {};
  res.json(await paginate(req, ContactMessage, { filter, perPage: 20 }));
});

// Opening a message marks it as read.
exports.show = asyncHandler(async (req, res) => {
  const m = await findOrFail(ContactMessage, req.params.id);
  m.is_read = true;
  await m.save();
  res.json(m);
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(ContactMessage, req.params.id)).deleteOne();
  res.json({ message: "Message deleted." });
});
