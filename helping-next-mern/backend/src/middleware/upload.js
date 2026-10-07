const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const multer = require("multer");
const { ValidationError } = require("../utils/errors");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB, same as Laravel's max:5120
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED[ext] || !ALLOWED[ext].includes(file.mimetype)) {
      return cb(new ValidationError({ file: ["The file field must be a file of type: jpg, jpeg, png, webp, gif, pdf."] }));
    }
    cb(null, true);
  },
});

module.exports = { UPLOAD_DIR, single: uploader.single("file") };
