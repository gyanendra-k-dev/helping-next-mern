const { VolunteerApplication } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await paginate(req, VolunteerApplication, { filter, populate: "user", perPage: 20 }));
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(VolunteerApplication, req.params.id, "user")));

exports.update = asyncHandler(async (req, res) => {
  const app = await findOrFail(VolunteerApplication, req.params.id);
  app.set(
    await validate(req.body, {
      status: ["sometimes", "in:pending,approved,rejected"],
      hours_logged: ["sometimes", "integer", "min:0"],
    })
  );
  await app.save();
  res.json(await app.populate("user"));
});
