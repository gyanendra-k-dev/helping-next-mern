const { VolunteerApplication } = require("../models");
const { validate } = require("../utils/validator");
const asyncHandler = require("../utils/asyncHandler");

const rules = {
  name: ["sometimes", "string", "max:255"],
  phone: ["sometimes", "nullable", "string", "max:20"],
};

// Shared by the donor and volunteer profile endpoints (identical update logic in the Laravel code).
exports.update = asyncHandler(async (req, res) => {
  const data = await validate(req.body, rules);
  req.user.set(data);
  await req.user.save();
  res.json(req.user);
});

exports.showDonor = (req, res) => res.json(req.user);

exports.showVolunteer = asyncHandler(async (req, res) => {
  const applications = await VolunteerApplication.find({ user_id: req.user._id }).sort({ created_at: -1, _id: -1 });
  res.json({ ...req.user.toJSON(), volunteer_applications: applications.map((a) => a.toJSON()) });
});
