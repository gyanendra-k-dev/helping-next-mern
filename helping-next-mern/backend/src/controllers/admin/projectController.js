const { Project, Beneficiary } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const { makeSlug } = require("../../utils/slug");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, Project, { perPage: 20 })));

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["required", "string", "max:255"],
    cover_image: ["nullable", "string"],
    summary: ["nullable", "string"],
    description: ["nullable", "string"],
    location: ["nullable", "string", "max:255"],
    status: ["required", "in:ongoing,completed,upcoming"],
  });
  res.status(201).json(await Project.create({ ...data, slug: makeSlug(data.title) }));
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(Project, req.params.id, "beneficiaries")));

exports.update = asyncHandler(async (req, res) => {
  const project = await findOrFail(Project, req.params.id);
  const data = await validate(req.body, {
    title: ["sometimes", "string", "max:255"],
    cover_image: ["nullable", "string"],
    summary: ["nullable", "string"],
    description: ["nullable", "string"],
    location: ["nullable", "string", "max:255"],
    status: ["sometimes", "in:ongoing,completed,upcoming"],
  });
  project.set(data);
  await project.save();
  res.json(project);
});

exports.destroy = asyncHandler(async (req, res) => {
  const project = await findOrFail(Project, req.params.id);
  await Beneficiary.updateMany({ project_id: project._id }, { $set: { project_id: null } }); // nullOnDelete
  await project.deleteOne();
  res.json({ message: "Project deleted." });
});
