const mongoose = require("../config/mongoose");

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true }, // sha256 hash of the emailed token
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
module.exports = mongoose.model("PasswordResetToken", schema);
