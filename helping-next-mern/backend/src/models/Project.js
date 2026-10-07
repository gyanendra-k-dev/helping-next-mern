const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cover_image: { type: String, default: null },
    summary: { type: String, default: null },
    description: { type: String, default: null },
    location: { type: String, default: null },
    status: { type: String, enum: ["ongoing", "completed", "upcoming"], default: "upcoming" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("beneficiaries", { ref: "Beneficiary", localField: "_id", foreignField: "project_id" });
schema.plugin(logsActivity, { subject: "Project" });
module.exports = mongoose.model("Project", schema);
