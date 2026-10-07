/* End-to-end API test: boots the real Express app against the Mongo instance in
 * MONGODB_URI (uses a throw-away DB), stubs Razorpay + mail, and checks every
 * endpoint group plus the response shapes the React pages rely on.
 *
 *   npm run test:api
 */
require("dotenv").config({ path: require("node:path").join(__dirname, "..", ".env") });
const crypto = require("node:crypto");
const base = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/helping_next";
process.env.MONGODB_URI = base.replace(/\/[^/?]*(\?|$)/, "/helping_next_test$1");
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.BCRYPT_ROUNDS = "4";
process.env.RAZORPAY_KEY_SECRET = "dummysecret123";
process.env.RAZORPAY_WEBHOOK_SECRET = "whsecret456";
process.env.RAZORPAY_KEY_ID = "rzp_test_dummy";

// ---- stubs (must be installed BEFORE the app is required) ----
const mails = [];
require("../src/services/mailer").sendMail = async (m) => mails.push(m);
const razorpay = require("../src/services/razorpay");
let orderSeq = 0;
razorpay.createOrder = async (amount) => ({ id: `order_TEST${++orderSeq}`, amount: Math.round(amount * 100), currency: "INR" });

const mongoose = require("../src/config/mongoose");
const connectDB = require("../src/config/db");
const app = require("../src/app");
const models = require("../src/models");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, extra) {
  if (cond) pass++;
  else { fail++; failures.push(name + (extra !== undefined ? `  -> ${JSON.stringify(extra).slice(0, 300)}` : "")); }
}
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, { got: a, want: b });

