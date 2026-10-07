import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAdminResource from "../../hooks/useAdminResource";
import api from "../../services/api";
import "./InnerPages.css";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

function Donate() {
  const { user, isAuthenticated } = useAuth();
  const isDonor = isAuthenticated && user?.role === "donor";
  const { items: campaigns } = useAdminResource("/campaigns");
  const [searchParams] = useSearchParams();

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState(""); // "sending" | "sent" | ""
  const [error, setError] = useState("");

  useEffect(() => {
    const preselect = searchParams.get("campaign");
    if (preselect) setCampaignId(preselect);
  }, [searchParams]);

  const selectPreset = (value) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setAmount(null);
  };

  const finalAmount = amount || Number(customAmount) || 0;

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!finalAmount || finalAmount < 1) {
      setError("Please choose or enter a valid amount.");
      return;
    }
    setStatus("sending");
    try {
      const { data } = isDonor
        ? await api.post("/donor/donations", { campaign_id: campaignId || null, amount: finalAmount })
        : await api.post("/donate", {
            campaign_id: campaignId || null,
            donor_name: form.name,
            donor_email: form.email,
            amount: finalAmount,
          });

      openRazorpayCheckout(data);
    } catch (err) {
      setStatus("");
      setError(err?.response?.data?.message || "Could not start your donation. Please try again.");
    }
  };

  const openRazorpayCheckout = ({ donation, razorpay }) => {
    if (!window.Razorpay) {
      setStatus("");
      setError("Payment window could not load. Please check your connection and try again.");
      return;
    }

    const rzp = new window.Razorpay({
      key: razorpay.key,
      amount: razorpay.amount,
      currency: razorpay.currency,
      order_id: razorpay.order_id,
      name: "Helping Next",
      description: "Donation",
      prefill: isDonor ? { name: user.name, email: user.email } : { name: form.name, email: form.email },
      theme: { color: "#c0392b" },
      handler: async (response) => {
        try {
          await api.post("/payment/verify", {
            donation_id: donation.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setStatus("sent");
        } catch (err) {
          setStatus("");
          setError(
            `Payment succeeded but we couldn't confirm it automatically. Please contact us with payment ID: ${response.razorpay_payment_id}`
          );
        }
      },
      modal: {
        ondismiss: () => setStatus(""),
      },
    });

    rzp.on("payment.failed", () => {
      setStatus("");
      setError("Payment failed or was cancelled. Please try again.");
    });

    rzp.open();
  };

  if (status === "sent") {
    return (
      <section className="section">
        <div className="section-container">
          <div className="donate-card" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <h2>Thank you 🙏</h2>
            <p style={{ marginTop: 10 }}>
              Your donation of ₹{finalAmount.toLocaleString("en-IN")} has been received. A receipt has been recorded
              against your donation history.
            </p>
            <Link to="/campaigns" className="btn btn-primary" style={{ marginTop: 18 }}>
              Back to Campaigns
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Donate</span>
          </div>
          <p className="page-hero-eyebrow">Make A Donation</p>
          <h1>Your donation reaches real people, not overhead</h1>
          <p>Choose an amount, pick a cause if you like, and give securely. You'll get a receipt and an update on where it went.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="donate-layout">
            <form className="donate-card" onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Choose an amount (₹)</label>
              </div>
              <div className="amount-grid">
                {PRESET_AMOUNTS.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`amount-chip ${amount === value ? "active" : ""}`}
                    onClick={() => selectPreset(value)}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="form-field">
                <label>Or enter a custom amount</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="Enter amount in ₹"
                  value={customAmount}
                  onChange={handleCustomChange}
                />
              </div>

              <div className="form-field">
                <label>
                  Donate towards <span className="hint">(optional)</span>
                </label>
                <select className="form-control" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
                  <option value="">Where it's needed most</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {isDonor ? (
                <p style={{ fontSize: 13.5, color: "var(--color-text-muted)" }}>
                  Donating as <strong>{user.name}</strong> ({user.email})
                </p>
              ) : (
                <div className="form-grid">
                  <div className="form-field">
                    <label>Full name</label>
                    <input type="text" className="form-control" placeholder="Your name" value={form.name} onChange={handleChange("name")} required />
                  </div>
                  <div className="form-field">
                    <label>Phone number <span className="hint">(optional)</span></label>
                    <input type="tel" className="form-control" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange("phone")} />
                  </div>
                  <div className="form-field full">
                    <label>Email address</label>
                    <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange("email")} required />
                  </div>
                  <div className="form-field full" style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                    Already have a donor account? <Link to="/login">Log in</Link> to track this in your dashboard.
                  </div>
                </div>
              )}

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={status === "sending"}>
                {status === "sending"
                  ? "Opening secure payment…"
                  : `Proceed to pay ${finalAmount ? `₹${finalAmount.toLocaleString("en-IN")}` : ""}`}
              </button>

              <div className="trust-row">
                🔒 Payments are processed securely via Razorpay. Card details never touch our servers.
              </div>
            </form>

            <div>
              <div className="donate-side-card">
                <h4>Where your money goes</h4>
                <p>100% of individual donations go directly to active campaigns and projects. Admin costs are covered separately through grants and partnerships.</p>
              </div>
              <div className="donate-side-card">
                <h4>Tax benefits</h4>
                <p>Donations to Helping Next are eligible for tax exemption under Section 80G. You'll receive a receipt by email once payment is confirmed.</p>
              </div>
              <div className="donate-side-card">
                <h4>Need another way to give?</h4>
                <p>
                  For bank transfers, CSR partnerships or in-kind donations, reach out on our <Link to="/contact">contact page</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Donate;
