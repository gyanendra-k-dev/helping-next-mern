const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    location: { type: String, default: null },
    starts_at: { type: Date, default: null },
    ends_at: { type: Date, default: null },
    capacity: { type: Number, default: null },
    status: { type: String, enum: ["upcoming", "ongoing", "completed", "cancelled"], default: "upcoming" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("registrations", { ref: "EventRegistration", localField: "_id", foreignField: "event_id" });
schema.plugin(logsActivity, { subject: "Event" });
module.exports = mongoose.model("Event", schema);
