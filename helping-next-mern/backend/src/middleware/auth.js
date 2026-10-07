const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ctx = require("../utils/context");
const asyncHandler = require("../utils/asyncHandler");
const { HttpError } = require("../utils/errors");

const signToken = (user) =>
  jwt.sign({ sub: String(user._id), v: user.token_version || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

// Equivalent of Laravel's auth:sanctum — expects "Authorization: Bearer <token>".
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Unauthenticated.");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Unauthenticated.");
  }

  const user = await User.findById(payload.sub);
  if (!user || (user.token_version || 0) !== payload.v) throw new HttpError(401, "Unauthenticated.");

  req.user = user;
  ctx.setUser(user._id); // lets model hooks write the activity log
  next();
});

// Equivalent of Laravel's EnsureUserHasRole  ->  role("admin") / role("admin","volunteer")
const role = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden. Insufficient role." });
  }
  next();
};

module.exports = { authenticate, role, signToken };
