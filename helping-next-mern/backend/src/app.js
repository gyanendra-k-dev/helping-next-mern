const path = require("node:path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("./models"); // register all models
const ctx = require("./utils/context");
const sanitize = require("./middleware/sanitize");
const { notFound, errorHandler } = require("./middleware/errors");
const routes = require("./routes/api");

const app = express();

const allowed = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);
// localhost and 127.0.0.1 are different origins to the browser - allow both during development.
const origins = new Set(allowed.flatMap((o) => [o, o.replace("localhost", "127.0.0.1")]));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // uploaded images are loaded by the React origin
app.use(cors({ origin: (o, cb) => cb(null, !o || origins.has(o)), methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));

// Keep the raw body: Razorpay's webhook signature is computed over the exact bytes.
app.use(express.json({ limit: "2mb", verify: (req, res, buf) => (req.rawBody = buf) }));
app.use(sanitize);
app.use((req, res, next) => ctx.run(next)); // per-request context for the activity log

// Uploaded files (same URL shape as Laravel's storage link: /storage/uploads/<file>)
app.use("/storage", express.static(path.join(__dirname, "..", "uploads"), { fallthrough: true, maxAge: "7d" }));

app.get("/", (req, res) => res.json({ name: "Helping Next API", status: "ok" }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
