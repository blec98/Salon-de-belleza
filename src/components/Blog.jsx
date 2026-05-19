/* ===========================================================
   Blog.jsx - Curaduría de artículos externos
   Cada card abre el artículo original en pestaña nueva.
   El sitio actúa como agregador: título + fuente + nuestra
   recomendación curatorial. No replica contenido ajeno.
   =========================================================== */

import { useState, useMemo } from "react";
import { POSTS_BLOG } from "../data/data.js";

function formatearFecha(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Categorías disponibles (incluye "Todos")
function categoriasDisponibles() {
  const set = new Set(POSTS_BLOG.map((p) => p.categoria));
  return ["Todos", ...Array.from(set)];
}

function Blog() {
  const [categoria, setCategoria] = useState("Todos");
  const categorias = useMemo(categoriasDisponibles, []);

  const filtrados = useMemo(() => {
    if (categoria === "Todos") return POSTS_BLOG;
    return POSTS_BLOG.filter((p) => p.categoria === categoria);
  }, [categoria]);

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Blog</h2>
          <p className="text-muted mb-2">
            Tips de belleza, tendencias y guías expertas
          </p>
          <p className="text-muted mb-5" style={{ fontSize: "0.9rem" }}>
            <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
            Curaduría de artículos publicados por medios y profesionales del rubro
          </p>
        </div>

        {/* Filtros por categoría */}
        <div className="chips-categoria justify-content-center mb-5">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={"chip-categoria" + (categoria === cat ? " activo" : "")}
              onClick={() => setCategoria(cat)}
              aria-pressed={categoria === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="servicios-vacio">
            <i className="bi bi-journal-x" aria-hidden="true"></i>
            <p>No hay artículos en esta categoría aún.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtrados.map((p) => (
              <div className="col-md-6 col-lg-4" key={p.slug}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-card-link"
                  aria-label={`Leer "${p.titulo}" en ${p.fuente} (se abre en nueva pestaña)`}
                >
                  <article className="post-card post-card-texto">
                    <div className="post-card-body">
                      <div className="post-card-meta-top">
                        <span className="badge-categoria">{p.categoria}</span>
                        <span className="chip-fuente-inline">
                          <i
                            className="bi bi-box-arrow-up-right me-1"
                            aria-hidden="true"
                          ></i>
                          {p.fuente}
                        </span>
                      </div>
                      <h4 className="post-titulo">{p.titulo}</h4>
                      <p className="post-resumen">{p.resumen}</p>
                      <div className="post-fecha">
                        <i
                          className="bi bi-calendar3 me-1"
                          aria-hidden="true"
                        ></i>
                        {formatearFecha(p.fecha)}
                        {p.autor && (
                          <>
                            {" · "}
                            <i
                              className="bi bi-person me-1"
                              aria-hidden="true"
                            ></i>
                            {p.autor}
                          </>
                        )}
                      </div>
                      <span className="post-card-cta">
                        Leer en {p.fuente}
                        <i
                          className="bi bi-arrow-up-right ms-1"
                          aria-hidden="true"
                        ></i>
                      </span>
                    </div>
                  </article>
                </a>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-muted mt-5" style={{ fontSize: "0.85rem" }}>
          Los enlaces te llevan al sitio original del medio. Belleza &amp; Estilo
          no es responsable del contenido de terceros.
        </p>
      </section>
    </div>
  );
}

export default Blog;
