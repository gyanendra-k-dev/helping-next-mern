const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const { validate } = require("../utils/validator");
const { HttpError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../middleware/auth");
const { sendMail } = require("../services/mailer");

const hash = (pw) => bcrypt.hash(pw, Number(process.env.BCRYPT_ROUNDS || 12));
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const lower = (b) => ({ ...b, email: typeof b?.email === "string" ? b.email.toLowerCase() : b?.email });

const RESET_EXPIRES_MIN = 60;
const RESET_THROTTLE_SEC = 60;

// Public self-registration: donor or volunteer only (admins are seeded).
exports.register = asyncHandler(async (req, res) => {
  const data = await validate(
    lower(req.body),
    {
      name: ["required", "string", "max:255"],
      email: ["required", "email", "max:255", "unique:User,email"],
      phone: ["required", "string", "max:20"],
      password: ["required", "string", "min:8"],
      role: ["required", "in:donor,volunteer"],
    },
    { message: "Validation failed" }
  );

  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    password: await hash(data.password),
  });
  res.status(201).json({ user, token: signToken(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const data = await validate(lower(req.body), { email: ["required", "email"], password: ["required", "string"] }, { message: "Validation failed" });

  const user = await User.findOne({ email: data.email });
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new HttpError(401, "Invalid email or password.");
  }
  if (!user.is_active) {
    throw new HttpError(403, "Your account has been blocked. Contact the NGO admin for help.");
  }
  res.json({ user, token: signToken(user) });
});

// Tokens are stateless JWTs, so logging out = the client discarding its token.
exports.logout = (req, res) => res.json({ message: "Logged out." });

exports.me = (req, res) => res.json({ user: req.user });

// Always answers identically so the endpoint can't be used to discover which emails have accounts.
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = await validate(lower(req.body), { email: ["required", "email"] });

  const user = await User.findOne({ email });
  if (user) {
    const existing = await PasswordResetToken.findOne({ email });
    const throttled = existing && Date.now() - existing.created_at.getTime() < RESET_THROTTLE_SEC * 1000;
    if (!throttled) {
      const token = crypto.randomBytes(32).toString("hex");
      await PasswordResetToken.findOneAndUpdate({ email }, { token: sha256(token), created_at: new Date() }, { upsert: true });

      const frontend = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
      const link = `${frontend}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      try {
        await sendMail({
          to: email,
          subject: "Reset your Helping Next password",
          text: `Hello ${user.name},\n\nWe received a request to reset your password. Open the link below (valid for ${RESET_EXPIRES_MIN} minutes):\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
        });
      } catch (e) {
        console.error("Password reset mail failed:", e.message);
      }
    }
  }
  res.json({ message: "If that email has an account, a reset link has been sent." });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const data = await validate(lower(req.body), {
    token: ["required", "string"],
    email: ["required", "email"],
    password: ["required", "string", "min:8", "confirmed"],
  });

  const invalid = () => new HttpError(422, "This reset link is invalid or has expired.");

  const record = await PasswordResetToken.findOne({ email: data.email });
  if (!record) throw invalid();
  if (Date.now() - record.created_at.getTime() > RESET_EXPIRES_MIN * 60 * 1000) throw invalid();

  const a = Buffer.from(record.token);
  const b = Buffer.from(sha256(data.token));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw invalid();

  const user = await User.findOne({ email: data.email });
  if (!user) throw invalid();

  user.password = await hash(data.password);
  user.token_version = (user.token_version || 0) + 1; // sign out everywhere
  await user.save();
  await PasswordResetToken.deleteOne({ email: data.email });

  res.json({ message: "Password has been reset. You can log in now." });
});
