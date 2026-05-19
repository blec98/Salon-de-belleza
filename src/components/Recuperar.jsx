/* ===========================================================
   Recuperar.jsx - Recuperación de contraseña vía Supabase
   =========================================================== */

import { useState } from "react";
import { supabase } from "../lib/supabase.js";

function Recuperar({ navegar }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!email) { setError("Ingresa tu correo electrónico."); return; }
    setCargando(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setCargando(false);
    if (err) {
      setError("No se pudo enviar el correo. Verifica la dirección e intenta nuevamente.");
    } else {
      setEnviado(true);
    }
  }

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="auth-card">
              <div className="text-center mb-4">
                <i
                  className="bi bi-lock-fill"
                  style={{ fontSize: "2.5rem", color: "var(--rosa)" }}
                  aria-hidden="true"
                ></i>
                <h2 className="seccion-titulo mt-2" style={{ fontSize: "1.6rem" }}>
                  Recuperar contraseña
                </h2>
              </div>

              {enviado ? (
                <div className="text-center py-2">
                  <i
                    className="bi bi-envelope-check"
                    style={{ fontSize: "3rem", color: "var(--rosa)" }}
                    aria-hidden="true"
                  ></i>
                  <h5 className="mt-3">Correo enviado</h5>
                  <p className="text-muted mb-4">
                    Revisa tu bandeja de entrada y sigue las instrucciones para
                    restablecer tu contraseña.
                  </p>
                  <button className="btn btn-rosa" onClick={() => navegar("auth")}>
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={enviar} noValidate>
                  <p className="text-muted small mb-4">
                    Ingresa tu correo y te enviaremos un enlace para restablecer
                    tu contraseña.
                  </p>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="rec-email">
                      Correo electrónico
                    </label>
                    <input
                      id="rec-email"
                      type="email"
                      autoComplete="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="tu@correo.com"
                    />
                  </div>

                  {error && (
                    <div className="alerta-error mb-3">
                      <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn-rosa w-100" disabled={cargando}>
                    {cargando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                        Enviando…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2" aria-hidden="true"></i>
                        Enviar enlace
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="link-footer small"
                      onClick={() => navegar("auth")}
                      style={{ color: "var(--rosa)", border: "none", background: "none", padding: 0 }}
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Recuperar;
