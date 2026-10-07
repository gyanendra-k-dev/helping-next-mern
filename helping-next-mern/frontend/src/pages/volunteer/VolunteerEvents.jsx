import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import useAdminResource from "../../hooks/useAdminResource";
import api from "../../services/api";

const STATUS_MAP = { registered: "badge-upcoming", attended: "badge-completed", cancelled: "badge-urgent" };

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function VolunteerEvents() {
  const { items: availableEvents, loading: loadingAvailable, error: availableError } = useAdminResource("/volunteer/events");
  const { items: myEvents, loading: loadingMine, error: mineError, refetch } = useAdminResource("/volunteer/my-events");
  const [registering, setRegistering] = useState(null);

  const registeredEventIds = new Set(myEvents.map((r) => r.event_id));

  const handleRegister = async (event) => {
    setRegistering(event.id);
    try {
      await api.post(`/volunteer/events/${event.id}/register`);
      await refetch();
    } finally {
      setRegistering(null);
    }
  };

  return (
    <>
      <PageHeader title="Events" subtitle="Browse upcoming events and manage your registrations." />

      <DataTable
        title="Available Events"
        searchPlaceholder="Search events…"
        loading={loadingAvailable}
        error={availableError}
        columns={[
          { key: "title", label: "Event", render: (r) => <span className="row-primary">{r.title}</span> },
          { key: "date", label: "Date", render: (r) => formatDate(r.starts_at) },
          { key: "location", label: "Venue", render: (r) => r.location || "—" },
          {
            key: "actions",
            label: "",
            render: (r) =>
              registeredEventIds.has(r.id) ? (
                <span className="badge badge-active">Registered</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={registering === r.id}
                  onClick={() => handleRegister(r)}
                >
                  {registering === r.id ? "Registering…" : "Register"}
                </button>
              ),
          },
        ]}
        rows={availableEvents}
      />

      <div style={{ marginTop: 28 }}>
        <DataTable
          title="My Registrations"
          searchPlaceholder="Search your registrations…"
          loading={loadingMine}
          error={mineError}
          columns={[
            { key: "event", label: "Event", render: (r) => <span className="row-primary">{r.event?.title || "—"}</span> },
            { key: "date", label: "Date", render: (r) => formatDate(r.event?.starts_at) },
            { key: "status", label: "Status", render: (r) => <span className={`badge ${STATUS_MAP[r.status]}`}>{r.status}</span> },
          ]}
          rows={myEvents}
        />
      </div>
    </>
  );
}

export default VolunteerEvents;
