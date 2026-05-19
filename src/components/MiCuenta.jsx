/* ===========================================================
   MiCuenta.jsx - Panel del usuario autenticado
   Tabs: Mi perfil | Mis reservas
   =========================================================== */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { updatePerfil } from "../lib/auth.js";
import { formatoCLP } from "../data/data.js";

const MESES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function fmtFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
}

const BADGE_ESTADO = {
  pendiente:   { cls: "badge-estado-pendiente",   label: "Pendiente" },
  confirmada:  { cls: "badge-estado-confirmada",  label: "Confirmada" },
  completada:  { cls: "badge-estado-completada",  label: "Completada" },
  cancelada:   { cls: "badge-estado-cancelada",   label: "Cancelada" },
  no_asistio:  { cls: "badge-estado-cancelada",   label: "No asistió" },
};

function MiCuenta({ perfil, authUser, onPerfilUpdate, navegar }) {
  const [tab, setTab] = useState("reservas");

  const tabs = [
    { id: "reservas", label: "Mis reservas",  icono: "bi-calendar-check" },
    { id: "perfil",   label: "Mi perfil",     icono: "bi-person-circle" },
  ];

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        {/* Encabezado */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="cuenta-avatar" aria-hidden="true">
            {(perfil?.nombre?.[0] || "U")}
            {(perfil?.apellido?.[0] || "")}
          </div>
          <div>
            <h2 className="seccion-titulo mb-0" style={{ fontSize: "1.5rem" }}>
              Hola, {perfil?.nombre || "usuaria"}
            </h2>
            <p className="text-muted mb-0 small">{authUser?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={"auth-tab" + (tab === t.id ? " activo" : "")}
              onClick={() => setTab(t.id)}
            >
              <i className={"bi " + t.icono + " me-1"} aria-hidden="true"></i>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "reservas" && (
          <MisReservas userId={authUser?.id} navegar={navegar} />
        )}
        {tab === "perfil" && (
          <MiPerfil
            perfil={perfil}
            userId={authUser?.id}
            onActualizar={onPerfilUpdate}
          />
        )}
      </section>
    </div>
  );
}

