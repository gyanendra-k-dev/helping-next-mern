import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGES } from "../../utils/images";
import useAdminResource from "../../hooks/useAdminResource";
import "./InnerPages.css";

function Gallery() {
  const { items, loading, error } = useAdminResource("/gallery");
  const [filter, setFilter] = useState("All");

  const albums = useMemo(() => {
    const unique = [...new Set(items.map((i) => i.album).filter(Boolean))];
    return ["All", ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.album === filter);
  }, [filter, items]);

  return (
    <>
      <section className="page-hero">
        <img src={HERO_IMAGES.gallery} alt="" className="page-hero-bg" />
        <div className="page-hero-scrim"></div>
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Gallery</span>
          </div>
          <p className="page-hero-eyebrow">Photos & Moments</p>
          <h1>Moments from our campaigns and events</h1>
          <p>A look at the people and places behind every Helping Next initiative.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          {albums.length > 1 && (
            <div className="filter-tabs">
              {albums.map((f) => (
                <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="inline-note">Loading gallery…</p>}
          {!loading && error && <p className="inline-note">{error}</p>}
          {!loading && !error && filtered.length === 0 && <p className="inline-note">No photos uploaded yet.</p>}

          {!loading && !error && (
            <div className="gallery-grid">
              {filtered.map((item) => (
                <div className="gallery-tile" key={item.id}>
                  <img src={item.image_path} alt={item.title || "Gallery photo"} loading="lazy" />
                  <div className="gallery-tile-caption">
                    {item.album && <span>{item.album}</span>}
                    <strong>{item.title || "Untitled"}</strong>
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

export default Gallery;
