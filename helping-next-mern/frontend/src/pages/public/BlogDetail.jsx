import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import "./InnerPages.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function readTime(body) {
  const words = (body || "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/blog/${id}`)
      .then(({ data }) => {
        if (active) setPost(data);
      })
      .catch(() => {
        if (active) setError("Post not found.");
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
          <p className="inline-note">Loading article…</p>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="section">
        <div className="section-container">
          <p className="inline-note">{error || "Post not found."}</p>
          <Link to="/blog" className="btn btn-outline-dark btn-sm" style={{ marginTop: 12 }}>
            ← Back to Blog
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
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>#{id}</span>
          </div>
          <p className="page-hero-eyebrow">{post.author?.name || "Helping Next"}</p>
          <h1>{post.title}</h1>
          <p>{formatDate(post.published_at)} · {readTime(post.body)}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="legal-body">
            {post.cover_image && (
              <div className="card-media" style={{ borderRadius: "var(--radius-md)", marginBottom: 30 }}>
                <img src={post.cover_image} alt={post.title} />
              </div>
            )}

            {post.excerpt && <p style={{ marginBottom: 16, fontWeight: 600 }}>{post.excerpt}</p>}
            {post.body && <p style={{ marginBottom: 16, whiteSpace: "pre-wrap" }}>{post.body}</p>}

            <div style={{ marginTop: 30 }}>
              <Link to="/blog" className="btn btn-outline-dark">← Back to all articles</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BlogDetail;
