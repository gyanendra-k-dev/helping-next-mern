const { Beneficiary } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

const rules = (create) => ({
  name: [create ? "required" : "sometimes", "string", "max:255"],
  age: ["nullable", "integer", "min:0", "max:120"],
  gender: ["nullable", "string", "max:50"],
  location: ["nullable", "string", "max:255"],
  project_id: ["nullable", "exists:Project"],
  notes: ["nullable", "string"],
});

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, Beneficiary, { populate: "project", perPage: 20 })));

exports.store = asyncHandler(async (req, res) => {
  const b = await Beneficiary.create(await validate(req.body, rules(true)));
  res.status(201).json(await b.populate("project"));
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(Beneficiary, req.params.id, "project")));

exports.update = asyncHandler(async (req, res) => {
  const b = await findOrFail(Beneficiary, req.params.id);
  b.set(await validate(req.body, rules(false)));
  await b.save();
  res.json(await b.populate("project"));
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(Beneficiary, req.params.id)).deleteOne();
  res.json({ message: "Beneficiary deleted." });
});
