const mongoose = require("../config/mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ["admin", "donor", "volunteer"], default: "donor" },
    is_active: { type: Boolean, default: true },
    password: { type: String, required: true },
    email_verified_at: { type: Date, default: null },
    // Bumped on password reset so every previously issued token stops working
    // (Laravel: $user->tokens()->delete()).
    token_version: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

schema.statics.ROLES = ["admin", "donor", "volunteer"];
module.exports = mongoose.model("User", schema);
