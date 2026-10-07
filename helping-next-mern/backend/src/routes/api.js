const express = require("express");
const { authenticate, role } = require("../middleware/auth");

const auth = require("../controllers/authController");
const pub = require("../controllers/publicController");
const payment = require("../controllers/paymentController");
const userNotif = require("../controllers/userNotificationController");
const profile = require("../controllers/profileController");

const admin = {
  dashboard: require("../controllers/admin/dashboardController"),
  upload: require("../controllers/admin/uploadController"),
  reports: require("../controllers/admin/reportController"),
  logs: require("../controllers/admin/activityLogController"),
  settings: require("../controllers/admin/settingController"),
  notifications: require("../controllers/admin/notificationController"),
  users: require("../controllers/admin/userController"),
  campaigns: require("../controllers/admin/campaignController"),
  projects: require("../controllers/admin/projectController"),
  events: require("../controllers/admin/eventController"),
  beneficiaries: require("../controllers/admin/beneficiaryController"),
  gallery: require("../controllers/admin/galleryController"),
  blog: require("../controllers/admin/blogController"),
  testimonials: require("../controllers/admin/testimonialController"),
  documents: require("../controllers/admin/documentController"),
  messages: require("../controllers/admin/messageController"),
  donations: require("../controllers/admin/donationController"),
  volunteers: require("../controllers/admin/volunteerController"),
};
const donor = {
  campaigns: require("../controllers/donor/campaignController"),
  donations: require("../controllers/donor/donationController"),
};
const volunteer = {
  applications: require("../controllers/volunteer/applicationController"),
  events: require("../controllers/volunteer/eventController"),
};

const router = express.Router();

// Registers Laravel-apiResource-style routes: GET /, POST /, GET /:id, PUT|PATCH /:id, DELETE /:id
function resource(r, path, c, only) {
  const on = (name) => !only || only.includes(name);
  if (on("index")) r.get(path, c.index);
  if (on("store")) r.post(path, c.store);
  if (on("show")) r.get(`${path}/:id`, c.show);
  if (on("update")) r.route(`${path}/:id`).put(c.update).patch(c.update);
  if (on("destroy")) r.delete(`${path}/:id`, c.destroy);
}

// ---- Public auth ----
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

// ---- Public read-only content (marketing site) ----
router.get("/campaigns", pub.campaigns);
router.get("/campaigns/:id", pub.campaignShow);
router.get("/projects", pub.projects);
router.get("/projects/:id", pub.projectShow);
router.get("/events", pub.events);
router.get("/blog", pub.blog);
router.get("/blog/:id", pub.blogShow);
router.get("/gallery", pub.gallery);
router.get("/testimonials", pub.testimonials);
router.get("/documents", pub.documents);
router.get("/settings", pub.settings);

// ---- Public write actions ----
router.post("/contact", pub.contactStore);
router.post("/donate", pub.donate);
router.post("/payment/verify", payment.verify);
router.post("/payment/webhook", payment.webhook);

// ---- Everything below needs a valid token ----
// (scoped to known prefixes so an unknown URL answers 404, not 401 - same as Laravel)
router.use(["/logout", "/user", "/notifications", "/admin", "/donor", "/volunteer"], authenticate);

router.post("/logout", auth.logout);
router.get("/user", auth.me);

// Own notification inbox (any role)
router.get("/notifications", userNotif.index);
router.post("/notifications/:id/read", userNotif.markRead);

// ================= ADMIN =================
const a = express.Router();
a.use(role("admin"));
a.get("/dashboard", admin.dashboard.index);
a.post("/upload", ...admin.upload.store);
a.get("/reports", admin.reports.index);
a.get("/activity-logs", admin.logs.index);
a.get("/settings", admin.settings.show);
a.put("/settings", admin.settings.update);
a.get("/notifications", admin.notifications.index);
a.post("/notifications", admin.notifications.store);

resource(a, "/users", admin.users, ["index", "show", "update", "destroy"]);
resource(a, "/campaigns", admin.campaigns);
resource(a, "/projects", admin.projects);
resource(a, "/events", admin.events);
resource(a, "/beneficiaries", admin.beneficiaries);
resource(a, "/gallery", admin.gallery, ["index", "store", "destroy"]);
resource(a, "/blog", admin.blog);
resource(a, "/testimonials", admin.testimonials, ["index", "store", "update", "destroy"]);
resource(a, "/documents", admin.documents, ["index", "store", "update", "destroy"]);
resource(a, "/messages", admin.messages, ["index", "show", "destroy"]);
resource(a, "/donations", admin.donations, ["index", "show", "update", "destroy"]);
resource(a, "/volunteers", admin.volunteers, ["index", "show", "update"]);
router.use("/admin", a);

// ================= DONOR =================
const d = express.Router();
d.use(role("donor"));
d.get("/profile", profile.showDonor);
d.put("/profile", profile.update);
d.get("/campaigns", donor.campaigns.index);
d.get("/campaigns/supported", donor.campaigns.supported);
d.get("/donations", donor.donations.index);
d.post("/donations", donor.donations.store);
router.use("/donor", d);

// ================= VOLUNTEER =================
const v = express.Router();
v.use(role("volunteer"));
v.get("/profile", profile.showVolunteer);
v.put("/profile", profile.update);
v.get("/applications", volunteer.applications.index);
v.post("/applications", volunteer.applications.store);
v.get("/events", volunteer.events.index);
v.post("/events/:id/register", volunteer.events.register);
v.get("/my-events", volunteer.events.myEvents);
router.use("/volunteer", v);

module.exports = router;
