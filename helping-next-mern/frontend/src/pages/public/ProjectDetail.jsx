import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import "./InnerPages.css";

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then(({ data }) => {
        if (active) setProject(data);
      })
      .catch(() => {
        if (active) setError("Project not found.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="section">
        <div className="section-container">
          <p className="inline-note">Loading project…</p>
        </div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="section">
        <div className="section-container">
          <p className="inline-note">{error || "Project not found."}</p>
          <Link to="/projects" className="btn btn-outline-dark btn-sm" style={{ marginTop: 12 }}>
            ← Back to Projects
          </Link>
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
            <Link to="/projects">Projects</Link>
            <span>/</span>
            <span>#{id}</span>
          </div>
          <h1>{project.title}</h1>
          {project.location && <p>📍 {project.location}</p>}
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="split-block">
            <div>
              {project.cover_image && (
                <div className="card-media" style={{ borderRadius: "var(--radius-md)", marginBottom: 30 }}>
                  <img src={project.cover_image} alt={project.title} />
                </div>
              )}

              <div className="section-label">About this project</div>
              {project.summary && <p className="section-subtitle" style={{ marginBottom: 14 }}>{project.summary}</p>}
              {project.description && <p className="section-subtitle" style={{ whiteSpace: "pre-wrap" }}>{project.description}</p>}
            </div>

            <div>
              <div className="mv-card">
                <h3 style={{ marginBottom: 14 }}>Status</h3>
                <span className={`badge badge-${project.status === "ongoing" ? "active" : project.status}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>

              <Link to="/donate" className="btn btn-primary btn-block" style={{ marginTop: 20 }}>
                Support this project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProjectDetail;
