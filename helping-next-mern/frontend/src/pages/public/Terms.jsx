import { Link } from "react-router-dom";
import "./InnerPages.css";

function Terms() {
  return (
    <>
      <section className="page-hero">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Terms & Conditions</span>
          </div>
          <p className="page-hero-eyebrow">Legal</p>
          <h1>Terms & Conditions</h1>
          <p>The terms that apply when you use the Helping Next website.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="legal-body">
            <span className="legal-updated">Placeholder draft — replace with reviewed legal copy before launch</span>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By using this website, you agree to these terms. If you do
              not agree, please do not use our services.
            </p>

            <h2>2. Donations</h2>
            <p>
              Donations made through this website are voluntary and
              generally non-refundable, except where required by law or at
              our discretion in cases of error.
            </p>

            <h2>3. Volunteer Participation</h2>
            <p>
              Volunteering with Helping Next is subject to our internal
              volunteer guidelines, which will be shared during onboarding.
            </p>

            <h2>4. Use of Content</h2>
            <p>
              Content on this website — including text, images and logos —
              belongs to Helping Next and may not be reproduced without
              permission.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              Helping Next makes reasonable efforts to keep this website
              accurate and available, but does not guarantee uninterrupted
              or error-free service.
            </p>

            <h2>6. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of
              the website after changes means you accept the updated terms.
            </p>

            <h2>7. Contact</h2>
            <p>
              For questions about these terms, reach us via the{" "}
              <Link to="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Terms;
