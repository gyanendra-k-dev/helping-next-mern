const { HttpError, ValidationError } = require("../utils/errors");

const notFound = (req, res) => res.status(404).json({ message: "Not found." });

// Single place that turns thrown errors into the JSON shapes the React app expects.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(422).json({ message: err.message, errors: err.extra.errors });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...err.extra });
  }
  if (err?.name === "MulterError") {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "The file field must not be greater than 5120 kilobytes." : "Upload failed.";
    return res.status(422).json({ message: msg, errors: { file: [msg] } });
  }
  if (err?.type === "entity.parse.failed") return res.status(400).json({ message: "Malformed JSON body." });
  if (err?.name === "CastError") return res.status(404).json({ message: "Not found." });
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    const msg = `The ${field.replace(/_/g, " ")} has already been taken.`;
    return res.status(422).json({ message: msg, errors: { [field]: [msg] } });
  }

  console.error(err);
  const showDetail = process.env.NODE_ENV !== "production";
  res.status(500).json({ message: showDetail ? err.message || "Server Error" : "Server Error" });
};

module.exports = { notFound, errorHandler };
