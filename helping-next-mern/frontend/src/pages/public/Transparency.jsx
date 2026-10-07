import { Link } from "react-router-dom";
import useAdminResource from "../../hooks/useAdminResource";
import "./InnerPages.css";

function Transparency() {
  const { items: documents, loading, error } = useAdminResource("/documents");

  return (
    <>
      <section className="page-hero">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Transparency</span>
          </div>
          <p className="page-hero-eyebrow">Transparency</p>
          <h1>Where the money goes, in writing</h1>
          <p>Annual reports, audited financials and impact summaries — the same documents we'd want to see before donating anywhere.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="stat-strip" style={{ marginBottom: 50 }}>
            <div className="stat">
              <h2>92%</h2>
              <p>Funds to Programmes</p>
            </div>
            <div className="stat">
              <h2>8%</h2>
              <p>Admin & Operations</p>
            </div>
            <div className="stat">
              <h2>4</h2>
              <p>Years of Reports</p>
            </div>
            <div className="stat">
              <h2>100%</h2>
              <p>Donations Receipted</p>
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h2>Public Documents</h2>
                <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
                  Registration certificates, financial statements and impact reports
                </p>
              </div>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Category</th>
                    <th>Year</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {!loading &&
                    !error &&
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td><span className="row-primary">{doc.title}</span></td>
                        <td>{doc.category || "—"}</td>
                        <td>{doc.year || "—"}</td>
                        <td>
                          <a href={doc.file_path} target="_blank" rel="noreferrer" className="icon-btn" title="Download">
                            ⬇
                          </a>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {loading && <div className="table-loading">Loading…</div>}
              {!loading && error && <div className="table-error">{error}</div>}
              {!loading && !error && documents.length === 0 && <div className="table-empty">No public documents uploaded yet.</div>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Transparency;
