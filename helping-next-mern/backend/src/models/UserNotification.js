const mongoose = require("../config/mongoose");

const schema = new mongoose.Schema(
  {
    batch_id: { type: String, required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, default: "all" },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
module.exports = mongoose.model("UserNotification", schema);
