/* ===========================================================
   Admin.jsx - Panel de administración
   Secciones: Dashboard | Reservas | Servicios | Profesionales
              | Clientes | Cupones
   =========================================================== */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { formatoCLP } from "../data/data.js";
import { subirServicio, urlServicio, eliminarServicio } from "../lib/supabaseStorage.js";

/* ── Helpers ────────────────────────────────────────────── */
const MESES_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fmtFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTs(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
}

const BADGE_ESTADO = {
  pendiente:  { cls: "badge-estado-pendiente",  label: "Pendiente" },
  confirmada: { cls: "badge-estado-confirmada", label: "Confirmada" },
  completada: { cls: "badge-estado-completada", label: "Completada" },
  cancelada:  { cls: "badge-estado-cancelada",  label: "Cancelada" },
  no_asistio: { cls: "badge-estado-cancelada",  label: "No asistió" },
};

const SECCIONES_ADMIN = [
  { id: "dashboard",      label: "Dashboard",      icono: "bi-grid-1x2" },
  { id: "reservas",       label: "Reservas",       icono: "bi-calendar-week" },
  { id: "servicios",      label: "Servicios",       icono: "bi-scissors" },
  { id: "profesionales",  label: "Profesionales",  icono: "bi-people" },
  { id: "clientes",       label: "Clientes",       icono: "bi-person-lines-fill" },
  { id: "cupones",        label: "Cupones",        icono: "bi-ticket-perforated" },
];

