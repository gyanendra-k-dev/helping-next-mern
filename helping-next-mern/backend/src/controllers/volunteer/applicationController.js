const { VolunteerApplication } = require("../../models");
const { validate } = require("../../utils/validator");
const { paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  res.json(await paginate(req, VolunteerApplication, { filter: { user_id: req.user._id }, perPage: 20 }));
});

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    area_of_interest: ["nullable", "string", "max:255"],
    availability: ["nullable", "string"],
    message: ["nullable", "string"],
  });
  const application = await VolunteerApplication.create({ ...data, user_id: req.user._id, status: "pending" });
  res.status(201).json(application);
});
