const mongoose = require("../../config/mongoose");
const ctx = require("../../utils/context");

// Equivalent of Laravel's LogsActivity trait: records created/updated/deleted
// for the model, but only when the write came from an authenticated request.
module.exports = function logsActivity(schema, { subject }) {
  async function log(doc, action) {
    const userId = ctx.getUserId();
    if (!userId) return;
    try {
      const label = doc.title ?? doc.name ?? `#${doc._id}`;
      await mongoose.model("ActivityLog").create({
        user_id: userId,
        action,
        subject_type: subject,
        subject_id: doc._id,
        description: `${subject} "${label}" ${action}`,
      });
    } catch (e) {
      console.error("Activity log failed:", e.message);
    }
  }

  schema.pre("save", function () {
    this.$locals.wasNew = this.isNew;
    this.$locals.skipLog = !this.isNew && !this.isModified();
  });
  schema.post("save", async function (doc) {
    if (doc.$locals.skipLog) return;
    await log(doc, doc.$locals.wasNew ? "created" : "updated");
  });
  schema.post("deleteOne", { document: true, query: false }, async function (doc) {
    await log(doc, "deleted");
  });
};