/* ── ROOT ────────────────────────────────────────────────── */
function Admin({ perfil }) {
  const [seccion, setSeccion] = useState("dashboard");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const seccionActual = SECCIONES_ADMIN.find((s) => s.id === seccion);

  return (
    <div className="fade-in">
      <div className="admin-layout container">

        {/* Sidebar */}
        <aside className={`admin-sidebar${menuAbierto ? " abierto" : ""}`}>
          <div className="admin-sidebar-header">
            <span className="admin-brand">
              <i className="bi bi-shield-check me-2" aria-hidden="true"></i>
              Admin
            </span>
            <button
              className="admin-sidebar-close d-lg-none"
              onClick={() => setMenuAbierto(false)}
              aria-label="Cerrar menú"
            >
              <i className="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <nav>
            {SECCIONES_ADMIN.map((s) => (
              <button
                key={s.id}
                className={`admin-nav-item${seccion === s.id ? " activo" : ""}`}
                onClick={() => { setSeccion(s.id); setMenuAbierto(false); }}
                aria-current={seccion === s.id ? "page" : undefined}
              >
                <i className={"bi " + s.icono} aria-hidden="true"></i>
                {s.label}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <small className="text-muted">
              {perfil?.nombre} {perfil?.apellido}
            </small>
          </div>
        </aside>

        {/* Overlay móvil */}
        {menuAbierto && (
          <div
            className="admin-overlay d-lg-none"
            onClick={() => setMenuAbierto(false)}
          />
        )}

        {/* Contenido */}
        <main className="admin-main">
          <div className="admin-topbar d-lg-none">
            <button
              className="btn btn-outline-rosa btn-sm"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú admin"
            >
              <i className="bi bi-list" aria-hidden="true"></i>
            </button>
            <span className="fw-bold" style={{ color: "var(--rosa)" }}>
              {seccionActual?.label}
            </span>
          </div>

          {seccion === "dashboard"     && <AdminDashboard />}
          {seccion === "reservas"      && <AdminReservas />}
          {seccion === "servicios"     && <AdminServicios />}
          {seccion === "profesionales" && <AdminProfesionales />}
          {seccion === "clientes"      && <AdminClientes />}
          {seccion === "cupones"       && <AdminCupones />}
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const [{ data: kpiData }, { data: rec }] = await Promise.all([
        supabase.rpc("fn_dashboard_kpis"),
        supabase
          .from("reservas")
          .select("codigo, estado, fecha, hora, cliente_nombre, total_precio, descuento_monto, profesionales(nombre)")
          .order("creado_en", { ascending: false })
          .limit(6),
      ]);
      setKpis(kpiData);
      setRecientes(rec || []);
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) return <Cargando />;

  const stats = [
    { label: "Clientes",          valor: kpis?.total_clientes ?? 0,      icono: "bi-people",          color: "var(--rosa)" },
    { label: "Reservas hoy",      valor: kpis?.reservas_hoy ?? 0,        icono: "bi-calendar-day",    color: "var(--dorado)" },
    { label: "Pendientes",        valor: kpis?.reservas_pendientes ?? 0, icono: "bi-hourglass-split",  color: "#e07b00" },
    { label: "Ingresos del mes",  valor: formatoCLP(kpis?.ingresos_mes ?? 0), icono: "bi-cash-stack", color: "var(--exito)" },
  ];

  return (
    <div>
      <h3 className="admin-seccion-titulo">Dashboard</h3>

      {/* KPIs */}
      <div className="admin-kpis">
        {stats.map((s, i) => (
          <div className="admin-stat-card" key={i}>
            <div className="admin-stat-icono" style={{ color: s.color }}>
              <i className={"bi " + s.icono} aria-hidden="true"></i>
            </div>
            <div>
              <div className="admin-stat-valor" style={{ color: s.color }}>
                {s.valor}
              </div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {kpis?.servicio_top && (
        <div className="alerta-info mb-4">
          <i className="bi bi-trophy me-2" aria-hidden="true"></i>
          Servicio más reservado: <strong>{kpis.servicio_top}</strong>
        </div>
      )}

      {/* Reservas recientes */}
      <h5 className="mb-3">Reservas recientes</h5>
      <div className="tabla-admin-wrapper">
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Profesional</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {recientes.map((r) => {
              const badge = BADGE_ESTADO[r.estado] || BADGE_ESTADO.pendiente;
              return (
                <tr key={r.codigo}>
                  <td><code>{r.codigo}</code></td>
                  <td>{r.cliente_nombre}</td>
                  <td>{r.profesionales?.nombre || "—"}</td>
                  <td>{fmtFecha(r.fecha)}</td>
                  <td>{formatoCLP(r.total_precio - (r.descuento_monto || 0))}</td>
                  <td><span className={`badge-estado ${badge.cls}`}>{badge.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RESERVAS
══════════════════════════════════════════════════════════ */
function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [detalle, setDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    let q = supabase
      .from("reservas")
      .select(`
        id, codigo, estado, fecha, hora,
        total_precio, descuento_monto, total_duracion,
        cliente_nombre, cliente_correo, cliente_telefono,
        cupon_codigo, notas_cliente, notas_admin, motivo_cancelacion,
        creado_en, cancelado_en,
        profesionales(nombre),
        reserva_servicios(nombre_snap, precio_snap, duracion_snap)
      `)
      .order("fecha", { ascending: false });

    if (filtro !== "todas") q = q.eq("estado", filtro);
    const { data } = await q;
    setReservas(data || []);
    setCargando(false);
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  async function cambiarEstado(id, nuevoEstado, extras = {}) {
    setGuardando(true);
    await supabase
      .from("reservas")
      .update({
        estado: nuevoEstado,
        ...(nuevoEstado === "cancelada" ? { cancelado_en: new Date().toISOString() } : {}),
        ...extras,
      })
      .eq("id", id);
    setDetalle(null);
    await cargar();
    setGuardando(false);
  }

  const FILTROS = [
    { id: "todas",     label: "Todas" },
    { id: "pendiente", label: "Pendientes" },
    { id: "confirmada",label: "Confirmadas" },
    { id: "completada",label: "Completadas" },
    { id: "cancelada", label: "Canceladas" },
  ];

  return (
    <div>
      <h3 className="admin-seccion-titulo">Reservas</h3>

      <div className="chips-categoria mb-4">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={"chip-categoria" + (filtro === f.id ? " activo" : "")}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cargando ? <Cargando /> : (
        <>
          <div className="tabla-admin-wrapper">
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Profesional</th>
                  <th>Fecha · Hora</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">Sin reservas</td></tr>
                ) : reservas.map((r) => {
                  const badge = BADGE_ESTADO[r.estado] || BADGE_ESTADO.pendiente;
                  return (
                    <tr key={r.id}>
                      <td><code>{r.codigo}</code></td>
                      <td>
                        <div>{r.cliente_nombre}</div>
                        <small className="text-muted">{r.cliente_correo}</small>
                      </td>
                      <td>{r.profesionales?.nombre || "—"}</td>
                      <td>{fmtFecha(r.fecha)}<br /><small>{r.hora?.slice(0,5)} hrs</small></td>
                      <td>{formatoCLP(r.total_precio - (r.descuento_monto || 0))}</td>
                      <td><span className={`badge-estado ${badge.cls}`}>{badge.label}</span></td>
                      <td>
                        <button
                          className="btn btn-outline-rosa btn-sm"
                          onClick={() => setDetalle(r)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal detalle */}
          {detalle && (
            <ModalDetalle
              reserva={detalle}
              onCambiarEstado={cambiarEstado}
              onCerrar={() => setDetalle(null)}
              guardando={guardando}
            />
          )}
        </>
      )}
    </div>
  );
}

function ModalDetalle({ reserva: r, onCambiarEstado, onCerrar, guardando }) {
  const [nota, setNota] = useState(r.notas_admin || "");
  const badge = BADGE_ESTADO[r.estado] || BADGE_ESTADO.pendiente;

  const ACCIONES = {
    pendiente:  [{ estado: "confirmada", label: "Confirmar", cls: "btn-rosa" },
                 { estado: "cancelada",  label: "Cancelar",  cls: "btn-outline-rosa" }],
    confirmada: [{ estado: "completada", label: "Marcar completada", cls: "btn-rosa" },
                 { estado: "cancelada",  label: "Cancelar",          cls: "btn-outline-rosa" }],
    completada: [],
    cancelada:  [],
    no_asistio: [],
  };

  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <code className="reserva-codigo">{r.codigo}</code>
            <span className={`badge-estado ${badge.cls} ms-2`}>{badge.label}</span>
          </div>
          <button className="btn-close" onClick={onCerrar} aria-label="Cerrar"></button>
        </div>

        <div className="admin-modal-body">
          <div className="row g-3 mb-3">
            <div className="col-6">
              <strong>Cliente</strong>
              <p className="mb-0">{r.cliente_nombre}</p>
              <small className="text-muted">{r.cliente_correo}</small>
              {r.cliente_telefono && <><br /><small className="text-muted">{r.cliente_telefono}</small></>}
            </div>
            <div className="col-6">
              <strong>Cita</strong>
              <p className="mb-0">{fmtFecha(r.fecha)} · {r.hora?.slice(0,5)} hrs</p>
              <small className="text-muted">{r.profesionales?.nombre} · {r.total_duracion} min</small>
            </div>
          </div>

          <strong>Servicios</strong>
          <ul className="list-unstyled mb-3">
            {r.reserva_servicios?.map((s, i) => (
              <li key={i} className="d-flex justify-content-between">
                <span>{s.nombre_snap}</span>
                <span className="text-muted">{formatoCLP(s.precio_snap)}</span>
              </li>
            ))}
            <li className="d-flex justify-content-between fw-bold" style={{ borderTop: "1px solid var(--rosa-claro)", paddingTop: 6, marginTop: 6 }}>
              <span>Total</span>
              <span style={{ color: "var(--rosa)" }}>{formatoCLP(r.total_precio - (r.descuento_monto || 0))}</span>
            </li>
          </ul>

          {r.notas_cliente && (
            <div className="alerta-info mb-3">
              <strong>Nota del cliente:</strong> {r.notas_cliente}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label" htmlFor="nota-admin">Nota interna</label>
            <textarea
              id="nota-admin"
              className="form-control"
              rows={2}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Solo visible para el admin…"
            />
          </div>
        </div>

        <div className="admin-modal-footer">
          {(ACCIONES[r.estado] || []).map((acc) => (
            <button
              key={acc.estado}
              className={`btn ${acc.cls} btn-sm`}
              disabled={guardando}
              onClick={() => onCambiarEstado(r.id, acc.estado, { notas_admin: nota })}
            >
              {guardando ? "Guardando…" : acc.label}
            </button>
          ))}
          <button className="btn btn-outline-rosa btn-sm" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICIOS
══════════════════════════════════════════════════════════ */
const CATEGORIAS = ["Cabello", "Facial", "Uñas", "Depilación", "Maquillaje", "Bienestar"];
const SERVICIO_VACIO = {
  nombre: "", categoria: "Cabello", descripcion: "",
  precio: "", duracion_min: "", unidad: "servicio",
  destacado: false, activo: true, imagen_posicion: "center",
};

function AdminServicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorSubida, setErrorSubida] = useState(null);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase
      .from("servicios")
      .select("*")
      .order("categoria")
      .order("nombre");
    setServicios(data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(id, campos, imagenFile) {
    setGuardando(true);
    setErrorSubida(null);
    let imagenPath = campos.imagen_path || null;

    if (imagenFile) {
      try {
        imagenPath = await subirServicio(imagenFile);
        // Si se reemplaza imagen existente, borrar la anterior
        if (id && campos.imagen_path && campos.imagen_path !== imagenPath) {
          await eliminarServicio(campos.imagen_path);
        }
      } catch (err) {
        setErrorSubida("Error al subir la imagen: " + err.message);
        setGuardando(false);
        return;
      }
    }

    const payload = {
      ...campos,
      precio: parseInt(campos.precio) || 0,
      duracion_min: parseInt(campos.duracion_min) || 0,
      imagen_path: imagenPath,
    };

    if (id) {
      await supabase.from("servicios").update(payload).eq("id", id);
    } else {
      await supabase.from("servicios").insert(payload);
    }
    setEditando(null);
    setNuevo(false);
    await cargar();
    setGuardando(false);
  }

  async function toggleActivo(id, activo) {
    await supabase.from("servicios").update({ activo }).eq("id", id);
    setServicios((prev) => prev.map((s) => s.id === id ? { ...s, activo } : s));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="admin-seccion-titulo mb-0">Servicios</h3>
        <button className="btn btn-rosa btn-sm" onClick={() => setNuevo(true)}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
          Nuevo servicio
        </button>
      </div>

      {errorSubida && (
        <div className="alerta-error mb-3">{errorSubida}</div>
      )}

      {cargando ? <Cargando /> : (
        <div className="tabla-admin-wrapper">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Destacado</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} style={{ opacity: s.activo ? 1 : 0.5 }}>
                  <td>
                    {s.imagen_path
                      ? <img src={urlServicio(s.imagen_path)} alt={s.nombre}
                          style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6 }} />
                      : <span className="text-muted" style={{ fontSize: 11 }}>sin imagen</span>
                    }
                  </td>
                  <td>{s.nombre}</td>
                  <td><span className="badge-categoria">{s.categoria}</span></td>
                  <td>{formatoCLP(s.precio)}</td>
                  <td>{s.duracion_min} min</td>
                  <td>
                    {s.destacado
                      ? <i className="bi bi-star-fill" style={{ color: "var(--dorado)" }} aria-hidden="true"></i>
                      : <i className="bi bi-star text-muted" aria-hidden="true"></i>}
                  </td>
                  <td>
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={s.activo}
                        onChange={(e) => toggleActivo(s.id, e.target.checked)}
                        aria-label={`Servicio ${s.nombre} ${s.activo ? "activo" : "inactivo"}`}
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-rosa btn-sm"
                      onClick={() => setEditando({ ...s })}
                    >
                      <i className="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editando || nuevo) && (
        <ModalEditarServicio
          servicio={editando || SERVICIO_VACIO}
          onGuardar={guardar}
          onCerrar={() => { setEditando(null); setNuevo(false); }}
          guardando={guardando}
          esNuevo={nuevo}
        />
      )}
    </div>
  );
}

function ModalEditarServicio({ servicio, onGuardar, onCerrar, guardando, esNuevo }) {
  const [campos, setCampos] = useState({
    nombre:          servicio.nombre          || "",
    categoria:       servicio.categoria       || "Cabello",
    precio:          servicio.precio          || "",
    duracion_min:    servicio.duracion_min    || "",
    unidad:          servicio.unidad          || "servicio",
    descripcion:     servicio.descripcion     || "",
    destacado:       servicio.destacado       || false,
    activo:          servicio.activo          ?? true,
    imagen_path:     servicio.imagen_path     || null,
    imagen_posicion: servicio.imagen_posicion || "center",
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState(
    servicio.imagen_path ? urlServicio(servicio.imagen_path) : null
  );

  function cambiar(k, v) { setCampos((p) => ({ ...p, [k]: v })); }

  function handleImagen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <strong>{esNuevo ? "Nuevo servicio" : "Editar servicio"}</strong>
          <button className="btn-close" onClick={onCerrar} aria-label="Cerrar"></button>
        </div>
        <div className="admin-modal-body">
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={campos.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)} />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={campos.categoria}
                onChange={(e) => cambiar("categoria", e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Unidad</label>
              <select className="form-select" value={campos.unidad}
                onChange={(e) => cambiar("unidad", e.target.value)}>
                <option value="servicio">Servicio</option>
                <option value="sesión">Sesión</option>
                <option value="hora">Hora</option>
              </select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label">Precio (CLP)</label>
              <input className="form-control" type="number" min={1} value={campos.precio}
                onChange={(e) => cambiar("precio", e.target.value)} />
            </div>
            <div className="col-6">
              <label className="form-label">Duración (min)</label>
              <input className="form-control" type="number" min={1} value={campos.duracion_min}
                onChange={(e) => cambiar("duracion_min", e.target.value)} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" rows={3} value={campos.descripcion}
              onChange={(e) => cambiar("descripcion", e.target.value)} />
          </div>

          {/* Imagen */}
          <div className="mb-3">
            <label className="form-label">Imagen del servicio</label>
            <div className="d-flex align-items-center gap-3">
              {preview && (
                <img src={preview} alt="Vista previa"
                  style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--rosa-claro)" }} />
              )}
              <div>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  onChange={handleImagen}
                />
                <small className="text-muted">webp, jpg o png · máx 2 MB recomendado</small>
              </div>
            </div>
            <div className="mt-2">
              <label className="form-label">Encuadre de imagen</label>
              <select className="form-select form-select-sm" value={campos.imagen_posicion}
                onChange={(e) => cambiar("imagen_posicion", e.target.value)}>
                <option value="center">Centro (por defecto)</option>
                <option value="top">Arriba</option>
                <option value="bottom">Abajo</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
                <option value="50% 20%">Alto superior (caras)</option>
              </select>
            </div>
          </div>

          <div className="d-flex gap-4">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="mod-destacado"
                checked={campos.destacado}
                onChange={(e) => cambiar("destacado", e.target.checked)} />
              <label className="form-check-label" htmlFor="mod-destacado">Destacado</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="mod-activo"
                checked={campos.activo}
                onChange={(e) => cambiar("activo", e.target.checked)} />
              <label className="form-check-label" htmlFor="mod-activo">Activo</label>
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-rosa btn-sm" disabled={guardando}
            onClick={() => onGuardar(esNuevo ? null : servicio.id, campos, imagenFile)}>
            {guardando ? "Subiendo…" : (esNuevo ? "Crear" : "Guardar")}
          </button>
          <button className="btn btn-outline-rosa btn-sm" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROFESIONALES
══════════════════════════════════════════════════════════ */
function AdminProfesionales() {
  const [profs, setProfs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase.from("profesionales").select("*").order("nombre");
    setProfs(data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(id, campos) {
    setGuardando(true);
    if (id) {
      await supabase.from("profesionales").update(campos).eq("id", id);
    } else {
      await supabase.from("profesionales").insert(campos);
    }
    setEditando(null);
    setNuevo(false);
    await cargar();
    setGuardando(false);
  }

  async function toggleActivo(id, activo) {
    await supabase.from("profesionales").update({ activo }).eq("id", id);
    setProfs((p) => p.map((x) => x.id === id ? { ...x, activo } : x));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="admin-seccion-titulo mb-0">Profesionales</h3>
        <button className="btn btn-rosa btn-sm" onClick={() => setNuevo(true)}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
          Nueva profesional
        </button>
      </div>

      {cargando ? <Cargando /> : (
        <div className="row g-3">
          {profs.map((p) => (
            <div className="col-md-4" key={p.id}>
              <div className="profesional-card" style={{ opacity: p.activo ? 1 : 0.5 }}>
                <div className="profesional-avatar" aria-hidden="true">{p.iniciales}</div>
                <h5 className="mb-1">{p.nombre}</h5>
                <small className="text-muted d-block mb-3">{p.especialidad}</small>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-outline-rosa btn-sm"
                    onClick={() => setEditando({ ...p })}>
                    <i className="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <div className="form-check form-switch mb-0 d-flex align-items-center">
                    <input className="form-check-input" type="checkbox" role="switch"
                      checked={p.activo}
                      onChange={(e) => toggleActivo(p.id, e.target.checked)}
                      aria-label={p.activo ? "Desactivar" : "Activar"} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editando || nuevo) && (
        <ModalEditarProf
          prof={editando || { nombre: "", iniciales: "", especialidad: "", activo: true }}
          onGuardar={guardar}
          onCerrar={() => { setEditando(null); setNuevo(false); }}
          guardando={guardando}
          esNuevo={nuevo}
        />
      )}
    </div>
  );
}

function ModalEditarProf({ prof, onGuardar, onCerrar, guardando, esNuevo }) {
  const [campos, setCampos] = useState({
    nombre:      prof.nombre,
    iniciales:   prof.iniciales,
    especialidad: prof.especialidad,
    activo:      prof.activo,
  });

  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <strong>{esNuevo ? "Nueva profesional" : "Editar profesional"}</strong>
          <button className="btn-close" onClick={onCerrar} aria-label="Cerrar"></button>
        </div>
        <div className="admin-modal-body">
          <div className="mb-3">
            <label className="form-label">Nombre completo</label>
            <input className="form-control" value={campos.nombre}
              onChange={(e) => setCampos((p) => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Iniciales (1-3 letras)</label>
            <input className="form-control" maxLength={3} value={campos.iniciales}
              onChange={(e) => setCampos((p) => ({ ...p, iniciales: e.target.value.toUpperCase() }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Especialidad</label>
            <input className="form-control" value={campos.especialidad}
              onChange={(e) => setCampos((p) => ({ ...p, especialidad: e.target.value }))} />
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="prof-activo"
              checked={campos.activo}
              onChange={(e) => setCampos((p) => ({ ...p, activo: e.target.checked }))} />
            <label className="form-check-label" htmlFor="prof-activo">Activa</label>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-rosa btn-sm" disabled={guardando}
            onClick={() => onGuardar(esNuevo ? null : prof.id, campos)}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
          <button className="btn btn-outline-rosa btn-sm" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CLIENTES
══════════════════════════════════════════════════════════ */
function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  async function cargar() {
    setCargando(true);
    const { data } = await supabase
      .from("v_clientes_admin")
      .select("*")
      .order("creado_en", { ascending: false });
    setClientes(data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function toggleBan(id, activo) {
    await supabase.from("perfiles").update({ activo }).eq("id", id);
    setClientes((prev) => prev.map((c) => c.id === id ? { ...c, activo } : c));
  }

  const filtrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    return !q || c.email?.includes(q) || c.nombre?.toLowerCase().includes(q) || c.apellido?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h3 className="admin-seccion-titulo">Clientes</h3>

      <div className="mb-4">
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por nombre o correo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? <Cargando /> : (
        <div className="tabla-admin-wrapper">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Reservas</th>
                <th>Gasto total</th>
                <th>Últ. reserva</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin resultados</td></tr>
              ) : filtrados.map((c) => (
                <tr key={c.id} style={{ opacity: c.activo ? 1 : 0.5 }}>
                  <td>
                    <div>{c.nombre} {c.apellido}</div>
                    <small className="text-muted">{c.email}</small>
                  </td>
                  <td>{c.telefono || "—"}</td>
                  <td>{c.total_reservas}</td>
                  <td>{formatoCLP(c.gasto_total)}</td>
                  <td>{c.ultima_reserva ? fmtFecha(c.ultima_reserva) : "—"}</td>
                  <td>
                    <span className={`badge-estado ${c.activo ? "badge-estado-confirmada" : "badge-estado-cancelada"}`}>
                      {c.activo ? "Activo" : "Baneado"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-rosa btn-sm"
                      onClick={() => toggleBan(c.id, !c.activo)}
                    >
                      {c.activo ? "Banear" : "Desbanear"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CUPONES
══════════════════════════════════════════════════════════ */
function AdminCupones() {
  const [cupones, setCupones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevo, setNuevo] = useState({
    codigo: "", tipo: "porcentaje", valor: "", min_reserva: 0,
    max_usos: "", activo: true, valido_desde: "", valido_hasta: "",
  });
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    const { data } = await supabase
      .from("cupones")
      .select("*")
      .order("creado_en", { ascending: false });
    setCupones(data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function toggleActivo(id, activo) {
    await supabase.from("cupones").update({ activo }).eq("id", id);
    setCupones((p) => p.map((c) => c.id === id ? { ...c, activo } : c));
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este cupón?")) return;
    await supabase.from("cupones").delete().eq("id", id);
    await cargar();
  }

  async function crear(e) {
    e.preventDefault();
    if (!nuevo.codigo || !nuevo.valor) {
      setError("Código y valor son obligatorios.");
      return;
    }
    setGuardando(true);
    const payload = {
      codigo:       nuevo.codigo.toUpperCase(),
      tipo:         nuevo.tipo,
      valor:        parseInt(nuevo.valor),
      min_reserva:  parseInt(nuevo.min_reserva) || 0,
      max_usos:     nuevo.max_usos ? parseInt(nuevo.max_usos) : null,
      activo:       nuevo.activo,
      valido_desde: nuevo.valido_desde || null,
      valido_hasta: nuevo.valido_hasta || null,
    };
    const { error: err } = await supabase.from("cupones").insert(payload);
    setGuardando(false);
    if (err) {
      setError(err.message.includes("unique") ? "Ya existe un cupón con ese código." : err.message);
      return;
    }
    setCreando(false);
    setNuevo({ codigo: "", tipo: "porcentaje", valor: "", min_reserva: 0, max_usos: "", activo: true, valido_desde: "", valido_hasta: "" });
    setError("");
    await cargar();
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="admin-seccion-titulo mb-0">Cupones de descuento</h3>
        <button className="btn btn-rosa btn-sm" onClick={() => setCreando(!creando)}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
          Nuevo cupón
        </button>
      </div>

      {/* Formulario nuevo cupón */}
      {creando && (
        <div className="auth-card mb-4">
          <h5 className="mb-3">Crear cupón</h5>
          <form onSubmit={crear} noValidate>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Código</label>
                <input className="form-control" placeholder="VERANO20"
                  value={nuevo.codigo}
                  onChange={(e) => setNuevo((p) => ({ ...p, codigo: e.target.value.toUpperCase() }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={nuevo.tipo}
                  onChange={(e) => setNuevo((p) => ({ ...p, tipo: e.target.value }))}>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto_fijo">Monto fijo (CLP)</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Valor {nuevo.tipo === "porcentaje" ? "(%)" : "(CLP)"}
                </label>
                <input className="form-control" type="number" min={1}
                  value={nuevo.valor}
                  onChange={(e) => setNuevo((p) => ({ ...p, valor: e.target.value }))} />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Mínimo reserva (CLP)</label>
                <input className="form-control" type="number" min={0}
                  value={nuevo.min_reserva}
                  onChange={(e) => setNuevo((p) => ({ ...p, min_reserva: e.target.value }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Máx. usos (vacío = ilimitado)</label>
                <input className="form-control" type="number" min={1}
                  value={nuevo.max_usos}
                  onChange={(e) => setNuevo((p) => ({ ...p, max_usos: e.target.value }))} />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="cup-activo"
                    checked={nuevo.activo}
                    onChange={(e) => setNuevo((p) => ({ ...p, activo: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="cup-activo">Activo al crear</label>
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Válido desde</label>
                <input className="form-control" type="date"
                  value={nuevo.valido_desde}
                  onChange={(e) => setNuevo((p) => ({ ...p, valido_desde: e.target.value }))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Válido hasta</label>
                <input className="form-control" type="date"
                  value={nuevo.valido_hasta}
                  onChange={(e) => setNuevo((p) => ({ ...p, valido_hasta: e.target.value }))} />
              </div>
            </div>

            {error && (
              <div className="alerta-error mb-3">
                <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
                {error}
              </div>
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-rosa btn-sm" disabled={guardando}>
                {guardando ? "Guardando…" : "Crear cupón"}
              </button>
              <button type="button" className="btn btn-outline-rosa btn-sm"
                onClick={() => { setCreando(false); setError(""); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? <Cargando /> : (
        <div className="tabla-admin-wrapper">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Mín.</th>
                <th>Usos</th>
                <th>Vigencia</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cupones.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin cupones</td></tr>
              ) : cupones.map((c) => (
                <tr key={c.id} style={{ opacity: c.activo ? 1 : 0.5 }}>
                  <td><code>{c.codigo}</code></td>
                  <td>
                    {c.tipo === "porcentaje" ? `${c.valor}%` : formatoCLP(c.valor)}
                  </td>
                  <td>{c.min_reserva > 0 ? formatoCLP(c.min_reserva) : "—"}</td>
                  <td>{c.usos_actuales}{c.max_usos ? ` / ${c.max_usos}` : " / ∞"}</td>
                  <td>
                    {c.valido_desde || c.valido_hasta
                      ? `${c.valido_desde ? fmtFecha(c.valido_desde) : "—"} → ${c.valido_hasta ? fmtFecha(c.valido_hasta) : "—"}`
                      : "Sin límite"}
                  </td>
                  <td>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" role="switch"
                        checked={c.activo}
                        onChange={(e) => toggleActivo(c.id, e.target.checked)}
                        aria-label={c.activo ? "Desactivar" : "Activar"} />
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-outline-rosa btn-sm"
                      onClick={() => eliminar(c.id)}>
                      <i className="bi bi-trash" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Spinner ─────────────────────────────────────────────── */
function Cargando() {
  return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: "var(--rosa)" }} role="status">
        <span className="visually-hidden">Cargando…</span>
      </div>
    </div>
  );
}

export default Admin;
