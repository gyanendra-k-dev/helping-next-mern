import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-about">
          <div className="footer-logo">
            <span>♥</span>
            Helping <strong>Next</strong>
          </div>

          <p>
            Together we can create opportunities, support communities
            and build a better tomorrow.
          </p>

          <div className="social-links">
            <a href="#facebook">f</a>
            <a href="#instagram">◎</a>
            <a href="#youtube">▶</a>
            <a href="#linkedin">in</a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/about">About Us</Link>
          <Link to="/our-work">Our Work</Link>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/transparency">Transparency</Link>
        </div>

        <div className="footer-column">
          <h3>Get Involved</h3>
          <Link to="/donate">Donate</Link>
          <Link to="/volunteer">Volunteer</Link>
          <Link to="/events">Events</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <p>Email: info@helpingnext.org</p>
          <p>Phone: +91 XXXXX XXXXX</p>
          <p>India</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Helping Next. All rights reserved.</p>

        <div>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>

    </footer>
  );
}

export default Footer;