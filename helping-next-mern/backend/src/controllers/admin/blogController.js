const { BlogPost } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate } = require("../../utils/db");
const { makeSlug } = require("../../utils/slug");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, BlogPost, { populate: "author", perPage: 20 })));

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["required", "string", "max:255"],
    cover_image: ["nullable", "string"],
    excerpt: ["nullable", "string"],
    body: ["nullable", "string"],
    status: ["required", "in:draft,published"],
  });
  const post = await BlogPost.create({
    ...data,
    slug: makeSlug(data.title),
    author_id: req.user._id,
    published_at: data.status === "published" ? new Date() : null,
  });
  res.status(201).json(await post.populate("author"));
});

exports.show = asyncHandler(async (req, res) => res.json(await findOrFail(BlogPost, req.params.id, "author")));

exports.update = asyncHandler(async (req, res) => {
  const post = await findOrFail(BlogPost, req.params.id);
  const data = await validate(req.body, {
    title: ["sometimes", "string", "max:255"],
    cover_image: ["nullable", "string"],
    excerpt: ["nullable", "string"],
    body: ["nullable", "string"],
    status: ["sometimes", "in:draft,published"],
  });
  if (data.status === "published" && !post.published_at) data.published_at = new Date();
  post.set(data);
  await post.save();
  res.json(await post.populate("author"));
});

exports.destroy = asyncHandler(async (req, res) => {
  await (await findOrFail(BlogPost, req.params.id)).deleteOne();
  res.json({ message: "Post deleted." });
});