/* ── MIS RESERVAS ─────────────────────────────────────────── */
function MisReservas({ userId, navegar }) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    cargar();
  }, [userId]);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase
      .from("reservas")
      .select(`
        id, codigo, estado, fecha, hora,
        total_precio, descuento_monto, total_duracion,
        cupon_codigo, creado_en,
        profesionales(nombre),
        reserva_servicios(nombre_snap, precio_snap)
      `)
      .eq("usuario_id", userId)
      .order("fecha", { ascending: false });
    setReservas(data || []);
    setCargando(false);
  }

  async function cancelar(id) {
    setCancelando(id);
    await supabase
      .from("reservas")
      .update({ estado: "cancelada", cancelado_en: new Date().toISOString() })
      .eq("id", id);
    await cargar();
    setCancelando(null);
  }

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "var(--rosa)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className="servicios-vacio">
        <i className="bi bi-calendar-x" aria-hidden="true"></i>
        <p>Aún no tienes reservas.</p>
        <button className="btn btn-rosa mt-3" onClick={() => navegar("reservar")}>
          Reservar mi primera cita
        </button>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {reservas.map((r) => {
        const badge = BADGE_ESTADO[r.estado] || BADGE_ESTADO.pendiente;
        const totalFinal = r.total_precio - (r.descuento_monto || 0);
        const puedeCancelar = ["pendiente", "confirmada"].includes(r.estado);

        return (
          <div className="col-12" key={r.id}>
            <div className="reserva-card-cuenta">
              <div className="reserva-card-header">
                <div>
                  <span className="reserva-codigo">{r.codigo}</span>
                  <span className={`badge-estado ${badge.cls} ms-2`}>
                    {badge.label}
                  </span>
                </div>
                <span className="text-muted small">
                  {fmtFecha(r.fecha)} · {r.hora?.slice(0, 5)} hrs
                </span>
              </div>

              <div className="reserva-card-body">
                <div>
                  <p className="mb-1 small">
                    <i className="bi bi-person me-1 text-muted" aria-hidden="true"></i>
                    {r.profesionales?.nombre || "—"}
                  </p>
                  <p className="mb-0 small text-muted">
                    {r.reserva_servicios?.map((s) => s.nombre_snap).join(", ")}
                  </p>
                </div>
                <div className="text-end">
                  <p
                    className="mb-0 fw-bold"
                    style={{ color: "var(--rosa)", fontSize: "1.1rem" }}
                  >
                    {formatoCLP(totalFinal)}
                  </p>
                  <small className="text-muted">{r.total_duracion} min</small>
                </div>
              </div>

              {puedeCancelar && (
                <div className="reserva-card-footer">
                  <button
                    className="btn btn-outline-rosa btn-sm"
                    onClick={() => cancelar(r.id)}
                    disabled={cancelando === r.id}
                  >
                    {cancelando === r.id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                        Cancelando…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle me-1" aria-hidden="true"></i>
                        Cancelar reserva
                      </>
                    )}
                  </button>
                  <small className="text-muted">
                    Cancela con al menos 24 hrs de anticipación
                  </small>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── MI PERFIL ────────────────────────────────────────────── */
function MiPerfil({ perfil, userId, onActualizar }) {
  const [editando, setEditando] = useState(false);
  const [campos, setCampos] = useState({
    nombre:   perfil?.nombre   || "",
    apellido: perfil?.apellido || "",
    telefono: perfil?.telefono || "",
  });
  const [error, setError]   = useState("");
  const [exito, setExito]   = useState(false);
  const [cargando, setCargando] = useState(false);

  function cambiar(k, v) {
    setCampos((p) => ({ ...p, [k]: v }));
    setError("");
    setExito(false);
  }

  async function guardar(e) {
    e.preventDefault();
    if (!campos.nombre.trim() || !campos.apellido.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }
    setCargando(true);
    const res = await updatePerfil(userId, {
      nombre:   campos.nombre.trim(),
      apellido: campos.apellido.trim(),
      telefono: campos.telefono.trim() || null,
    });
    setCargando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setExito(true);
    setEditando(false);
    onActualizar?.({ ...perfil, ...campos });
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <div className="auth-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Información personal</h5>
            {!editando && (
              <button
                className="btn btn-outline-rosa btn-sm"
                onClick={() => { setEditando(true); setExito(false); }}
              >
                <i className="bi bi-pencil me-1" aria-hidden="true"></i>
                Editar
              </button>
            )}
          </div>

          {exito && (
            <div className="alerta-exito mb-4">
              <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
              Perfil actualizado correctamente.
            </div>
          )}

          {!editando ? (
            <dl className="perfil-dl">
              <dt>Nombre</dt>
              <dd>{perfil?.nombre} {perfil?.apellido}</dd>
              <dt>Teléfono</dt>
              <dd>{perfil?.telefono || <span className="text-muted">No registrado</span>}</dd>
            </dl>
          ) : (
            <form onSubmit={guardar} noValidate>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="p-nombre">Nombre</label>
                  <input
                    id="p-nombre"
                    type="text"
                    className="form-control"
                    value={campos.nombre}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="p-apellido">Apellido</label>
                  <input
                    id="p-apellido"
                    type="text"
                    className="form-control"
                    value={campos.apellido}
                    onChange={(e) => cambiar("apellido", e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="p-tel">Teléfono</label>
                <input
                  id="p-tel"
                  type="tel"
                  className="form-control"
                  value={campos.telefono}
                  onChange={(e) => cambiar("telefono", e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              {error && (
                <div className="alerta-error mb-3">
                  <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
                  {error}
                </div>
              )}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-rosa" disabled={cargando}>
                  {cargando ? "Guardando…" : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-rosa"
                  onClick={() => { setEditando(false); setError(""); }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiCuenta;
