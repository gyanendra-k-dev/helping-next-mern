import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/our-work", label: "Our Work" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/projects", label: "Projects" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  // Shrink / shadow the bar after a small scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer on every route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Lock page scrolling while the mobile drawer is open.
  // Also prevent the off-canvas drawer from creating horizontal page scroll.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (menuOpen) {
      html.style.overflowX = "hidden";
      body.style.overflow = "hidden";
      body.style.overflowX = "hidden";
    } else {
      html.style.overflowX = "";
      body.style.overflow = "";
      body.style.overflowX = "";
    }

    return () => {
      html.style.overflowX = "";
      body.style.overflow = "";
      body.style.overflowX = "";
    };
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-container">

        <NavLink to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">♥</span>
          <span>
            Helping <strong>Next</strong>
          </span>
        </NavLink>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}

          <NavLink to="/login" className="nav-link" onClick={closeMenu}>
            Login
          </NavLink>

          <NavLink to="/volunteer" className="nav-volunteer" onClick={closeMenu}>
            Volunteer
          </NavLink>

          <NavLink to="/donate" className="nav-donate" onClick={closeMenu}>
            Donate Now
          </NavLink>
        </nav>

        <button
          className={`menu-btn ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

      <div
        className={`nav-overlay ${menuOpen ? "active" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>
    </header>
  );
}

export default Navbar;
