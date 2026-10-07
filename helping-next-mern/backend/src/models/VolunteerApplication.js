const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    area_of_interest: { type: String, default: null },
    availability: { type: String, default: null },
    message: { type: String, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    hours_logged: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("user", { ref: "User", localField: "user_id", foreignField: "_id", justOne: true });
schema.plugin(logsActivity, { subject: "VolunteerApplication" });
module.exports = mongoose.model("VolunteerApplication", schema);
