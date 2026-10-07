const { UserNotification } = require("../models");
const { findOrFail } = require("../utils/db");
const { HttpError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");

// The logged-in user's own notification inbox (any role).
exports.index = asyncHandler(async (req, res) => {
  res.json(await UserNotification.find({ user_id: req.user._id }).sort({ created_at: -1, _id: -1 }).limit(50));
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await findOrFail(UserNotification, req.params.id);
  if (String(n.user_id) !== String(req.user._id)) throw new HttpError(403, "Forbidden.");
  n.is_read = true;
  await n.save();
  res.json(n);
});
