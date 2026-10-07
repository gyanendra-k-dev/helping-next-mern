const { GalleryItem } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, GalleryItem, { perPage: 24 })));

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["nullable", "string", "max:255"],
    image_path: ["required", "string"],
    album: ["nullable", "string", "max:255"],
  });
  res.status(201).json(await GalleryItem.create(data));
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(GalleryItem, req.params.id)).deleteOne();
  res.json({ message: "Image removed." });
});
