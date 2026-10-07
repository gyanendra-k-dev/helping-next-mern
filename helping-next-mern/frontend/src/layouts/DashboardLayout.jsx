import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import "../styles/dashboard.css";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

// Generic shell for Donor / Volunteer / Admin areas. Each area passes
// its own nav items and role label; the logged-in user comes from
// AuthContext (see src/context/AuthContext.jsx).
function DashboardLayout({ navItems, roleLabel, brandLabel = "Helping Next" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/logout");
    } catch {
      // Token may already be invalid/expired — proceed to clear local state anyway.
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const userName = user?.name || "Guest User";
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activePage = navItems.find((item) => item.to === location.pathname);

  return (
    <div className="dash-shell">
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/" className="dash-sidebar-brand">
          <span className="icon">♥</span>
          {brandLabel}
        </Link>
        <div className="dash-sidebar-role">{roleLabel} Panel</div>

        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <button type="button" className="dash-logout" onClick={handleLogout} disabled={loggingOut}>
            ⏻ {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      <div
        className={`dash-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              className="dash-menu-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <span className="dash-topbar-title">{activePage ? activePage.label : roleLabel}</span>
          </div>

          <div className="dash-topbar-right">
            <div className="dash-bell">
              🔔<span className="dot"></span>
            </div>
            <div className="dash-user">
              <div className="dash-user-avatar">{initials}</div>
              <div className="dash-user-info">
                <strong>{userName}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="dash-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
