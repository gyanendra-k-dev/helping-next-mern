const crypto = require("node:crypto");
const Razorpay = require("razorpay");
const { HttpError } = require("../utils/errors");

let client = null;
function api() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new HttpError(500, "Razorpay keys are not configured on the server.");
  if (!client) client = new Razorpay({ key_id: key, key_secret: secret });
  return client;
}

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = {
  /** Creates a Razorpay Order for an amount in rupees; returns what Checkout needs. */
  async createOrder(amountRupees, receipt) {
    const order = await api().orders.create({
      receipt,
      amount: Math.round(amountRupees * 100), // paise
      currency: "INR",
      payment_capture: 1,
    });
    return { id: order.id, amount: order.amount, currency: order.currency };
  },

  /** Checkout signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
  verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    return safeEqual(expected, razorpay_signature);
  },

  /** Webhook signature = HMAC_SHA256(raw body, webhook_secret). */
  verifyWebhook(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !signature || !rawBody) return false;
    return safeEqual(crypto.createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
  },

  keyId: () => process.env.RAZORPAY_KEY_ID,
};
