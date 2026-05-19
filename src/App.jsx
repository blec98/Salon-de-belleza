/* ===========================================================
   App.jsx - Componente raíz de la SPA
   Navegación por estado interno, sin router externo
   =========================================================== */

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase.js";
import { getPerfil, logout } from "./lib/auth.js";
import Navbar from "./components/Navbar.jsx";
import Inicio from "./components/Inicio.jsx";
import Servicios from "./components/Servicios.jsx";
import Cotizar from "./components/Cotizar.jsx";
import Reservar from "./components/Reservar.jsx";
import MisReservas from "./components/MisReservas.jsx";
import Blog from "./components/Blog.jsx";
import FAQ from "./components/FAQ.jsx";
import Auth from "./components/Auth.jsx";
import MiCuenta from "./components/MiCuenta.jsx";
import Admin from "./components/Admin.jsx";
import Recuperar from "./components/Recuperar.jsx";
import Footer from "./components/Footer.jsx";

const SECCIONES_VALIDAS = [
  "inicio",
  "servicios",
  "reservar",
  "cotizar",
  "blog",
  "faq",
];

function leerSeccionInicial() {
  try {
    const guardada = sessionStorage.getItem("be:seccion");
    if (guardada && SECCIONES_VALIDAS.includes(guardada)) return guardada;
  } catch {
    /* sessionStorage bloqueado */
  }
  return "inicio";
}

function App() {
  const [seccion, setSeccion] = useState(leerSeccionInicial);
  const [payload, setPayload] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [authCargando, setAuthCargando] = useState(true);

  // Escuchar cambios de sesión Supabase
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        const p = await getPerfil(session.user.id);
        setPerfil(p);
      }
      setAuthCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          const p = await getPerfil(session.user.id);
          setPerfil(p);
        } else {
          setAuthUser(null);
          setPerfil(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Persistir sección para sobrevivir refresh accidental
  useEffect(() => {
    try {
      if (SECCIONES_VALIDAS.includes(seccion)) {
        sessionStorage.setItem("be:seccion", seccion);
      }
    } catch {
      /* ignorar */
    }
  }, [seccion]);

  function navegar(destino, datos = null) {
    setPayload(datos);
    setSeccion(destino);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    await logout();
    setAuthUser(null);
    setPerfil(null);
    navegar("inicio");
  }

  function handleAuthSuccess(user, p) {
    setAuthUser(user);
    setPerfil(p);
    if (p?.rol === "admin") {
      navegar("admin");
    } else {
      navegar("mi-cuenta");
    }
  }

  function renderSeccion() {
    if (authCargando) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div
            className="spinner-border"
            style={{ color: "var(--rosa)" }}
            role="status"
          >
            <span className="visually-hidden">Cargando…</span>
          </div>
        </div>
      );
    }

    switch (seccion) {
      case "servicios":
        return <Servicios navegar={navegar} />;
      case "cotizar":
        return <Cotizar payload={payload} />;
      case "reservar":
        return (
          <Reservar
            payload={payload}
            navegar={navegar}
            authUser={authUser}
            perfil={perfil}
          />
        );
      case "mis-reservas":
        // Redirige al panel de usuario que ya tiene la pestaña de reservas
        if (authUser) { navegar("mi-cuenta"); return null; }
        navegar("auth"); return null;
      case "blog":
        return <Blog />;
      case "faq":
        return <FAQ navegar={navegar} />;
      case "auth":
        return <Auth navegar={navegar} onAuthSuccess={handleAuthSuccess} />;
      case "recuperar":
        return <Recuperar navegar={navegar} />;
      case "mi-cuenta":
        if (!authUser) {
          navegar("auth");
          return null;
        }
        return (
          <MiCuenta
            perfil={perfil}
            authUser={authUser}
            onPerfilUpdate={(p) => setPerfil((prev) => ({ ...prev, ...p }))}
            navegar={navegar}
          />
        );
      case "admin":
        if (!authUser || perfil?.rol !== "admin") {
          navegar("inicio");
          return null;
        }
        return <Admin navegar={navegar} perfil={perfil} />;
      case "inicio":
      default:
        return <Inicio navegar={navegar} />;
    }
  }

  const mostrarFooter = !["admin"].includes(seccion);

  return (
    <>
      <Navbar
        seccionActiva={seccion}
        navegar={navegar}
        authUser={authUser}
        perfil={perfil}
        onLogout={handleLogout}
      />
      <main>{renderSeccion()}</main>
      {mostrarFooter && <Footer navegar={navegar} />}
    </>
  );
}

export default App;
