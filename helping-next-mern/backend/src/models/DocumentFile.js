const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

// Maps to the "documents" collection (class name kept from the Laravel code).
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: null },
    file_path: { type: String, required: true },
    year: { type: Number, default: null },
    is_public: { type: Boolean, default: false },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "documents" }
);
schema.virtual("uploader", { ref: "User", localField: "uploaded_by", foreignField: "_id", justOne: true });
schema.plugin(logsActivity, { subject: "DocumentFile" });
module.exports = mongoose.model("DocumentFile", schema);
