const mongoose = require("../config/mongoose");

const schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    subject_type: { type: String, required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("user", { ref: "User", localField: "user_id", foreignField: "_id", justOne: true });
module.exports = mongoose.model("ActivityLog", schema);
