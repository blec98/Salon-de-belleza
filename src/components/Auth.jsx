/* ===========================================================
   Auth.jsx - Login y Registro
   =========================================================== */

import { useState } from "react";
import { login, register } from "../lib/auth.js";

function Auth({ navegar, onAuthSuccess }) {
  const [tab, setTab] = useState("login");

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="auth-card">
              <div className="text-center mb-4">
                <i
                  className="bi bi-flower2"
                  style={{ fontSize: "2.5rem", color: "var(--rosa)" }}
                  aria-hidden="true"
                ></i>
                <h2
                  className="seccion-titulo mt-2"
                  style={{ fontSize: "1.6rem" }}
                >
                  {tab === "login" ? "Bienvenida de vuelta" : "Crea tu cuenta"}
                </h2>
              </div>

              {/* Tabs */}
              <div className="auth-tabs mb-4">
                <button
                  className={"auth-tab" + (tab === "login" ? " activo" : "")}
                  onClick={() => setTab("login")}
                >
                  Iniciar sesión
                </button>
                <button
                  className={"auth-tab" + (tab === "register" ? " activo" : "")}
                  onClick={() => setTab("register")}
                >
                  Crear cuenta
                </button>
              </div>

              {tab === "login" ? (
                <FormLogin navegar={navegar} onSuccess={onAuthSuccess} />
              ) : (
                <FormRegister onSuccess={() => setTab("login")} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── LOGIN ──────────────────────────────────────────────── */
function FormLogin({ navegar, onSuccess }) {
  const [campos, setCampos] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function cambiar(k, v) {
    setCampos((p) => ({ ...p, [k]: v }));
    setError("");
  }

  async function enviar(e) {
    e.preventDefault();
    if (!campos.email || !campos.password) {
      setError("Completa todos los campos.");
      return;
    }
    setCargando(true);
    const res = await login(campos.email, campos.password);
    setCargando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSuccess(res.user, res.perfil);
  }

  return (
    <form onSubmit={enviar} noValidate>
      <div className="mb-3">
        <label className="form-label" htmlFor="login-email">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className="form-control"
          value={campos.email}
          onChange={(e) => cambiar("email", e.target.value)}
          placeholder="tu@correo.com"
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="form-control"
          value={campos.password}
          onChange={(e) => cambiar("password", e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="alerta-error mb-3">
          <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-rosa w-100"
        disabled={cargando}
      >
        {cargando ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Ingresando…
          </>
        ) : (
          <>
            <i className="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>
            Iniciar sesión
          </>
        )}
      </button>

      <div className="text-center mt-3">
        <button
          type="button"
          className="link-footer small"
          onClick={() => navegar("recuperar")}
          style={{ color: "var(--rosa)", border: "none", background: "none", padding: 0 }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </form>
  );
}

/* ── REGISTRO ───────────────────────────────────────────── */
function FormRegister({ onSuccess }) {
  const [campos, setCampos] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmar: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  function cambiar(k, v) {
    setCampos((p) => ({ ...p, [k]: v }));
    setError("");
  }

  async function enviar(e) {
    e.preventDefault();
    const { nombre, apellido, email, password, confirmar, telefono } = campos;

    if (!nombre || !apellido || !email || !password) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const res = await register({ nombre, apellido, email, password, telefono });
    setCargando(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setExito(true);
  }

  if (exito) {
    return (
      <div className="text-center py-3">
        <i
          className="bi bi-envelope-check"
          style={{ fontSize: "3rem", color: "var(--rosa)" }}
          aria-hidden="true"
        ></i>
        <h5 className="mt-3">¡Cuenta creada!</h5>
        <p className="text-muted mb-4">
          Revisa tu correo y confirma tu cuenta para poder ingresar.
        </p>
        <button className="btn btn-rosa" onClick={onSuccess}>
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <div className="row g-3 mb-3">
        <div className="col-6">
          <label className="form-label" htmlFor="reg-nombre">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            id="reg-nombre"
            type="text"
            autoComplete="given-name"
            className="form-control"
            value={campos.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
          />
        </div>
        <div className="col-6">
          <label className="form-label" htmlFor="reg-apellido">
            Apellido <span className="text-danger">*</span>
          </label>
          <input
            id="reg-apellido"
            type="text"
            autoComplete="family-name"
            className="form-control"
            value={campos.apellido}
            onChange={(e) => cambiar("apellido", e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="reg-email">
          Correo electrónico <span className="text-danger">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          className="form-control"
          value={campos.email}
          onChange={(e) => cambiar("email", e.target.value)}
          placeholder="tu@correo.com"
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="reg-tel">
          Teléfono
        </label>
        <input
          id="reg-tel"
          type="tel"
          autoComplete="tel"
          className="form-control"
          value={campos.telefono}
          onChange={(e) => cambiar("telefono", e.target.value)}
          placeholder="+56 9 1234 5678"
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="reg-password">
          Contraseña <span className="text-danger">*</span>
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          className="form-control"
          value={campos.password}
          onChange={(e) => cambiar("password", e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="reg-confirmar">
          Confirmar contraseña <span className="text-danger">*</span>
        </label>
        <input
          id="reg-confirmar"
          type="password"
          autoComplete="new-password"
          className="form-control"
          value={campos.confirmar}
          onChange={(e) => cambiar("confirmar", e.target.value)}
          placeholder="Repite la contraseña"
        />
      </div>

      {error && (
        <div className="alerta-error mb-3">
          <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-rosa w-100"
        disabled={cargando}
      >
        {cargando ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Creando cuenta…
          </>
        ) : (
          <>
            <i className="bi bi-person-plus me-2" aria-hidden="true"></i>
            Crear cuenta
          </>
        )}
      </button>
    </form>
  );
}

export default Auth;
