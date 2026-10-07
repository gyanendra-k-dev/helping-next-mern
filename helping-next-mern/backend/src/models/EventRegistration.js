const mongoose = require("../config/mongoose");

const schema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["registered", "attended", "cancelled"], default: "registered" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.index({ event_id: 1, user_id: 1 }, { unique: true });
schema.virtual("event", { ref: "Event", localField: "event_id", foreignField: "_id", justOne: true });
schema.virtual("user", { ref: "User", localField: "user_id", foreignField: "_id", justOne: true });
module.exports = mongoose.model("EventRegistration", schema);
