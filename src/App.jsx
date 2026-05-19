/* ===========================================================
   App.jsx - Componente raíz de la SPA
   Navegación por estado interno, sin router externo
   =========================================================== */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Inicio from "./components/Inicio.jsx";
import Servicios from "./components/Servicios.jsx";
import Cotizar from "./components/Cotizar.jsx";
import Reservar from "./components/Reservar.jsx";
import MisReservas from "./components/MisReservas.jsx";
import Blog from "./components/Blog.jsx";
import FAQ from "./components/FAQ.jsx";
import Footer from "./components/Footer.jsx";

const SECCIONES_VALIDAS = [
  "inicio",
  "servicios",
  "reservar",
  "cotizar",
  "mis-reservas",
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

  // Persistir sección para sobrevivir refresh accidental
  useEffect(() => {
    try {
      sessionStorage.setItem("be:seccion", seccion);
    } catch {
      /* ignorar */
    }
  }, [seccion]);

  function navegar(destino, datos = null) {
    setPayload(datos);
    setSeccion(destino);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderSeccion() {
    switch (seccion) {
      case "servicios":
        return <Servicios navegar={navegar} />;
      case "cotizar":
        return <Cotizar payload={payload} />;
      case "reservar":
        return <Reservar payload={payload} navegar={navegar} />;
      case "mis-reservas":
        return <MisReservas navegar={navegar} />;
      case "blog":
        return <Blog />;
      case "faq":
        return <FAQ navegar={navegar} />;
      case "inicio":
      default:
        return <Inicio navegar={navegar} />;
    }
  }

  return (
    <>
      <Navbar seccionActiva={seccion} navegar={navegar} />
      <main>{renderSeccion()}</main>
      <Footer navegar={navegar} />
    </>
  );
}

export default App;
