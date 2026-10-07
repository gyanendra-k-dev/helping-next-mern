const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cover_image: { type: String, default: null },
    summary: { type: String, default: null },
    description: { type: String, default: null },
    goal_amount: { type: Number, default: 0 },
    raised_amount: { type: Number, default: 0 },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    status: { type: String, enum: ["draft", "active", "completed", "archived"], default: "draft" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("donations", { ref: "Donation", localField: "_id", foreignField: "campaign_id" });
schema.virtual("creator", { ref: "User", localField: "created_by", foreignField: "_id", justOne: true });
schema.plugin(logsActivity, { subject: "Campaign" });
module.exports = mongoose.model("Campaign", schema);