let server, url;
async function call(method, path, { token, body, raw, headers = {}, form } = {}) {
  const h = { Accept: "application/json", ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (raw !== undefined) { payload = raw; h["Content-Type"] = "application/json"; }
  else if (body !== undefined) { payload = JSON.stringify(body); h["Content-Type"] = "application/json"; }
  const r = await fetch(url + path, { method, headers: h, body: payload });
  let data = null;
  try { data = await r.json(); } catch {}
  return { status: r.status, data };
}
const sign = (order, pay) => crypto.createHmac("sha256", "dummysecret123").update(`${order}|${pay}`).digest("hex");

(async () => {
  await connectDB();
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(models).map((m) => m.init()));
  server = app.listen(0);
  url = `http://127.0.0.1:${server.address().port}/api`;
  const bcrypt = require("bcryptjs");
  const pw = await bcrypt.hash("admin123", 4);
  await models.User.create({ name: "Admin User", email: "admin@helpingnext.org", phone: "1", role: "admin", password: pw });

  // ============ AUTH ============
  let r = await call("POST", "/login", { body: { email: "admin@helpingnext.org", password: "wrong" } });
  eq(r.status, 401, "login wrong password 401"); eq(r.data.message, "Invalid email or password.", "login wrong msg");
  r = await call("POST", "/login", { body: {} });
  eq(r.status, 422, "login validation 422"); eq(r.data.message, "Validation failed", "login validation msg"); ok(r.data.errors?.email, "login errors.email");
  r = await call("POST", "/login", { body: { email: "ADMIN@helpingnext.org", password: "admin123" } });
  eq(r.status, 200, "admin login (case-insensitive email)");
  const admin = r.data.token; const adminUser = r.data.user;
  ok(typeof adminUser.id === "string" && adminUser._id === undefined && adminUser.password === undefined, "user JSON: id string, no _id/password", adminUser);

  r = await call("POST", "/register", { body: { name: "Riya", email: "donor@x.org", phone: "999", password: "short", role: "donor" } });
  eq(r.status, 422, "register short pw 422"); ok(r.data.errors.password, "register errors.password");
  r = await call("POST", "/register", { body: { name: "Riya", email: "donor@x.org", phone: "999", password: "password1", role: "admin" } });
  eq(r.status, 422, "register role=admin rejected"); ok(r.data.errors.role, "register errors.role");
  r = await call("POST", "/register", { body: { name: "Riya", email: "donor@x.org", phone: "999", password: "password1", role: "donor" } });
  eq(r.status, 201, "register donor 201"); const donor = r.data.token; const donorUser = r.data.user;
  eq(donorUser.role, "donor", "registered role"); eq(donorUser.is_active, true, "registered is_active default");
  r = await call("POST", "/register", { body: { name: "Riya2", email: "DONOR@x.org", phone: "999", password: "password1", role: "donor" } });
  eq(r.status, 422, "duplicate email 422"); ok(r.data.errors.email, "duplicate email error");
  r = await call("POST", "/register", { body: { name: "Aman", email: "vol@x.org", phone: "888", password: "password1", role: "volunteer" } });
  eq(r.status, 201, "register volunteer"); const vol = r.data.token; const volUser = r.data.user;

  r = await call("GET", "/user", { token: donor });
  eq(r.status, 200, "GET /user"); eq(r.data.user.email, "donor@x.org", "GET /user body");
  eq((await call("GET", "/user")).status, 401, "no token 401");
  eq((await call("GET", "/user", { token: "garbage" })).status, 401, "bad token 401");

  // role guards
  r = await call("GET", "/admin/dashboard", { token: donor });
  eq(r.status, 403, "donor blocked from admin"); eq(r.data.message, "Forbidden. Insufficient role.", "403 message");
  eq((await call("GET", "/donor/profile", { token: vol })).status, 403, "volunteer blocked from donor area");
  eq((await call("GET", "/volunteer/profile", { token: donor })).status, 403, "donor blocked from volunteer area");
  eq((await call("GET", "/admin/dashboard")).status, 401, "admin no token 401");

  // ============ ADMIN: CAMPAIGNS (+ ""->null, string numbers, slug, activity) ============
  r = await call("POST", "/admin/campaigns", { token: admin, body: {} });
  eq(r.status, 422, "campaign validation 422"); eq(r.data.errors.title[0], "The title field is required.", "campaign title msg"); ok(r.data.errors.goal_amount && r.data.errors.status, "campaign all required errors");
  r = await call("POST", "/admin/campaigns", { token: admin, body: { title: "Clean Water", cover_image: "", summary: "S", goal_amount: "50000", start_date: "", end_date: "", status: "active" } });
  eq(r.status, 201, "campaign create"); const camp = r.data;
  ok(typeof camp.id === "string" && camp.id.length === 24, "campaign id string", camp.id);
  eq(camp.goal_amount, 50000, "goal_amount numeric"); eq(camp.raised_amount, 0, "raised default 0");
  eq(camp.start_date, null, '"" date -> null'); eq(camp.cover_image, null, '"" image -> null');
  ok(/^clean-water-[A-Za-z0-9]{6}$/.test(camp.slug), "slug pattern", camp.slug); eq(camp.created_by, adminUser.id, "created_by string id");
  r = await call("POST", "/admin/campaigns", { token: admin, body: { title: "Draft One", goal_amount: 100, status: "draft", start_date: "2026-10-10", end_date: "2026-10-01" } });
  eq(r.status, 422, "end_date before start_date rejected");
  r = await call("POST", "/admin/campaigns", { token: admin, body: { title: "Draft One", goal_amount: 100, status: "draft" } });
  const draft = r.data; eq(r.status, 201, "draft campaign");
  r = await call("POST", "/admin/campaigns", { token: admin, body: { title: "Bad", goal_amount: "abc", status: "nope" } });
  ok(r.data.errors.goal_amount && r.data.errors.status, "numeric/in validation");

  r = await call("GET", "/admin/campaigns", { token: admin });
  eq(r.status, 200, "admin campaigns list"); ok(Array.isArray(r.data.data) && r.data.total === 2 && r.data.current_page === 1, "paginate shape", r.data);
  r = await call("GET", "/campaigns");
  eq(r.data.data.length, 1, "public campaigns only active/completed"); eq(r.data.data[0].contributions_count, 0, "contributions_count 0");
  r = await call("GET", `/campaigns/${camp.id}`); eq(r.status, 200, "public campaign show"); eq(r.data.id, camp.id, "show id");
  eq((await call("GET", "/campaigns/123")).status, 404, "bad id 404"); eq((await call("GET", "/campaigns/ffffffffffffffffffffffff")).status, 404, "missing id 404");
  r = await call("PUT", `/admin/campaigns/${camp.id}`, { token: admin, body: { title: "Clean Water 2", goal_amount: 60000 } });
  eq(r.status, 200, "campaign update"); eq(r.data.title, "Clean Water 2", "update title"); eq(r.data.slug, camp.slug, "slug unchanged"); eq(r.data.status, "active", "status unchanged");
  r = await call("PATCH", `/admin/campaigns/${camp.id}`, { token: admin, body: { summary: "patched" } }); eq(r.data.summary, "patched", "PATCH works");

  // ============ PROJECTS / BENEFICIARIES ============
  r = await call("POST", "/admin/projects", { token: admin, body: { title: "School Build", status: "ongoing", location: "Dadri" } });
  eq(r.status, 201, "project create"); const proj = r.data;
  r = await call("POST", "/admin/beneficiaries", { token: admin, body: { name: "Ravi", age: "12", project_id: proj.id, gender: "", notes: "" } });
  eq(r.status, 201, "beneficiary create"); const ben = r.data; eq(ben.age, 12, "age cast int"); eq(ben.project?.title, "School Build", "beneficiary.project in create response"); eq(ben.project_id, proj.id, "project_id string");
  r = await call("POST", "/admin/beneficiaries", { token: admin, body: { name: "X", project_id: "ffffffffffffffffffffffff" } });
  eq(r.status, 422, "beneficiary bad project 422");
  r = await call("POST", "/admin/beneficiaries", { token: admin, body: { name: "X", age: 500 } }); ok(r.data.errors.age, "age max 120");
  r = await call("GET", "/admin/beneficiaries", { token: admin }); eq(r.data.data[0].project.title, "School Build", "beneficiary list has project");
  r = await call("PUT", `/admin/beneficiaries/${ben.id}`, { token: admin, body: { name: "Ravi K", project_id: "" } });
  eq(r.data.name, "Ravi K", "beneficiary update"); eq(r.data.project_id, null, "project_id cleared"); eq(r.data.project ?? null, null, "project null after clear");
  r = await call("GET", `/admin/projects/${proj.id}`, { token: admin }); ok(Array.isArray(r.data.beneficiaries), "project show has beneficiaries[]");
  r = await call("GET", `/projects/${proj.id}`); eq(r.status, 200, "public project show");
  eq((await call("GET", "/projects")).data.data.length, 1, "public projects list");

  // ============ EVENTS ============
  r = await call("POST", "/admin/events", { token: admin, body: { title: "Blood Camp", status: "upcoming", starts_at: "2026-11-01T10:00", ends_at: "", capacity: "50", location: "Hall" } });
  eq(r.status, 201, "event create"); const ev = r.data; eq(ev.capacity, 50, "capacity int"); eq(ev.registrations_count, 0, "event registrations_count in create");
  ok(!Number.isNaN(Date.parse(ev.starts_at)), "starts_at date");
  r = await call("POST", "/admin/events", { token: admin, body: { title: "Past", status: "completed" } }); const evPast = r.data;
  r = await call("POST", "/admin/events", { token: admin, body: { title: "Bad", status: "upcoming", capacity: 0 } }); ok(r.data.errors.capacity, "capacity min 1");

  // ============ BLOG ============
  r = await call("POST", "/admin/blog", { token: admin, body: { title: "Hello World", status: "published", body: "<p>x</p>", excerpt: "" } });
  eq(r.status, 201, "blog create"); const post = r.data; ok(post.published_at, "published_at set"); eq(post.author?.name, "Admin User", "blog author in response"); eq(post.author_id, adminUser.id, "author_id");
  r = await call("POST", "/admin/blog", { token: admin, body: { title: "Secret Draft", status: "draft" } }); const postDraft = r.data; eq(postDraft.published_at, null, "draft has no published_at");
  r = await call("GET", "/blog"); eq(r.data.data.length, 1, "public blog only published"); eq(r.data.data[0].author.name, "Admin User", "public blog author");
  eq((await call("GET", `/blog/${post.id}`)).status, 200, "public blog show"); eq((await call("GET", `/blog/${postDraft.id}`)).status, 404, "draft blog hidden");
  r = await call("PUT", `/admin/blog/${postDraft.id}`, { token: admin, body: { status: "published" } }); ok(r.data.published_at, "publishing sets published_at"); eq(r.data.author?.name, "Admin User", "blog update keeps author");
  eq((await call("GET", `/blog/${postDraft.id}`)).status, 200, "now visible");

  // ============ GALLERY / TESTIMONIALS / DOCUMENTS ============
  r = await call("POST", "/admin/gallery", { token: admin, body: { title: "Pic", image_path: "http://x/y.png", album: "" } }); eq(r.status, 201, "gallery create"); const gal = r.data;
  eq((await call("GET", "/gallery")).data.data.length, 1, "public gallery");
  eq((await call("DELETE", `/admin/gallery/${gal.id}`, { token: admin })).data.message, "Image removed.", "gallery delete msg");
  eq((await call("GET", `/admin/gallery/${gal.id}`, { token: admin })).status, 404, "gallery show route not exposed");
  r = await call("POST", "/admin/testimonials", { token: admin, body: { name: "T", quote: "Great", is_published: false } }); const tst = r.data;
  eq(r.status, 201, "testimonial create"); eq(tst.is_published, false, "is_published false kept");
  eq((await call("GET", "/testimonials")).data.length, 0, "unpublished hidden (plain array)");
  r = await call("PUT", `/admin/testimonials/${tst.id}`, { token: admin, body: { is_published: true } }); eq(r.data.is_published, true, "testimonial publish");
  eq((await call("GET", "/testimonials")).data.length, 1, "testimonial visible");
  r = await call("POST", "/admin/documents", { token: admin, body: { title: "Annual 2025", category: "Annual Report", file_path: "http://x/a.pdf", year: "2025", is_public: false } });
  eq(r.status, 201, "document create"); const doc = r.data; eq(doc.year, 2025, "doc year"); eq(doc.uploaded_by, adminUser.id, "uploaded_by");
  eq((await call("GET", "/documents")).data.length, 0, "private doc hidden");
  r = await call("PUT", `/admin/documents/${doc.id}`, { token: admin, body: { is_public: true } }); eq(r.data.is_public, true, "doc toggle public");
  eq((await call("GET", "/documents")).data.length, 1, "public doc visible");
  ok((await call("POST", "/admin/documents", { token: admin, body: { title: "x", file_path: "p", year: 1999 } })).data.errors.year, "doc year min 2000");

  // ============ CONTACT / MESSAGES ============
  r = await call("POST", "/contact", { body: { name: "Visitor", email: "v@x.org", subject: "", message: "Hi there" } });
  eq(r.status, 201, "contact create"); eq(r.data.message, "Thank you — we'll get back to you soon.", "contact msg"); eq(r.data.data.is_read, false, "contact is_read false");
  eq((await call("POST", "/contact", { body: { name: "V", email: "bad", message: "" } })).status, 422, "contact validation");
  r = await call("GET", "/admin/messages?unread_only=1", { token: admin }); eq(r.data.data.length, 1, "unread_only list"); const msg = r.data.data[0];
  r = await call("GET", `/admin/messages/${msg.id}`, { token: admin }); eq(r.data.is_read, true, "show marks read");
  eq((await call("GET", "/admin/messages?unread_only=true", { token: admin })).data.data.length, 0, "no unread left");
  eq((await call("DELETE", `/admin/messages/${msg.id}`, { token: admin })).status, 200, "message delete");

  // ============ SETTINGS ============
  r = await call("GET", "/admin/settings", { token: admin }); eq(r.data.site_name, "", "settings default ''"); eq(Object.keys(r.data).length, 8, "8 settings keys");
  r = await call("PUT", "/admin/settings", { token: admin, body: { site_name: "Helping Next", tagline: "Hope", contact_email: "a@b.org", address: "" } });
  eq(r.data.site_name, "Helping Next", "settings update returns all"); eq(r.data.address, "", "null -> ''");
  eq((await call("PUT", "/admin/settings", { token: admin, body: { contact_email: "nope" } })).status, 422, "settings email validation");
  r = await call("GET", "/settings"); eq(r.data.site_name, "Helping Next", "public settings"); ok(!("facebook_url" in r.data), "public settings only stored keys");

  // ============ DONATIONS & PAYMENTS ============
  eq((await call("POST", "/donate", { body: { donor_name: "G", donor_email: "g@x.org", amount: 0 } })).status, 422, "donate amount min 1");
  eq((await call("POST", "/donate", { body: { donor_name: "G", donor_email: "g@x.org", amount: 10, campaign_id: "ffffffffffffffffffffffff" } })).status, 422, "donate unknown campaign");
  r = await call("POST", "/donate", { body: { campaign_id: camp.id, donor_name: "Guest", donor_email: "g@x.org", amount: 1000 } });
  eq(r.status, 201, "guest donate"); const gd = r.data; eq(gd.donation.status, "pending", "donation pending"); eq(gd.donation.transaction_ref, gd.razorpay.order_id, "ref = order id");
  eq(gd.razorpay.amount, 100000, "amount in paise"); eq(gd.razorpay.key, "rzp_test_dummy", "razorpay key returned"); eq(gd.razorpay.currency, "INR", "currency");
  r = await call("POST", "/donate", { body: { campaign_id: null, donor_name: "Guest2", donor_email: "g2@x.org", amount: "250" } });
  eq(r.status, 201, "guest donate without campaign (null)"); const gd2 = r.data;

  r = await call("POST", "/payment/verify", { body: { donation_id: gd.donation.id, razorpay_order_id: gd.razorpay.order_id, razorpay_payment_id: "pay_1", razorpay_signature: "bad" } });
  eq(r.status, 422, "verify bad signature 422"); eq(r.data.message, "Payment verification failed. Please contact support.", "verify bad msg");
  eq((await call("POST", "/payment/verify", { body: {} })).status, 422, "verify validation");
  eq((await call("POST", "/payment/verify", { body: { donation_id: "ffffffffffffffffffffffff", razorpay_order_id: "o", razorpay_payment_id: "p", razorpay_signature: "s" } })).status, 422, "verify unknown donation");
  // signature valid for ANOTHER order must not confirm this donation (security hardening)
  r = await call("POST", "/payment/verify", { body: { donation_id: gd.donation.id, razorpay_order_id: gd2.razorpay.order_id, razorpay_payment_id: "pay_x", razorpay_signature: sign(gd2.razorpay.order_id, "pay_x") } });
  eq(r.status, 422, "verify rejects signature of a different order");
  r = await call("POST", "/payment/verify", { body: { donation_id: gd.donation.id, razorpay_order_id: gd.razorpay.order_id, razorpay_payment_id: "pay_1", razorpay_signature: sign(gd.razorpay.order_id, "pay_1") } });
  eq(r.status, 200, "verify ok"); eq(r.data.donation.status, "success", "donation success"); eq(r.data.donation.transaction_ref, "pay_1", "ref -> payment id");
  r = await call("POST", "/payment/verify", { body: { donation_id: gd.donation.id, razorpay_order_id: gd.razorpay.order_id, razorpay_payment_id: "pay_1", razorpay_signature: sign(gd.razorpay.order_id, "pay_1") } });
  eq(r.status, 200, "verify idempotent");
  r = await call("GET", `/campaigns/${camp.id}`); eq(r.data.raised_amount, 1000, "raised_amount incremented exactly once");
  eq((await call("GET", "/campaigns")).data.data[0].contributions_count, 1, "contributions_count 1");

  // webhook
  const hook = (event, payment) => {
    const raw = JSON.stringify({ event, payload: { payment: { entity: payment } } });
    return { raw, sig: crypto.createHmac("sha256", "whsecret456").update(raw).digest("hex") };
  };
  let h = hook("payment.captured", { id: "pay_2", order_id: gd2.razorpay.order_id, method: "upi" });
  eq((await call("POST", "/payment/webhook", { raw: h.raw, headers: { "X-Razorpay-Signature": "nope" } })).status, 400, "webhook bad sig 400");
  eq((await call("POST", "/payment/webhook", { raw: h.raw })).status, 400, "webhook missing sig 400");
  r = await call("POST", "/payment/webhook", { raw: h.raw, headers: { "X-Razorpay-Signature": h.sig } }); eq(r.data.status, "ok", "webhook ok");
  r = await call("GET", "/admin/donations?status=success", { token: admin }); eq(r.data.data.length, 2, "2 successful donations");
  const d2 = r.data.data.find((d) => d.id === gd2.donation.id); eq(d2.payment_method, "upi", "webhook payment_method"); eq(d2.transaction_ref, "pay_2", "webhook ref");
  // webhook for a campaign donation + replay must not double count
  r = await call("POST", "/donate", { body: { campaign_id: camp.id, donor_name: "G3", donor_email: "g3@x.org", amount: 500 } }); const gd3 = r.data;
  h = hook("order.paid", { id: "pay_3", order_id: gd3.razorpay.order_id, method: "card" });
  await call("POST", "/payment/webhook", { raw: h.raw, headers: { "X-Razorpay-Signature": h.sig } });
  await call("POST", "/payment/webhook", { raw: h.raw, headers: { "X-Razorpay-Signature": h.sig } });
  eq((await call("GET", `/campaigns/${camp.id}`)).data.raised_amount, 1500, "webhook replay not double-counted");

  // admin donation list/update/show
  r = await call("GET", "/admin/donations", { token: admin }); eq(r.data.total, 3, "admin donations total");
  const row = r.data.data.find((d) => d.id === gd.donation.id); eq(row.campaign.title, "Clean Water 2", "donation.campaign populated"); eq(row.campaign_id, camp.id, "campaign_id string === campaign.id");
  r = await call("PUT", `/admin/donations/${gd.donation.id}`, { token: admin, body: { status: "refunded" } });
  eq(r.data.status, "refunded", "donation -> refunded"); eq(r.data.campaign?.title, "Clean Water 2", "update response keeps campaign");
  eq((await call("GET", `/campaigns/${camp.id}`)).data.raised_amount, 500, "raised decremented on refund");
  await call("PUT", `/admin/donations/${gd.donation.id}`, { token: admin, body: { status: "success" } });
  eq((await call("GET", `/campaigns/${camp.id}`)).data.raised_amount, 1500, "raised restored on success");
  await call("PUT", `/admin/donations/${gd.donation.id}`, { token: admin, body: { status: "success" } });
  eq((await call("GET", `/campaigns/${camp.id}`)).data.raised_amount, 1500, "no change success->success");
  eq((await call("PUT", `/admin/donations/${gd.donation.id}`, { token: admin, body: { status: "bogus" } })).status, 422, "donation bad status");
  r = await call("GET", `/admin/donations/${gd.donation.id}`, { token: admin }); eq(r.status, 200, "donation show");

  // ============ DONOR AREA ============
  r = await call("GET", "/donor/profile", { token: donor }); eq(r.data.email, "donor@x.org", "donor profile");
  r = await call("PUT", "/donor/profile", { token: donor, body: { name: "Riya S", phone: "" } }); eq(r.data.name, "Riya S", "donor profile update"); eq(r.data.phone, null, "phone '' -> null");
  r = await call("GET", "/donor/campaigns", { token: donor }); eq(r.data.data.length, 1, "donor sees active campaigns only");
  eq((await call("POST", "/donor/donations", { token: donor, body: { amount: 100 } })).status, 422, "donor donation requires campaign (parity with Laravel)");
  r = await call("POST", "/donor/donations", { token: donor, body: { campaign_id: camp.id, amount: 750, is_anonymous: true } });
  eq(r.status, 201, "donor donation create"); const dd = r.data; eq(dd.donation.donor_id, donorUser.id, "donor_id"); eq(dd.donation.donor_name, "Riya S", "donor name from profile"); eq(dd.donation.is_anonymous, true, "anonymous flag");
  eq((await call("GET", "/donor/campaigns/supported", { token: donor })).data.length, 0, "supported empty before success");
  await call("POST", "/payment/verify", { body: { donation_id: dd.donation.id, razorpay_order_id: dd.razorpay.order_id, razorpay_payment_id: "pay_d", razorpay_signature: sign(dd.razorpay.order_id, "pay_d") } });
  r = await call("GET", "/donor/campaigns/supported", { token: donor }); eq(r.data.length, 1, "supported after success"); eq(r.data[0].id, camp.id, "supported campaign id");
  r = await call("GET", "/donor/donations", { token: donor });
  eq(r.data.data.length, 1, "donor donation history"); eq(r.data.data[0].campaign.title, "Clean Water 2", "history has campaign"); ok(r.data.data[0].campaign_id === r.data.data[0].campaign.id, "campaign_id === campaign.id (strict, used by DonorCampaigns)");
  eq(r.data.data[0].status, "success", "history status");

  // ============ VOLUNTEER AREA ============
  r = await call("GET", "/volunteer/profile", { token: vol }); ok(Array.isArray(r.data.volunteer_applications), "volunteer profile has volunteer_applications[]");
  r = await call("POST", "/volunteer/applications", { token: vol, body: { area_of_interest: "Teaching", availability: "Weekends", message: "" } });
  eq(r.status, 201, "application create"); const app1 = r.data; eq(app1.status, "pending", "application pending"); eq(app1.hours_logged, 0, "hours 0"); eq(app1.user_id, volUser.id, "user_id");
  r = await call("GET", "/volunteer/applications", { token: vol }); eq(r.data.data.length, 1, "my applications");
  r = await call("GET", "/volunteer/events", { token: vol }); eq(r.data.data.length, 1, "volunteer sees upcoming/ongoing only"); eq(r.data.data[0].id, ev.id, "event id");
  r = await call("POST", `/volunteer/events/${ev.id}/register`, { token: vol }); eq(r.status, 201, "event register"); const reg = r.data; eq(reg.status, "registered", "registration status"); eq(reg.event_id, ev.id, "event_id string equals event.id");
  r = await call("POST", `/volunteer/events/${ev.id}/register`, { token: vol }); eq(r.data.id, reg.id, "register twice -> same row");
  eq((await call("POST", "/volunteer/events/ffffffffffffffffffffffff/register", { token: vol })).status, 404, "register unknown event 404");
  r = await call("GET", "/volunteer/my-events", { token: vol }); eq(r.data.data.length, 1, "my-events"); eq(r.data.data[0].event.title, "Blood Camp", "my-events has event"); ok(r.data.data[0].event_id === ev.id, "event_id === event.id (VolunteerEvents Set check)");
  r = await call("GET", "/events"); eq(r.data.data.find((e) => e.id === ev.id).registrations_count, 1, "public events registrations_count");
  r = await call("GET", "/admin/events", { token: admin }); eq(r.data.data.find((e) => e.id === ev.id).registrations_count, 1, "admin events registrations_count");
  r = await call("GET", `/admin/events/${ev.id}`, { token: admin }); eq(r.data.registrations[0].user.email, "vol@x.org", "event show registrations.user");
  // admin volunteer mgmt
  r = await call("GET", "/admin/volunteers?status=pending", { token: admin }); eq(r.data.data[0].user.email, "vol@x.org", "admin volunteers has user");
  r = await call("PUT", `/admin/volunteers/${app1.id}`, { token: admin, body: { status: "approved", hours_logged: 12 } });
  eq(r.data.status, "approved", "approve"); eq(r.data.user?.name, "Aman", "update response keeps user"); eq(r.data.hours_logged, 12, "hours");
  eq((await call("PUT", `/admin/volunteers/${app1.id}`, { token: admin, body: { hours_logged: -1 } })).status, 422, "hours min 0");
  eq((await call("GET", "/admin/volunteers?status=rejected", { token: admin })).data.data.length, 0, "status filter");
  eq((await call("GET", `/admin/volunteers/${app1.id}`, { token: admin })).status, 200, "volunteer show");

  // ============ NOTIFICATIONS ============
  r = await call("POST", "/admin/notifications", { token: admin, body: { title: "Hello donors", message: "Thanks!", audience: "donor" } });
  eq(r.status, 201, "notification broadcast"); eq(r.data.recipients, 1, "1 donor recipient"); const batch = r.data.id; ok(/^[0-9a-f-]{36}$/.test(batch), "batch uuid");
  r = await call("POST", "/admin/notifications", { token: admin, body: { title: "All", message: "Everyone", audience: "all" } }); eq(r.data.recipients, 2, "all = donors+volunteers (no admins)");
  eq((await call("POST", "/admin/notifications", { token: admin, body: { title: "x", message: "y", audience: "admin" } })).status, 422, "audience validation");
  r = await call("GET", "/admin/notifications", { token: admin }); eq(r.data.length, 2, "grouped by batch"); ok(r.data.every((n) => n.id && n.recipients >= 1 && n.created_at && n.audience), "notification row shape", r.data[0]);
  eq(r.data.find((n) => n.id === batch).recipients, 1, "recipients count");
  r = await call("GET", "/notifications", { token: donor }); eq(r.data.length, 2, "donor inbox"); ok(Array.isArray(r.data) && r.data[0].is_read === false, "inbox plain array, unread");
  const n1 = r.data[0];
  r = await call("POST", `/notifications/${n1.id}/read`, { token: donor }); eq(r.data.is_read, true, "mark read"); eq(r.data.id, n1.id, "mark read returns same id");
  eq((await call("POST", `/notifications/${n1.id}/read`, { token: vol })).status, 403, "cannot read others' notification");
  eq((await call("GET", "/notifications", { token: vol })).data.length, 1, "volunteer inbox (only 'all')");
  eq((await call("GET", "/notifications", { token: admin })).data.length, 0, "admin gets none");

  // ============ DASHBOARD / REPORTS / LOGS ============
  r = await call("GET", "/admin/dashboard", { token: admin });
  eq(r.data.total_raised, 2500, "dashboard total_raised"); eq(r.data.active_campaigns, 1, "active campaigns"); eq(r.data.registered_donors, 1, "donors"); eq(r.data.active_volunteers, 1, "volunteers");
  eq(r.data.ongoing_projects, 1, "ongoing projects"); eq(r.data.upcoming_events, 1, "upcoming events"); ok(r.data.recent_donations.length === 4 && r.data.recent_donations[0].campaign !== undefined, "recent donations w/ relations");
  r = await call("GET", "/admin/reports", { token: admin });
  eq(r.data.monthly_donations.length, 6, "6 months"); ok(/^[A-Z][a-z]{2} \d{4}$/.test(r.data.monthly_donations[5].month), "month label", r.data.monthly_donations[5]);
  eq(r.data.monthly_donations[5].total, 2500, "this month total"); eq(r.data.monthly_donations[0].total, 0, "zero-filled");
  const ss = r.data.donations_by_status.find((s) => s.status === "success"); eq(ss, { status: "success", count: 4, total: 2500 }, "donations_by_status");
  eq(r.data.top_campaigns[0].id, camp.id, "top campaign"); ok(!("description" in r.data.top_campaigns[0]), "top_campaigns limited fields");
  eq(r.data.total_volunteer_hours, 12, "volunteer hours"); eq(r.data.average_donation, 625, "average donation");
  r = await call("GET", "/admin/activity-logs", { token: admin });
  ok(r.data.data.length > 5, "activity logs recorded", r.data.total); const log = r.data.data.find((l) => l.subject_type === "Campaign" && l.action === "created" && l.description.includes("Clean Water"));
  ok(log && log.user.name === "Admin User" && log.description === 'Campaign "Clean Water" created', "log content/user", log);
  ok(r.data.data.some((l) => l.subject_type === "Donation" && l.action === "updated"), "donation update logged");
  ok(!r.data.data.some((l) => l.subject_type === "Donation" && l.action === "created" && !l.user), "guest donations not logged");
  ok(r.data.data.some((l) => l.subject_type === "BlogPost"), "blog logged (class name parity)");

  // ============ USERS ============
  r = await call("GET", "/admin/users?role=donor", { token: admin }); eq(r.data.data.length, 1, "role filter"); eq(r.data.data[0].donations_count, 1, "users donations_count"); eq(r.data.data[0].total_given, 750, "users total_given");
  r = await call("GET", "/admin/users?search=ARIYA", { token: admin }); eq(r.data.data.length, 0, "search no match (name is 'Riya S' -> 'ARIYA' no)");
  r = await call("GET", "/admin/users?search=riya", { token: admin }); eq(r.data.data.length, 1, "search case-insensitive");
  r = await call("GET", "/admin/users?search=.*", { token: admin }); eq(r.data.data.length, 0, "search escapes regex");
  r = await call("GET", "/admin/users", { token: admin }); eq(r.data.total, 3, "all users"); eq(r.data.data.find((u) => u.role === "volunteer").total_given, null, "no donations -> total_given null");
  r = await call("PUT", `/admin/users/${donorUser.id}`, { token: admin, body: { is_active: false } }); eq(r.data.is_active, false, "block user"); eq(r.data.donations_count, 1, "update response keeps counts");
  r = await call("POST", "/login", { body: { email: "donor@x.org", password: "password1" } }); eq(r.status, 403, "blocked login 403"); eq(r.data.message, "Your account has been blocked. Contact the NGO admin for help.", "blocked msg");
  await call("PUT", `/admin/users/${donorUser.id}`, { token: admin, body: { is_active: true } });
  eq((await call("POST", "/admin/users", { token: admin, body: {} })).status, 404, "no POST /admin/users (Laravel except store)");
  eq((await call("PUT", `/admin/users/${donorUser.id}`, { token: admin, body: { role: "boss" } })).status, 422, "role validation");

  // ============ PASSWORD RESET ============
  eq((await call("POST", "/forgot-password", { body: { email: "nobody@x.org" } })).data.message, "If that email has an account, a reset link has been sent.", "forgot: unknown email same msg");
  eq(mails.length, 0, "no mail for unknown email");
  r = await call("POST", "/forgot-password", { body: { email: "donor@x.org" } }); eq(r.status, 200, "forgot ok"); eq(mails.length, 1, "reset mail sent");
  const link = mails[0].text.match(/https?:\/\/\S+/)[0]; const u = new URL(link);
  eq(u.origin + u.pathname, "http://localhost:5173/reset-password", "reset link points to React app"); eq(u.searchParams.get("email"), "donor@x.org", "link email");
  const tok = u.searchParams.get("token");
  await call("POST", "/forgot-password", { body: { email: "donor@x.org" } }); eq(mails.length, 1, "throttled within 60s");
  r = await call("POST", "/reset-password", { body: { token: "wrong", email: "donor@x.org", password: "newpassword1", password_confirmation: "newpassword1" } }); eq(r.status, 422, "bad token"); eq(r.data.message, "This reset link is invalid or has expired.", "bad token msg");
  r = await call("POST", "/reset-password", { body: { token: tok, email: "donor@x.org", password: "newpassword1", password_confirmation: "different" } }); eq(r.status, 422, "confirmation mismatch"); ok(r.data.errors.password, "confirmed error");
  r = await call("POST", "/reset-password", { body: { token: tok, email: "donor@x.org", password: "newpassword1", password_confirmation: "newpassword1" } }); eq(r.status, 200, "reset ok"); eq(r.data.message, "Password has been reset. You can log in now.", "reset msg");
  eq((await call("GET", "/user", { token: donor })).status, 401, "old token revoked after reset (sign out everywhere)");
  eq((await call("POST", "/login", { body: { email: "donor@x.org", password: "password1" } })).status, 401, "old password rejected");
  r = await call("POST", "/login", { body: { email: "donor@x.org", password: "newpassword1" } }); eq(r.status, 200, "new password works");
  eq((await call("POST", "/reset-password", { body: { token: tok, email: "donor@x.org", password: "another123", password_confirmation: "another123" } })).status, 422, "token single-use");
  eq((await call("POST", "/logout", { token: r.data.token })).data.message, "Logged out.", "logout msg");

  // ============ UPLOADS ============
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  let form = new FormData(); form.append("file", new Blob([png], { type: "image/png" }), "pic.png");
  r = await call("POST", "/admin/upload", { token: admin, form }); eq(r.status, 201, "upload png 201");
  ok(/^uploads\/[0-9a-f-]{36}\.png$/.test(r.data.path), "upload path", r.data); ok(r.data.url.endsWith(`/storage/${r.data.path}`) && r.data.url.startsWith("http"), "upload url", r.data);
  const served = await fetch(r.data.url.replace("localhost:5000", `127.0.0.1:${server.address().port}`)); eq(served.status, 200, "uploaded file is served"); eq(served.headers.get("cross-origin-resource-policy"), "cross-origin", "CORP header allows React origin");
  form = new FormData(); form.append("file", new Blob(["hello"], { type: "text/plain" }), "x.txt");
  r = await call("POST", "/admin/upload", { token: admin, form }); eq(r.status, 422, "upload txt rejected"); ok(r.data.errors?.file, "upload error shape");
  form = new FormData(); form.append("file", new Blob([Buffer.alloc(5 * 1024 * 1024 + 10)], { type: "application/pdf" }), "big.pdf");
  r = await call("POST", "/admin/upload", { token: admin, form }); eq(r.status, 422, "upload >5MB rejected");
  r = await call("POST", "/admin/upload", { token: admin, form: new FormData() }); eq(r.status, 422, "upload missing file");
  form = new FormData(); form.append("file", new Blob([png], { type: "image/png" }), "pic.png");
  eq((await call("POST", "/admin/upload", { token: donor, form })).status, 401 /* donor token was revoked */, "upload requires auth");

  // ============ CASCADES ============
  const volLogin = (await call("POST", "/login", { body: { email: "vol@x.org", password: "password1" } })).data.token;
  r = await call("DELETE", `/admin/users/${volUser.id}`, { token: admin }); eq(r.data.message, "User deleted.", "user delete");
  eq(await models.VolunteerApplication.countDocuments({ user_id: volUser.id }), 0, "cascade: applications removed");
  eq(await models.EventRegistration.countDocuments({ user_id: volUser.id }), 0, "cascade: registrations removed");
  eq(await models.UserNotification.countDocuments({ user_id: volUser.id }), 0, "cascade: notifications removed");
  eq((await call("GET", "/user", { token: volLogin })).status, 401, "deleted user's token invalid");
  r = await call("DELETE", `/admin/campaigns/${camp.id}`, { token: admin }); eq(r.data.message, "Campaign deleted.", "campaign delete");
  eq(await models.Donation.countDocuments({ campaign_id: camp.id }), 0, "nullOnDelete: donations detached");
  eq(await models.Donation.countDocuments({}), 4, "donations kept");
  r = await call("DELETE", `/admin/projects/${proj.id}`, { token: admin }); eq(r.status, 200, "project delete"); eq(await models.Beneficiary.countDocuments({ project_id: proj.id }), 0, "beneficiary detached");
  r = await call("DELETE", `/admin/events/${ev.id}`, { token: admin }); eq(r.status, 200, "event delete"); eq(await models.EventRegistration.countDocuments({}), 0, "cascade: event registrations");
  eq((await call("DELETE", `/admin/donations/${gd.donation.id}`, { token: admin })).data.message, "Donation record deleted.", "donation delete msg");
  eq((await call("DELETE", `/admin/blog/${post.id}`, { token: admin })).data.message, "Post deleted.", "blog delete msg");
  eq((await call("DELETE", `/admin/testimonials/${tst.id}`, { token: admin })).data.message, "Testimonial deleted.", "testimonial delete msg");
  eq((await call("DELETE", `/admin/documents/${doc.id}`, { token: admin })).data.message, "Document deleted.", "document delete msg");
  eq((await call("DELETE", `/admin/beneficiaries/${ben.id}`, { token: admin })).data.message, "Beneficiary deleted.", "beneficiary delete msg");
  eq((await call("GET", "/nope")).status, 404, "unknown route 404 JSON");
  eq((await call("POST", "/login", { raw: "{bad json" })).status, 400, "malformed JSON 400");

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log("\nFAILURES:"); failures.forEach((f) => console.log(" ✗ " + f)); }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("TEST CRASH:", e); process.exit(2); });
