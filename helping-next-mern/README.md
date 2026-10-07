# Helping Next — MERN Stack

| Layer    | Technology                                    | Folder      |
|----------|-----------------------------------------------|-------------|
| Frontend | React 19 + Vite, React Router, Axios          | `frontend/` |
| Backend  | Node.js + Express REST API (JWT auth)         | `backend/`  |
| Database | MongoDB via Mongoose                          | —           |
| Payments | Razorpay (server-side signature verification) | —           |

The former React + Laravel + SQLite project, converted to MERN. The **API contract is unchanged**
(same URLs, request bodies, validation messages, response shapes), so every React page works as before.

## Quick start
Requirements: Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
cp .env.example .env     # edit: MONGODB_URI, JWT_SECRET, Razorpay keys
npm install
npm run seed             # creates the 3 demo accounts
npm run dev              # http://localhost:5000/api

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Demo logins (after `npm run seed`):
`admin@helpingnext.org / admin123` · `donor@helpingnext.org / donor123` · `volunteer@helpingnext.org / volunteer123`
(change before going live).

If you change the API port, update `frontend/.env` (`VITE_API_BASE_URL`) and `FRONTEND_URL` in `backend/.env`
(used for CORS and password-reset links).

## Backend structure
```
backend/
  server.js                 entry point
  src/
    app.js                  express app: helmet, cors, json, static /storage, routes, errors
    routes/api.js           every endpoint (public / admin / donor / volunteer)
    controllers/            business logic (admin/, donor/, volunteer/)
    models/                 17 Mongoose schemas + plugins/logsActivity.js (audit log)
    middleware/             JWT auth, role guard, sanitize, upload (multer), error handler
    services/               razorpay.js, mailer.js
    utils/                  Laravel-style validator, pagination, helpers
    seeds/seed.js           demo users
  tests/integration.test.js 291 end-to-end API checks
```

## Laravel → MERN mapping
| Laravel                          | Node / Express / Mongo                                          |
|----------------------------------|-----------------------------------------------------------------|
| Migrations / Eloquent models     | Mongoose schemas (`src/models`)                                 |
| `routes/api.php`                 | `src/routes/api.js`                                             |
| Sanctum tokens                   | JWT bearer tokens (`middleware/auth.js`)                        |
| `role:admin` middleware          | `role("admin")`                                                 |
| `$request->validate()`           | `validate()` — same rules, same 422 `{message, errors}` shape   |
| `paginate()`                     | `paginate()` — `{data, current_page, last_page, total, …}`      |
| `withCount` / `withSum`          | grouped aggregations (`registrations_count`, `total_given`, …)  |
| FK `cascadeOnDelete/nullOnDelete`| explicit cascades in delete controllers                         |
| `LogsActivity` trait             | Mongoose plugin + AsyncLocalStorage                             |
| `storage:link` uploads           | multer → `backend/uploads`, served at `/storage/uploads/<file>` |
| Password broker + mail           | hashed token in DB + nodemailer (prints link to console if no SMTP) |

## Razorpay
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (and `RAZORPAY_WEBHOOK_SECRET` for the webhook).
Webhook URL: `https://<your-api>/api/payment/webhook`, events `payment.captured` and `order.paid`.
A donation is only marked successful after the server verifies the signature.

## Deploying
`NODE_ENV=production`, strong `JWT_SECRET`, `MONGODB_URI` (Atlas), `APP_URL` (public API URL, used in upload links),
`FRONTEND_URL` (your site; comma-separate several). Build the frontend with `npm run build` (set `VITE_API_BASE_URL` first)
and host `frontend/dist` on any static host. Uploads live in `backend/uploads` — use a persistent disk or cloud storage.

## Tests
`cd backend && npm run test:api` runs the integration suite against the Mongo in `MONGODB_URI`
(throw-away database `helping_next_test`). Razorpay and mail are stubbed.

See `CHANGES_AND_NOTES.md` for the few intentional differences from the Laravel version.
