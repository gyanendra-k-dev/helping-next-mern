const { DocumentFile } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, DocumentFile, { perPage: 20 })));

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["required", "string", "max:255"],
    category: ["nullable", "string", "max:255"],
    file_path: ["required", "string"],
    year: ["nullable", "integer", "min:2000", "max:2100"],
    is_public: ["boolean"],
  });
  res.status(201).json(await DocumentFile.create({ ...data, uploaded_by: req.user._id }));
});

exports.update = asyncHandler(async (req, res) => {
  const doc = await findOrFail(DocumentFile, req.params.id);
  doc.set(
    await validate(req.body, {
      title: ["sometimes", "string", "max:255"],
      category: ["nullable", "string", "max:255"],
      year: ["nullable", "integer", "min:2000", "max:2100"],
      is_public: ["boolean"],
    })
  );
  await doc.save();
  res.json(doc);
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(DocumentFile, req.params.id)).deleteOne();
  res.json({ message: "Document deleted." });
});
