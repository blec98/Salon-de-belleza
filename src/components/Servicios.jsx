/* ===========================================================
   Servicios.jsx - Galería de servicios con filtros y búsqueda
   Filtra por categoría, busca por nombre y permite Reservar o Cotizar
   =========================================================== */

import { useState, useEffect, useMemo } from "react";
import { CATEGORIAS, formatoCLP } from "../data/data.js";
import { supabase } from "../lib/supabase.js";
import { urlServicio } from "../lib/supabaseStorage.js";

function Servicios({ navegar }) {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let cancelado = false;
    const timeoutSeguridad = setTimeout(() => {
      if (!cancelado) {
        setCargando(false);
        setError(true);
      }
    }, 8000);

    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("servicios")
          .select("*")
          .eq("activo", true)
          .order("categoria")
          .order("nombre");
        if (cancelado) return;
        if (err) {
          console.error("[servicios] Error:", err);
          setError(true);
        } else {
          setServicios(data || []);
        }
      } catch (e) {
        if (!cancelado) {
          console.error("[servicios] Excepcion:", e);
          setError(true);
        }
      } finally {
        if (!cancelado) {
          clearTimeout(timeoutSeguridad);
          setCargando(false);
        }
      }
    })();

    return () => {
      cancelado = true;
      clearTimeout(timeoutSeguridad);
    };
  }, []);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return servicios.filter((s) => {
      const matchCat = categoria === "Todos" || s.categoria === categoria;
      const matchBus =
        term === "" ||
        s.nombre.toLowerCase().includes(term) ||
        (s.descripcion || "").toLowerCase().includes(term);
      return matchCat && matchBus;
    });
  }, [servicios, categoria, busqueda]);

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh", paddingTop: "90px" }}>
        <div className="spinner-border" style={{ color: "var(--rosa)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center" style={{ paddingTop: "120px", minHeight: "60vh" }}>
        <i className="bi bi-wifi-off" style={{ fontSize: "3rem", color: "var(--rosa)" }} aria-hidden="true"></i>
        <h4 className="mt-3">No pudimos cargar los servicios</h4>
        <p className="text-muted">Revisa tu conexión e inténtalo nuevamente.</p>
        <button className="btn btn-rosa" onClick={() => window.location.reload()}>
          <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Nuestros Servicios</h2>
          <p className="text-muted mb-4">
            Filtra por categoría o busca el servicio que necesitas
          </p>
        </div>

        {/* Filtros + búsqueda */}
        <div className="filtros-servicios">
          <div className="container px-0">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="chips-categoria" role="group" aria-label="Filtrar por categoría">
                {CATEGORIAS.map((cat) => (
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
              <div style={{ position: "relative", minWidth: "240px" }}>
                <i
                  className="bi bi-search"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--gris)",
                  }}
                ></i>
                <input
                  type="search"
                  className="input-busqueda"
                  placeholder="Buscar servicio…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  aria-label="Buscar servicio por nombre"
                  style={{ paddingLeft: "38px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid de servicios */}
        {filtrados.length === 0 ? (
          <div className="servicios-vacio">
            <i className="bi bi-emoji-frown" aria-hidden="true"></i>
            <h4>Sin resultados</h4>
            <p>Intenta cambiar el filtro o la búsqueda.</p>
            <button
              className="btn btn-outline-rosa"
              onClick={() => {
                setCategoria("Todos");
                setBusqueda("");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filtrados.map((s) => (
              <div className="col-12 col-sm-6 col-lg-4" key={s.id}>
                <div className="servicio-card">
                  <div className="servicio-card-img">
                    <img
                      src={urlServicio(s.imagen_path) || "/images/servicios/placeholder.webp"}
                      alt={s.nombre}
                      width="600"
                      height="400"
                      loading="lazy"
                      style={{ objectPosition: s.imagen_posicion || "center" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    {s.destacado && (
                      <span className="badge-destacado">POPULAR</span>
                    )}
                  </div>
                  <div className="servicio-card-body">
                    <span className="badge-categoria">{s.categoria}</span>
                    <h4 className="h5">{s.nombre}</h4>
                    <p className="text-muted small">{s.descripcion}</p>
                    <div className="servicio-meta">
                      <span>
                        <i className="bi bi-clock" aria-hidden="true"></i>
                        {s.duracion_min} min
                      </span>
                      <span>
                        <i className="bi bi-tag" aria-hidden="true"></i>
                        por {s.unidad}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="precio">{formatoCLP(s.precio)}</span>
                    </div>
                    <div className="servicio-card-acciones">
                      <button
                        className="btn btn-rosa"
                        onClick={() => navegar("reservar", { servicioId: s.id })}
                      >
                        <i
                          className="bi bi-calendar-check me-1"
                          aria-hidden="true"
                        ></i>
                        Reservar
                      </button>
                      <button
                        className="btn btn-outline-rosa"
                        onClick={() => navegar("cotizar", { servicioId: s.id })}
                      >
                        Cotizar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5">
          <p className="text-muted">
            ¿Quieres armar un paquete personalizado o cotizar varios servicios?
          </p>
          <button className="btn btn-rosa" onClick={() => navegar("cotizar")}>
            <i className="bi bi-calculator me-2" aria-hidden="true"></i>
            Ir a Cotizar
          </button>
        </div>
      </section>
    </div>
  );
}

export default Servicios;
