const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cover_image: { type: String, default: null },
    excerpt: { type: String, default: null },
    body: { type: String, default: null },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    published_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.virtual("author", { ref: "User", localField: "author_id", foreignField: "_id", justOne: true });
schema.plugin(logsActivity, { subject: "BlogPost" });
module.exports = mongoose.model("BlogPost", schema);
