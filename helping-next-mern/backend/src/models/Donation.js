const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    donor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
    donor_name: { type: String, default: null },
    donor_email: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    payment_method: { type: String, default: null },
    transaction_ref: { type: String, default: null },
    status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending" },
    is_anonymous: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.index({ transaction_ref: 1 });
schema.virtual("donor", { ref: "User", localField: "donor_id", foreignField: "_id", justOne: true });
schema.virtual("campaign", { ref: "Campaign", localField: "campaign_id", foreignField: "_id", justOne: true });
schema.plugin(logsActivity, { subject: "Donation" });
module.exports = mongoose.model("Donation", schema);
