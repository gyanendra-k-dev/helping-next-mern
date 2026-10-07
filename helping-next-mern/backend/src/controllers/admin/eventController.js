const { Event, EventRegistration } = require("../../models");
const { validate } = require("../../utils/validator");
const { findOrFail, paginate, groupedCount } = require("../../utils/db");
const { makeSlug } = require("../../utils/slug");
const asyncHandler = require("../../utils/asyncHandler");

async function decorate(docs) {
  const counts = await groupedCount(EventRegistration, "event_id", docs.map((d) => d._id));
  return docs.map((d) => ({ ...d.toJSON(), registrations_count: counts.get(String(d._id)) || 0 }));
}

exports.index = asyncHandler(async (req, res) => res.json(await paginate(req, Event, { perPage: 20, decorate })));

exports.store = asyncHandler(async (req, res) => {
  const data = await validate(req.body, {
    title: ["required", "string", "max:255"],
    description: ["nullable", "string"],
    location: ["nullable", "string", "max:255"],
    starts_at: ["nullable", "date"],
    ends_at: ["nullable", "date", "after_or_equal:starts_at"],
    capacity: ["nullable", "integer", "min:1"],
    status: ["required", "in:upcoming,ongoing,completed,cancelled"],
  });
  const event = await Event.create({ ...data, slug: makeSlug(data.title) });
  res.status(201).json((await decorate([event]))[0]);
});

exports.show = asyncHandler(async (req, res) => {
  const event = await findOrFail(Event, req.params.id, { path: "registrations", populate: { path: "user" } });
  res.json(event);
});

exports.update = asyncHandler(async (req, res) => {
  const event = await findOrFail(Event, req.params.id);
  const data = await validate(req.body, {
    title: ["sometimes", "string", "max:255"],
    description: ["nullable", "string"],
    location: ["nullable", "string", "max:255"],
    starts_at: ["nullable", "date"],
    ends_at: ["nullable", "date"],
    capacity: ["nullable", "integer", "min:1"],
    status: ["sometimes", "in:upcoming,ongoing,completed,cancelled"],
  });
  event.set(data);
  await event.save();
  res.json((await decorate([event]))[0]);
});

exports.destroy = asyncHandler(async (req, res) => {
  const event = await findOrFail(Event, req.params.id);
  await EventRegistration.deleteMany({ event_id: event._id }); // cascadeOnDelete
  await event.deleteOne();
  res.json({ message: "Event deleted." });
});
