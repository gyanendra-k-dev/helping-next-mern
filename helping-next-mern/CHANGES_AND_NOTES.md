# Conversion notes

## Intentional differences from the Laravel version
1. **JWT instead of Sanctum tokens.** Tokens expire after `JWT_EXPIRES_IN` (default 30 days). Logout is client-side
   (the app discards the token). Resetting a password signs the user out everywhere, as before.
2. **Ids are 24-character strings** (Mongo ObjectIds) instead of integers. Receipt / reference numbers in the donor
   dashboard now show the last 8 characters (e.g. `HN-3F9A1C2B`) instead of the whole id.
3. **Money fields are JSON numbers** (`1000`) rather than strings (`"1000.00"`); the UI already wraps them in `Number()`.
4. **Update responses now include related records** (donor/campaign on donations, user on volunteers, project on
   beneficiaries, author on blog posts, counts on events/users). Previously a table row lost them after an edit.
5. **Payment verify is stricter:** the signed Razorpay order must belong to the donation being confirmed, so a valid
   payment for one order can't confirm a different donation. The status change + campaign total update is atomic, so
   verify + webhook arriving together can't double-count.
6. Unknown URLs answer 404 even without a token; emails are stored lower-case.

## Kept identical (even where odd)
- Donor "donate" requires a campaign; the public `/donate` form allows none.
- Registering for an event ignores `capacity`.
- Public `/campaigns/:id` does not check status.

## Not migrated
Rows in the old SQLite database are not copied (the project only had seeded demo users). For real data, export to
JSON/CSV and use `mongoimport`, or ask for a one-off migration script.
