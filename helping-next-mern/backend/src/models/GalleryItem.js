const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    image_path: { type: String, required: true },
    album: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.plugin(logsActivity, { subject: "GalleryItem" });
module.exports = mongoose.model("GalleryItem", schema);
