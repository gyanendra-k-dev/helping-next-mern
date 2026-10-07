const mongoose = require("../config/mongoose");

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
module.exports = mongoose.model("Setting", schema);
