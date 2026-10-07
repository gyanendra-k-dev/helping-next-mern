const { Testimonial } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

const rules = (create) => ({
  name: [create ? "required" : "sometimes", "string", "max:255"],
  role: ["nullable", "string", "max:255"],
  photo: ["nullable", "string"],
  quote: [create ? "required" : "sometimes", "string"],
  is_published: ["boolean"],
});

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, Testimonial, { perPage: 20 })));
exports.store = asyncHandler(async (req, res) => res.status(201).json(await Testimonial.create(await validate(req.body, rules(true)))));

exports.update = asyncHandler(async (req, res) => {
  const t = await findOrFail(Testimonial, req.params.id);
  t.set(await validate(req.body, rules(false)));
  await t.save();
  res.json(t);
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(Testimonial, req.params.id)).deleteOne();
  res.json({ message: "Testimonial deleted." });
});
