/* ===========================================================
   Navbar.jsx - Menú de navegación + toggle de tema
   =========================================================== */

import { useState, useEffect, useRef } from "react";
import { leerTema, escribirTema } from "../lib/storage.js";

// Tema claro por defecto. Solo se aplica oscuro si el usuario lo eligió.
function temaInicial() {
  return leerTema() === "oscuro" ? "oscuro" : "claro";
}

function Navbar({ seccionActiva, navegar }) {
  const [tema, setTema] = useState(temaInicial);
  const navRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    escribirTema(tema);
  }, [tema]);

  // Cerrar menú móvil al hacer click fuera o presionar Escape
  useEffect(() => {
    function alClickFuera(e) {
      const menu = document.getElementById("menuNav");
      if (!menu || !menu.classList.contains("show")) return;
      if (navRef.current && !navRef.current.contains(e.target)) {
        menu.classList.remove("show");
      }
    }
    function alEscape(e) {
      if (e.key !== "Escape") return;
      const menu = document.getElementById("menuNav");
      if (menu && menu.classList.contains("show")) {
        menu.classList.remove("show");
      }
    }
    document.addEventListener("click", alClickFuera);
    document.addEventListener("keydown", alEscape);
    return () => {
      document.removeEventListener("click", alClickFuera);
      document.removeEventListener("keydown", alEscape);
    };
  }, []);

  const enlaces = [
    { id: "inicio", texto: "Inicio", icono: "bi-house-door" },
    { id: "servicios", texto: "Servicios", icono: "bi-scissors" },
    { id: "cotizar", texto: "Cotizar", icono: "bi-calculator" },
    { id: "blog", texto: "Blog", icono: "bi-journal-text" },
    { id: "faq", texto: "FAQ", icono: "bi-question-circle" },
  ];

  function cerrarMenuMovil() {
    const menu = document.getElementById("menuNav");
    if (menu && menu.classList.contains("show")) {
      menu.classList.remove("show");
    }
  }

  function alClick(id) {
    navegar(id);
    cerrarMenuMovil();
  }

  return (
    <nav
      ref={navRef}
      className="navbar navbar-expand-lg navbar-bs fixed-top py-3"
    >
      <div className="container">
        <button
          className="brand-logo"
          onClick={() => alClick("inicio")}
          aria-label="Ir al inicio"
        >
          <i className="bi bi-flower2 me-2" aria-hidden="true"></i>
          Belleza &amp; Estilo
        </button>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuNav"
          aria-controls="menuNav"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menuNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {enlaces.map((e) => (
              <li className="nav-item" key={e.id}>
                <button
                  className={
                    "nav-link nav-link-custom" +
                    (seccionActiva === e.id ? " activo" : "")
                  }
                  onClick={() => alClick(e.id)}
                  aria-current={seccionActiva === e.id ? "page" : undefined}
                >
                  <i className={"bi " + e.icono + " me-1"} aria-hidden="true"></i>
                  {e.texto}
                </button>
              </li>
            ))}
            <li className="nav-item">
              <button
                className={
                  "nav-link nav-link-custom nav-cta-reservar" +
                  (seccionActiva === "reservar" ? " activo" : "")
                }
                onClick={() => alClick("reservar")}
              >
                <i
                  className="bi bi-calendar-check me-1"
                  aria-hidden="true"
                ></i>
                Reservar
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn-tema"
                onClick={() =>
                  setTema((t) => (t === "claro" ? "oscuro" : "claro"))
                }
                aria-label={
                  tema === "claro"
                    ? "Activar modo oscuro"
                    : "Activar modo claro"
                }
              >
                <i
                  className={tema === "claro" ? "bi bi-moon" : "bi bi-sun"}
                  aria-hidden="true"
                ></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
