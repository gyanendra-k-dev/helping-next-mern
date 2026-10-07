const crypto = require("node:crypto");
const { User, UserNotification } = require("../../models");
const { validate } = require("../../utils/validator");
const asyncHandler = require("../../utils/asyncHandler");

// One row per broadcast (grouped by batch_id) with the recipient count.
exports.index = asyncHandler(async (req, res) => {
  // Every row of a broadcast is inserted with the same created_at, so it can be part of the group key.
  const rows = await UserNotification.aggregate([
    {
      $group: {
        _id: { batch_id: "$batch_id", title: "$title", message: "$message", audience: "$audience", created_at: "$created_at" },
        recipients: { $sum: 1 },
      },
    },
    { $sort: { "_id.created_at": -1 } },
    { $limit: 50 },
  ]);
  res.json(
    rows.map((r) => ({
      id: r._id.batch_id,
      title: r._id.title,
      message: r._id.message,
      audience: r._id.audience,
      created_at: r._id.created_at,
      recipients: r.recipients,
    }))
  );
});

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["required", "string", "max:255"],
    message: ["required", "string"],
    audience: ["required", "in:all,donor,volunteer"],
  });

  const filter = data.audience === "all" ? { role: { $ne: "admin" } } : { role: data.audience };
  const users = await User.find(filter, "_id");

  const batch = crypto.randomUUID();
  const now = new Date();
  const rows = users.map((u) => ({
    batch_id: batch,
    user_id: u._id,
    title: data.title,
    message: data.message,
    audience: data.audience,
    is_read: false,
    created_at: now,
    updated_at: now,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    await UserNotification.insertMany(rows.slice(i, i + 500), { timestamps: false });
  }

  res.status(201).json({ id: batch, title: data.title, message: data.message, audience: data.audience, created_at: now, recipients: rows.length });
});
