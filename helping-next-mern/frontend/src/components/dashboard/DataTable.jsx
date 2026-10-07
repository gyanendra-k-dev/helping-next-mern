import { useMemo, useState } from "react";

// Generic admin/dashboard table: give it columns + rows and it handles
// the search box, loading/error/empty states and row count footer.
// `columns[].render(row)` can return custom JSX (badges, action buttons)
// for a cell. Pass `onAdd` to enable the "+ addLabel" button.
function DataTable({
  title,
  subtitle,
  addLabel,
  onAdd,
  searchPlaceholder = "Search…",
  columns,
  rows,
  loading = false,
  error = "",
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(q)
      )
    );
  }, [query, rows]);

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
        </div>
        <div className="dash-panel-tools">
          <div className="dash-search">
            🔍
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {addLabel && onAdd && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
              + {addLabel}
            </button>
          )}
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              !error &&
              filtered.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {loading && <div className="table-loading">Loading…</div>}
        {!loading && error && <div className="table-error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="table-empty">No matching records found.</div>
        )}
      </div>

      {!loading && !error && (
        <div className="table-footer">
          <span>Showing {filtered.length} of {rows.length} records</span>
        </div>
      )}
    </div>
  );
}

export default DataTable;
