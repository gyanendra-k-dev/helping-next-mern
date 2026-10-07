const upload = require("../../middleware/upload");
const { ValidationError } = require("../../utils/errors");

// Accepts one file (field "file") and stores it in /uploads/uploads, served publicly at /storage/uploads/<name>
// (same URL shape the Laravel `storage:link` setup produced).
exports.store = [
  upload.single,
  (req, res) => {
    if (!req.file) throw new ValidationError({ file: ["The file field is required."] });
    const base = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
    const filePath = `uploads/${req.file.filename}`;
    res.status(201).json({ path: filePath, url: `${base}/storage/${filePath}` });
  },
];
