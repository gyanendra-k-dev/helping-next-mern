import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import useAdminResource from "../../hooks/useAdminResource";
import "./InnerPages.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function readTime(body) {
  const words = (body || "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function Blog() {
  const { items: posts, loading, error } = useAdminResource("/blog");

  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.blog} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Blog</span>
          </div>
          <p className="page-hero-eyebrow">Blog & News</p>
          <h1>Stories, updates and lessons from the field</h1>
          <p>Read about our programmes, the people we work with and what we're learning along the way.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          {loading && <p className="inline-note">Loading posts…</p>}
          {!loading && error && <p className="inline-note">{error}</p>}
          {!loading && !error && posts.length === 0 && <p className="inline-note">No posts published yet.</p>}

          {!loading && !error && (
            <div className="grid grid-3">
              {posts.map((post) => (
                <div className="card blog-card" key={post.id}>
                  <div className="card-media">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} loading="lazy" />
                    ) : (
                      <div style={{ height: 160, background: "var(--color-accent-soft)" }} />
                    )}
                  </div>
                  <div className="card-body">
                    <span className="card-eyebrow">{post.author?.name || "Helping Next"}</span>
                    <h3>{post.title}</h3>
                    <div className="blog-meta">
                      <span>{formatDate(post.published_at)}</span>
                      <span className="dot"></span>
                      <span>{readTime(post.body)}</span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="focus-list-link">
                      Read article →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Blog;
