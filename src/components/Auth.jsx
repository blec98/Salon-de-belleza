/* ===========================================================
   Auth.jsx - Login y Registro
   =========================================================== */

import { useState } from "react";
import { login, register } from "../lib/auth.js";

/* ── Helpers RUT ─────────────────────────────────────────── */
function formatearRutInput(val) {
  const clean = val.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length <= 1) return clean;
  const dv   = clean.slice(-1);
  const body = clean.slice(0, -1);
  const conPuntos = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}

function validarRut(rut) {
  const clean = rut.replace(/[.\-\s]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let suma = 0, multiplo = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dv === dvEsperado;
}

function normalizarRut(rut) {
  const clean = rut.replace(/[.\-\s]/g, "").toUpperCase();
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

/* ── ROOT ────────────────────────────────────────────────── */
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
    if (!res.ok) { setError(res.error); return; }
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
          list="dominios-login"
          className="form-control"
          value={campos.email}
          onChange={(e) => cambiar("email", e.target.value)}
          placeholder="tu@correo.com"
        />
        <datalist id="dominios-login">
          {["gmail.com","hotmail.com","outlook.com","yahoo.com","icloud.com","live.cl","live.com"].map((d) => {
            const base = campos.email.includes("@") ? campos.email.split("@")[0] : campos.email;
            return base ? <option key={d} value={`${base}@${d}`} /> : null;
          })}
        </datalist>
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

      <button type="submit" className="btn btn-rosa w-100" disabled={cargando}>
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
    nombre: "", apellido: "", email: "",
    telefono: "", rut: "", password: "", confirmar: "",
  });
  const [error, setError]   = useState("");
  const [exito, setExito]   = useState(false);
  const [cargando, setCargando] = useState(false);

  function cambiar(k, v) {
    setCampos((p) => ({ ...p, [k]: v }));
    setError("");
  }

  function cambiarRut(val) {
    cambiar("rut", formatearRutInput(val));
  }

  function cambiarTel(val) {
    // Solo dígitos, máximo 8
    cambiar("telefono", val.replace(/\D/g, "").slice(0, 8));
  }

  async function enviar(e) {
    e.preventDefault();
    const { nombre, apellido, email, password, confirmar, telefono, rut } = campos;

    if (!nombre || !apellido || !email || !rut || !password) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    if (!validarRut(rut)) {
      setError("El RUT ingresado no es válido.");
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

    const telefonoCompleto = telefono.length === 8 ? `+569${telefono}` : null;
    const rutNormalizado   = normalizarRut(rut);

    setCargando(true);
    const res = await register({
      nombre, apellido, email, password,
      telefono: telefonoCompleto,
      rut: rutNormalizado,
    });
    setCargando(false);

    if (!res.ok) { setError(res.error); return; }
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

  const rutValido = campos.rut.length > 0 && validarRut(campos.rut);
  const rutInvalido = campos.rut.length > 0 && !validarRut(campos.rut);

  return (
    <form onSubmit={enviar} noValidate>
      {/* Nombre + Apellido */}
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

      {/* RUT */}
      <div className="mb-3">
        <label className="form-label" htmlFor="reg-rut">
          RUT <span className="text-danger">*</span>
        </label>
        <input
          id="reg-rut"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={"form-control" + (rutInvalido ? " is-invalid" : rutValido ? " is-valid" : "")}
          value={campos.rut}
          onChange={(e) => cambiarRut(e.target.value)}
          placeholder="12.345.678-9"
          maxLength={12}
        />
        {rutInvalido && (
          <div className="invalid-feedback">RUT inválido, verifica el dígito verificador.</div>
        )}
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label" htmlFor="reg-email">
          Correo electrónico <span className="text-danger">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          list="dominios-email"
          className="form-control"
          value={campos.email}
          onChange={(e) => cambiar("email", e.target.value)}
          placeholder="tu@correo.com"
        />
        <datalist id="dominios-email">
          {["gmail.com","hotmail.com","outlook.com","yahoo.com","icloud.com","live.cl","live.com"].map((d) => {
            const base = campos.email.includes("@") ? campos.email.split("@")[0] : campos.email;
            return base ? <option key={d} value={`${base}@${d}`} /> : null;
          })}
        </datalist>
      </div>

      {/* Teléfono con prefijo fijo */}
      <div className="mb-3">
        <label className="form-label" htmlFor="reg-tel">Teléfono</label>
        <div className="input-group">
          <span className="input-group-text" style={{ background: "var(--rosa-suave)", borderColor: "var(--rosa-claro)", color: "var(--rosa)", fontWeight: 600 }}>
            +569
          </span>
          <input
            id="reg-tel"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className="form-control"
            value={campos.telefono}
            onChange={(e) => cambiarTel(e.target.value)}
            placeholder="12345678"
            maxLength={8}
          />
        </div>
        <small className="text-muted">Ingresa los 8 dígitos de tu celular</small>
      </div>

      {/* Contraseña */}
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

      <button type="submit" className="btn btn-rosa w-100" disabled={cargando}>
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
