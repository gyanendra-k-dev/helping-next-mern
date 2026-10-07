const { Event, EventRegistration } = require("../../models");
const { findOrFail, paginate } = require("../../utils/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  res.json(await paginate(req, Event, { filter: { status: { $in: ["upcoming", "ongoing"] } }, perPage: 20 }));
});

// firstOrCreate: registering twice is harmless and returns the existing registration.
exports.register = asyncHandler(async (req, res) => {
  const event = await findOrFail(Event, req.params.id);
  const key = { event_id: event._id, user_id: req.user._id };
  let registration = await EventRegistration.findOne(key);
  if (!registration) {
    try {
      registration = await EventRegistration.create({ ...key, status: "registered" });
    } catch (e) {
      if (e.code !== 11000) throw e; // lost a race with a parallel request
      registration = await EventRegistration.findOne(key);
    }
  }
  res.status(201).json(registration);
});

exports.myEvents = asyncHandler(async (req, res) => {
  res.json(await paginate(req, EventRegistration, { filter: { user_id: req.user._id }, populate: "event", perPage: 20 }));
});
