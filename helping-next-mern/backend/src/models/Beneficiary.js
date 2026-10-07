const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, default: null },
    gender: { type: String, default: null },
    location: { type: String, default: null },
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    notes: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("project", { ref: "Project", localField: "project_id", foreignField: "_id", justOne: true });
schema.plugin(logsActivity, { subject: "Beneficiary" });
module.exports = mongoose.model("Beneficiary", schema);
