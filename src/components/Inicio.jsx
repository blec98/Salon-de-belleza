/* ===========================================================
   Inicio.jsx - Sección principal del sitio
   Hero, estadísticas, misión/visión/valores, servicios destacados,
   testimonios, galería antes/después, promociones y CTA final
   =========================================================== */

import { useState } from "react";
import {
  INFO_SALON,
  PROMOCIONES,
  ESTUDIANTE,
  ESTADISTICAS,
  SERVICIOS,
  TESTIMONIOS,
  ANTES_DESPUES,
  formatoCLP,
} from "../data/data.js";

function Inicio({ navegar }) {
  const destacados = SERVICIOS.filter((s) => s.destacado).slice(0, 4);

  return (
    <div className="fade-in">
      {/* HERO */}
      <header className="hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <span className="badge-promo">
                <i className="bi bi-stars me-1" aria-hidden="true"></i>
                Tu belleza, nuestra pasión
              </span>
              <h1 className="mt-4">
                Realza tu belleza en <br />
                Belleza &amp; Estilo
              </h1>
              <p className="lead mt-3">
                El salón de belleza líder en Osorno. Servicios profesionales de
                cabello, estética y bienestar pensados para que luzcas y te
                sientas espectacular.
              </p>
              <ul className="hero-bullets">
                <li>
                  <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                  +5 años de experiencia
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                  Productos profesionales
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                  Atención personalizada
                </li>
              </ul>
              <div className="mt-4">
                <button
                  className="btn btn-rosa me-2"
                  onClick={() => navegar("reservar")}
                >
                  <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
                  Reservar ahora
                </button>
                <button
                  className="btn btn-outline-rosa text-white border-white"
                  onClick={() => navegar("servicios")}
                >
                  Ver servicios
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ESTADÍSTICAS */}
      <div className="container">
        <div className="estadisticas">
          {ESTADISTICAS.map((e, i) => (
            <div className="estadistica-item" key={i}>
              <i className={"bi " + e.icono} aria-hidden="true"></i>
              <span className="estadistica-valor">{e.valor}</span>
              <span className="estadistica-etiqueta">{e.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MISIÓN / VISIÓN / VALORES */}
      <section className="seccion container text-center">
        <h2 className="seccion-titulo">Nuestra Esencia</h2>
        <p className="text-muted mb-5">
          Conoce lo que nos mueve día a día en {INFO_SALON.nombre}
        </p>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card-mvv p-4">
              <div className="icono">
                <i className="bi bi-bullseye" aria-hidden="true"></i>
              </div>
              <h4>Misión</h4>
              <p className="text-muted">{INFO_SALON.mision}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-mvv p-4">
              <div className="icono">
                <i className="bi bi-eye" aria-hidden="true"></i>
              </div>
              <h4>Visión</h4>
              <p className="text-muted">{INFO_SALON.vision}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-mvv p-4">
              <div className="icono">
                <i className="bi bi-heart" aria-hidden="true"></i>
              </div>
              <h4>Valores</h4>
              <p className="text-muted">{INFO_SALON.valores}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS DESTACADOS */}
      <section className="seccion" style={{ background: "var(--rosa-suave)" }}>
        <div className="container">
          <div className="text-center">
            <h2 className="seccion-titulo">Servicios Destacados</h2>
            <p className="text-muted mb-5">
              Nuestros tratamientos más solicitados por nuestras clientas
            </p>
          </div>
          <div className="row g-4">
            {destacados.map((s) => (
              <div className="col-12 col-sm-6 col-lg-3" key={s.id}>
                <div
                  className="destacado-card"
                  onClick={() => navegar("reservar", { servicioId: s.id })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navegar("reservar", { servicioId: s.id });
                    }
                  }}
                >
                  <img
                    src={s.imagen}
                    alt={s.nombre}
                    width="600"
                    height="400"
                    loading="lazy"
                  />
                  <div className="destacado-card-body">
                    <span className="badge-categoria">{s.categoria}</span>
                    <h5 className="mb-2">{s.nombre}</h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="precio" style={{ color: "var(--rosa)", fontWeight: 600 }}>
                        {formatoCLP(s.precio)}
                      </span>
                      <small className="text-muted">{s.duracionMin} min</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <button className="btn btn-rosa" onClick={() => navegar("servicios")}>
              Ver todos los servicios
              <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Lo que dicen nuestras clientas</h2>
          <p className="text-muted mb-5">
            Más de 5.000 personas confían en Belleza &amp; Estilo
          </p>
        </div>
        <div className="row g-4">
          {TESTIMONIOS.slice(0, 6).map((t, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <div className="testimonio-card">
                <div className="d-flex align-items-center">
                  <div className="testimonio-avatar" aria-hidden="true">
                    {t.iniciales}
                  </div>
                  <div>
                    <strong>{t.nombre}</strong>
                    <br />
                    <small className="text-muted">{t.servicio}</small>
                  </div>
                </div>
                <div
                  className="testimonio-estrellas"
                  aria-label={"Calificación " + t.calificacion + " de 5"}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i
                      key={n}
                      className={
                        "bi " + (n <= t.calificacion ? "bi-star-fill" : "bi-star")
                      }
                      aria-hidden="true"
                    ></i>
                  ))}
                </div>
                <p className="testimonio-texto mb-0">"{t.comentario}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERÍA ANTES/DESPUÉS */}
      {ANTES_DESPUES.length > 0 && (
        <section className="seccion" style={{ background: "var(--crema)" }}>
          <div className="container">
            <div className="text-center">
              <h2 className="seccion-titulo">Antes &amp; Después</h2>
              <p className="text-muted mb-5">
                Desliza el control para ver la transformación
              </p>
            </div>
            <div className="row g-4 justify-content-center">
              {ANTES_DESPUES.map((item) => {
                const cols =
                  ANTES_DESPUES.length === 1
                    ? "col-md-8 col-lg-6"
                    : ANTES_DESPUES.length === 2
                    ? "col-md-6"
                    : "col-md-6 col-lg-4";
                return (
                  <div className={cols} key={item.id}>
                    <AntesDespuesCard item={item} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PROMOCIONES */}
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Promociones &amp; Novedades</h2>
          <p className="text-muted mb-5">
            Aprovecha nuestras ofertas especiales por tiempo limitado
          </p>
        </div>
        <div className="row g-4">
          {PROMOCIONES.map((p, i) => (
            <div className="col-md-4" key={i}>
              <div
                className="promo-card p-4 h-100"
                onClick={() => navegar(p.cta || "cotizar")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navegar(p.cta || "cotizar");
                  }
                }}
              >
                <i
                  className={"bi " + p.icono}
                  style={{ fontSize: "2.5rem", color: "var(--rosa)" }}
                  aria-hidden="true"
                ></i>
                <h4 className="mt-3">{p.titulo}</h4>
                <p className="text-muted mb-0">{p.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="seccion container">
        <div className="cta-banner">
          <h3>¿Lista para sentirte radiante?</h3>
          <p className="mb-4 mt-3" style={{ fontSize: "1.1rem", opacity: 0.95 }}>
            Reserva tu cita hoy mismo y vive la experiencia Belleza &amp; Estilo
          </p>
          <button className="btn btn-rosa" onClick={() => navegar("reservar")}>
            <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
            Reservar mi cita
          </button>
        </div>
      </section>

      {/* CRÉDITOS DEL ESTUDIANTE */}
      <section className="container py-4">
        <div className="tarjeta-creditos">
          <i className="bi bi-mortarboard" aria-hidden="true"></i>
          <h5
            className="mt-2 mb-1"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {ESTUDIANTE.caso}
          </h5>
          <p className="mb-1 text-muted">
            Desarrollado por{" "}
            <strong style={{ color: "var(--oscuro)" }}>
              {ESTUDIANTE.nombre}
            </strong>{" "}
            — {ESTUDIANTE.institucion}
          </p>
          <a
            href={ESTUDIANTE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-rosa mt-2"
          >
            <i className="bi bi-github me-2" aria-hidden="true"></i>
            github.com/blec98
          </a>
        </div>
      </section>
    </div>
  );
}

/* Card con slider antes/después */
function AntesDespuesCard({ item }) {
  const [pos, setPos] = useState(50);

  return (
    <div className="antes-despues-card">
      <div className="antes-despues-imgs">
        <img
          src={item.antes}
          alt={"Antes — " + item.titulo}
          width="800"
          height="600"
          loading="lazy"
        />
        <img
          className="img-despues"
          src={item.despues}
          alt={"Después — " + item.titulo}
          width="800"
          height="600"
          loading="lazy"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        />
        <span className="etiqueta izq">ANTES</span>
        <span className="etiqueta der">DESPUÉS</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(parseInt(e.target.value))}
        className="antes-despues-slider"
        aria-label={"Comparar antes y después de " + item.titulo}
      />
      <div className="antes-despues-titulo">{item.titulo}</div>
    </div>
  );
}

export default Inicio;
