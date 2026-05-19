/* ===========================================================
   MisReservas.jsx - Lista de reservas guardadas en localStorage
   =========================================================== */

import { useState } from "react";
import { leerReservas, eliminarReserva } from "../lib/storage.js";
import { formatoCLP } from "../data/data.js";

function MisReservas({ navegar }) {
  const [reservas, setReservas] = useState(() => leerReservas());

  function cancelar(codigo) {
    if (!confirm("¿Cancelar esta reserva? Esta acción no se puede deshacer.")) {
      return;
    }
    eliminarReserva(codigo);
    setReservas(leerReservas());
  }

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Mis Reservas</h2>
          <p className="text-muted mb-5">
            Aquí ves tus citas agendadas. Puedes cancelarlas si lo necesitas.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {reservas.length === 0 ? (
              <div className="servicios-vacio">
                <i className="bi bi-calendar-x" aria-hidden="true"></i>
                <h4>No tienes reservas</h4>
                <p>Agenda tu primera cita en pocos pasos.</p>
                <button
                  className="btn btn-rosa"
                  onClick={() => navegar("reservar")}
                >
                  <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
                  Reservar ahora
                </button>
              </div>
            ) : (
              <>
                {reservas.map((r) => (
                  <div className="reserva-item" key={r.codigo}>
                    <div>
                      <small className="text-muted d-block">
                        Código: <strong>{r.codigo}</strong>
                      </small>
                      <h5 className="mb-1 mt-1">{r.servicioNombre}</h5>
                      <small className="text-muted d-block">
                        <i
                          className="bi bi-person me-1"
                          aria-hidden="true"
                        ></i>
                        {r.profesionalNombre}
                      </small>
                      <small className="text-muted d-block">
                        <i
                          className="bi bi-calendar me-1"
                          aria-hidden="true"
                        ></i>
                        {r.fechaTexto} · {r.hora} hrs
                      </small>
                    </div>
                    <div className="text-end">
                      <div
                        className="precio"
                        style={{
                          color: "var(--rosa)",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                      >
                        {formatoCLP(r.precio)}
                      </div>
                      <button
                        className="btn btn-sm btn-outline-rosa mt-2"
                        onClick={() => cancelar(r.codigo)}
                      >
                        <i className="bi bi-x-circle me-1" aria-hidden="true"></i>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <button
                    className="btn btn-rosa"
                    onClick={() => navegar("reservar")}
                  >
                    <i
                      className="bi bi-plus-circle me-2"
                      aria-hidden="true"
                    ></i>
                    Nueva reserva
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default MisReservas;
