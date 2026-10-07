import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import useAdminResource from "../../hooks/useAdminResource";
import "./InnerPages.css";

function formatDayMonth(dateStr) {
  if (!dateStr) return { day: "--", month: "" };
  const d = new Date(dateStr);
  return { day: d.getDate().toString().padStart(2, "0"), month: d.toLocaleString("en-IN", { month: "short" }).toUpperCase() };
}

function formatTimeRange(start, end) {
  const opts = { hour: "numeric", minute: "2-digit" };
  const s = start ? new Date(start).toLocaleTimeString("en-IN", opts) : null;
  const e = end ? new Date(end).toLocaleTimeString("en-IN", opts) : null;
  if (s && e) return `${s} – ${e}`;
  return s || "Time TBA";
}

function Events() {
  const { items: events, loading, error } = useAdminResource("/events");
  const [tab, setTab] = useState("upcoming");

  const list = useMemo(() => {
    if (tab === "upcoming") return events.filter((e) => ["upcoming", "ongoing"].includes(e.status));
    return events.filter((e) => ["completed", "cancelled"].includes(e.status));
  }, [tab, events]);

  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.events} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Events</span>
          </div>
          <p className="page-hero-eyebrow">Events & Drives</p>
          <h1>Show up, and bring a friend</h1>
          <p>Health camps, donation drives and community days — all the ways you can pitch in this month.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="filter-tabs">
            <button className={`filter-tab ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>
              Upcoming
            </button>
            <button className={`filter-tab ${tab === "past" ? "active" : ""}`} onClick={() => setTab("past")}>
              Past events
            </button>
          </div>

          {loading && <p className="inline-note">Loading events…</p>}
          {!loading && error && <p className="inline-note">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-2">
              {list.map((ev) => {
                const { day, month } = formatDayMonth(ev.starts_at);
                return (
                  <div className="card event-card" key={ev.id}>
                    <div className="event-date-badge">
                      <strong>{day}</strong>
                      <span>{month}</span>
                    </div>
                    <div className="event-info">
                      <span className={`badge ${tab === "upcoming" ? "badge-upcoming" : "badge-completed"}`}>
                        {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                      </span>
                      <h3 style={{ marginTop: 10 }}>{ev.title}</h3>
                      {ev.location && <p>📍 {ev.location}</p>}
                      <div className="event-meta">
                        <span>🕒 {formatTimeRange(ev.starts_at, ev.ends_at)}</span>
                        <span>👥 {ev.registrations_count ?? 0}{ev.capacity ? ` / ${ev.capacity}` : ""} registered</span>
                      </div>
                      {tab === "upcoming" ? (
                        <Link to="/login" className="btn btn-primary btn-sm">
                          Login as Volunteer to Register
                        </Link>
                      ) : (
                        <span className="hint">{ev.registrations_count ?? 0} people attended</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && list.length === 0 && <p className="inline-note">No {tab} events right now.</p>}
        </div>
      </section>
    </>
  );
}

export default Events;
