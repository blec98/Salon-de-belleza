/* ===========================================================
   Navbar.jsx - Menú de navegación + toggle de tema + auth
   =========================================================== */

import { useState, useEffect, useRef } from "react";
import { leerTema, escribirTema } from "../lib/storage.js";

function temaInicial() {
  return leerTema() === "oscuro" ? "oscuro" : "claro";
}

function Navbar({ seccionActiva, navegar, authUser, perfil, onLogout }) {
  const [tema, setTema] = useState(temaInicial);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const navRef = useRef(null);
  const menuRef = useRef(null);

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
      setMenuUsuario(false);
    }
    document.addEventListener("click", alClickFuera);
    document.addEventListener("keydown", alEscape);
    return () => {
      document.removeEventListener("click", alClickFuera);
      document.removeEventListener("keydown", alEscape);
    };
  }, []);

  // Cerrar menú de usuario al click fuera
  useEffect(() => {
    if (!menuUsuario) return;
    function cerrar(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuUsuario(false);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [menuUsuario]);

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
    setMenuUsuario(false);
  }

  const iniciales = authUser
    ? (perfil?.nombre?.[0] || "") + (perfil?.apellido?.[0] || "")
    : "";

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

            {/* Reservar CTA */}
            <li className="nav-item">
              <button
                className={
                  "nav-link nav-link-custom nav-cta-reservar" +
                  (seccionActiva === "reservar" ? " activo" : "")
                }
                onClick={() => alClick("reservar")}
              >
                <i className="bi bi-calendar-check me-1" aria-hidden="true"></i>
                Reservar
              </button>
            </li>

            {/* Autenticación */}
            {authUser ? (
              <li className="nav-item" style={{ position: "relative" }} ref={menuRef}>
                <button
                  className="nav-avatar-btn"
                  onClick={() => setMenuUsuario((v) => !v)}
                  aria-label="Menú de usuario"
                  aria-expanded={menuUsuario}
                >
                  <span className="nav-avatar">{iniciales || "U"}</span>
                </button>
                {menuUsuario && (
                  <div className="nav-usuario-menu">
                    <div className="nav-usuario-header">
                      <strong>{perfil?.nombre || authUser?.email?.split("@")[0] || "Cuenta"}</strong>
                      <small>{authUser.email}</small>
                    </div>
                    <button
                      className="nav-usuario-item"
                      onClick={() => alClick("mi-cuenta")}
                    >
                      <i className="bi bi-person-circle me-2" aria-hidden="true"></i>
                      Mi cuenta
                    </button>
                    {perfil?.rol === "admin" && (
                      <button
                        className="nav-usuario-item"
                        onClick={() => alClick("admin")}
                      >
                        <i className="bi bi-shield-lock me-2" aria-hidden="true"></i>
                        Panel Admin
                      </button>
                    )}
                    <div className="nav-usuario-divider"></div>
                    <button
                      className="nav-usuario-item nav-usuario-salir"
                      onClick={async () => {
                        cerrarMenuMovil();
                        setMenuUsuario(false);
                        await onLogout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="btn-nav-ingresar"
                  onClick={() => alClick("auth")}
                >
                  <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i>
                  Ingresar
                </button>
              </li>
            )}

            {/* Toggle tema */}
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
