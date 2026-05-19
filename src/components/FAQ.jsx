/* ===========================================================
   FAQ.jsx - Preguntas frecuentes en acordeón accesible
   Usa <details>/<summary> nativo (cero JS, a11y completa)
   =========================================================== */

import { FAQ as PREGUNTAS } from "../data/data.js";

function FAQ({ navegar }) {
  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Preguntas Frecuentes</h2>
          <p className="text-muted mb-5">
            Si tu duda no está aquí, escríbenos por WhatsApp y te respondemos rápido
          </p>
        </div>

        <div className="faq-lista">
          {PREGUNTAS.map((p, i) => (
            <details className="faq-item" key={i}>
              <summary>
                <span>{p.pregunta}</span>
              </summary>
              <div className="faq-respuesta">{p.respuesta}</div>
            </details>
          ))}
        </div>

        <div className="text-center mt-5">
          <p className="text-muted">¿Listo para agendar?</p>
          <button className="btn btn-rosa" onClick={() => navegar("reservar")}>
            <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
            Reservar mi cita
          </button>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
