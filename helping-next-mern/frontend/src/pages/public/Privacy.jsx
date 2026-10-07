import { Link } from "react-router-dom";
import "./InnerPages.css";

function Privacy() {
  return (
    <>
      <section className="page-hero">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>
          <p className="page-hero-eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>How Helping Next collects, uses and protects your information.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="legal-body">
            <span className="legal-updated">Placeholder draft — replace with reviewed legal copy before launch</span>

            <h2>1. Information We Collect</h2>
            <p>
              We may collect personal details you provide directly, such as
              your name, email, phone number and payment details, when you
              donate, register as a volunteer, or contact us.
            </p>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To process donations and issue tax receipts.</li>
              <li>To manage volunteer applications and event registrations.</li>
              <li>To send updates about campaigns you've supported.</li>
              <li>To respond to enquiries submitted through our contact form.</li>
            </ul>

            <h2>3. Payment Information</h2>
            <p>
              Donations are processed through a secure, PCI-compliant
              payment gateway. Helping Next does not store your card or
              bank details on its own servers.
            </p>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell personal information. Data may be shared with
              trusted service providers (such as our payment gateway) only
              as needed to deliver our services.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You can request access to, correction of, or deletion of your
              personal data by contacting us at info@helpingnext.org.
            </p>

            <h2>6. Contact</h2>
            <p>
              Questions about this policy can be sent to our team via the{" "}
              <Link to="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Privacy;
