const mongoose = require("../config/mongoose");
const logsActivity = require("./plugins/logsActivity");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: null },
    photo: { type: String, default: null },
    quote: { type: String, required: true },
    is_published: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.plugin(logsActivity, { subject: "Testimonial" });
module.exports = mongoose.model("Testimonial", schema);
