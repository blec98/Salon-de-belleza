/* ===========================================================
   Reservar.jsx - Wizard de reserva de cita
   Servicio(s) → Profesional → Fecha → Hora → Datos → Confirmación
   Persiste en Supabase (requiere sesión iniciada)
   =========================================================== */

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase.js";
import {
  SERVICIOS,
  SLOTS_HORARIO,
  INFO_SALON,
  formatoCLP,
} from "../data/data.js";
import Stepper from "./ui/Stepper.jsx";

const DIAS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatearFecha(d) {
  if (!d) return "";
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function fechaISO(d) {
  return d.toISOString().slice(0, 10);
}

function generarCodigo() {
  const stamp = Date.now().toString(36).toUpperCase();
  return "BE-" + stamp.slice(-6);
}

function iniciales(nombre) {
  return (nombre || "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ── Guard: requiere sesión ─── */
function SinSesion({ navegar }) {
  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="servicios-vacio">
          <i className="bi bi-lock" aria-hidden="true"></i>
          <p>Debes iniciar sesión para reservar una cita.</p>
          <button className="btn btn-rosa mt-3" onClick={() => navegar("auth")}>
            Iniciar sesión
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Componente principal ─── */
function Reservar({ payload, navegar, authUser, perfil }) {
  const [paso, setPaso] = useState(0);
  const [servicioIds, setServicioIds] = useState(
    payload?.servicioId ? [payload.servicioId] : [null]
  );
  const [profesionalId, setProfesionalId] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [ocupados, setOcupados] = useState(new Set());
  const [datos, setDatos] = useState({
    nombre: perfil ? `${perfil.nombre || ""} ${perfil.apellido || ""}`.trim() : "",
    correo: authUser?.email || "",
    telefono: perfil?.telefono || "",
  });
  const [errores, setErrores] = useState({});
  const [confirmando, setConfirmando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [errorGuardar, setErrorGuardar] = useState("");

  // Cargar profesionales desde Supabase
  useEffect(() => {
    supabase
      .from("profesionales")
      .select("id, nombre, especialidad")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => setProfesionales(data || []));
  }, []);

  // Cargar slots ocupados cuando cambia fecha o profesional
  useEffect(() => {
    if (!fecha || !profesionalId) {
      setOcupados(new Set());
      return;
    }
    supabase
      .from("reservas")
      .select("hora")
      .eq("profesional_id", profesionalId)
      .eq("fecha", fechaISO(fecha))
      .in("estado", ["pendiente", "confirmada"])
      .then(({ data }) => {
        setOcupados(new Set((data || []).map((r) => r.hora.slice(0, 5))));
      });
  }, [fecha, profesionalId]);

  const serviciosSeleccionados = useMemo(
    () => servicioIds.map((id) => SERVICIOS.find((s) => s.id === id)).filter(Boolean),
    [servicioIds]
  );
  const totalPrecio = serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0);
  const totalDuracion = serviciosSeleccionados.reduce((sum, s) => sum + s.duracionMin, 0);

  const profesional = profesionales.find((p) => p.id === profesionalId);

  function validarDatos() {
    const e = {};
    if (!datos.nombre.trim()) e.nombre = "Ingresa tu nombre completo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo))
      e.correo = "Ingresa un correo válido.";
    if (!datos.telefono.trim()) {
      e.telefono = "Ingresa un teléfono.";
    } else if (!/^\+?5?6?\s?9?\s?\d{4}\s?\d{4}$/.test(datos.telefono.trim())) {
      e.telefono = "Formato: +56 9 1234 5678";
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function confirmarReserva() {
    setConfirmando(true);
    setErrorGuardar("");
    try {
      const codigo = generarCodigo();

      const { data: reserva, error: errReserva } = await supabase
        .from("reservas")
        .insert({
          usuario_id: authUser.id,
          profesional_id: profesionalId,
          fecha: fechaISO(fecha),
          hora: hora,
          total_precio: totalPrecio,
          total_duracion: totalDuracion,
          estado: "pendiente",
          codigo,
          cliente_nombre: datos.nombre.trim(),
          cliente_correo: datos.correo.trim(),
          cliente_telefono: datos.telefono.trim() || null,
        })
        .select()
        .single();

      if (errReserva) throw new Error(errReserva.message);

      const serviciosRows = serviciosSeleccionados.map((s) => ({
        reserva_id: reserva.id,
        servicio_id: s.id,
        nombre_snap: s.nombre,
        precio_snap: s.precio,
        duracion_snap: s.duracionMin,
      }));

      const { error: errServicios } = await supabase
        .from("reserva_servicios")
        .insert(serviciosRows);

      if (errServicios) throw new Error(errServicios.message);

      setReservaConfirmada({
        codigo,
        servicios: serviciosSeleccionados,
        totalPrecio,
        totalDuracion,
        profesionalNombre: profesional?.nombre,
        fechaTexto: formatearFecha(fecha),
        hora,
      });
      setPaso(5);
    } catch (err) {
      setErrorGuardar("No se pudo guardar la reserva. Intenta nuevamente.");
      console.error(err);
    } finally {
      setConfirmando(false);
    }
  }

  function reiniciar() {
    setPaso(0);
    setServicioIds([null]);
    setProfesionalId(null);
    setFecha(null);
    setHora(null);
    setReservaConfirmada(null);
    setErrores({});
    setErrorGuardar("");
  }

  if (!authUser) return <SinSesion navegar={navegar} />;

  if (reservaConfirmada) {
    return (
      <div className="fade-in" style={{ paddingTop: "90px" }}>
        <section className="seccion container">
          <div className="text-center mb-4">
            <h2 className="seccion-titulo">¡Reserva confirmada!</h2>
          </div>
          <div className="ticket-reserva">
            <i
              className="bi bi-check-circle-fill"
              style={{ fontSize: "3rem", color: "var(--exito)" }}
              aria-hidden="true"
            ></i>
            <p className="mt-2 mb-0 text-muted">Código de tu reserva</p>
            <div className="ticket-codigo">{reservaConfirmada.codigo}</div>

            <div className="ticket-detalle">
              <span className="etq">
                {reservaConfirmada.servicios.length > 1 ? "Servicios" : "Servicio"}
              </span>
              <span className="val">
                {reservaConfirmada.servicios.map((s) => s.nombre).join(", ")}
              </span>
            </div>
            <div className="ticket-detalle">
              <span className="etq">Profesional</span>
              <span className="val">{reservaConfirmada.profesionalNombre}</span>
            </div>
            <div className="ticket-detalle">
              <span className="etq">Fecha</span>
              <span className="val">{reservaConfirmada.fechaTexto}</span>
            </div>
            <div className="ticket-detalle">
              <span className="etq">Hora</span>
              <span className="val">{reservaConfirmada.hora} hrs</span>
            </div>
            <div className="ticket-detalle">
              <span className="etq">Duración total</span>
              <span className="val">{reservaConfirmada.totalDuracion} min</span>
            </div>
            <div className="ticket-detalle">
              <span className="etq">Total</span>
              <span className="val">{formatoCLP(reservaConfirmada.totalPrecio)}</span>
            </div>

            <p className="text-muted small mt-4 mb-0">
              Te esperamos en {INFO_SALON.direccion}. Guarda este código.
            </p>
            <div className="d-flex gap-2 mt-4 justify-content-center flex-wrap">
              <button className="btn btn-outline-rosa" onClick={reiniciar}>
                Nueva reserva
              </button>
              <button className="btn btn-rosa" onClick={() => navegar("mi-cuenta")}>
                Ver mis reservas
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Reserva tu cita</h2>
          <p className="text-muted mb-3">
            Elige servicio, profesional, fecha y hora en pocos pasos
          </p>
        </div>

        <Stepper
          pasos={["Servicio", "Profesional", "Fecha", "Hora", "Datos"]}
          pasoActivo={paso}
        />

        <div className="row justify-content-center">
          <div className="col-lg-9">
            {paso === 0 && (
              <PasoServicio
                servicioIds={servicioIds}
                onActualizar={setServicioIds}
                onContinuar={() => setPaso(1)}
              />
            )}
            {paso === 1 && (
              <PasoProfesional
                profesionales={profesionales}
                profesionalId={profesionalId}
                onSeleccionar={setProfesionalId}
                onAtras={() => setPaso(0)}
                onContinuar={() => setPaso(2)}
              />
            )}
            {paso === 2 && (
              <PasoFecha
                fecha={fecha}
                onSeleccionar={(f) => { setFecha(f); setHora(null); }}
                onAtras={() => setPaso(1)}
                onContinuar={() => setPaso(3)}
              />
            )}
            {paso === 3 && (
              <PasoHora
                hora={hora}
                ocupados={ocupados}
                onSeleccionar={setHora}
                onAtras={() => setPaso(2)}
                onContinuar={() => setPaso(4)}
              />
            )}
            {paso === 4 && (
              <PasoDatos
                datos={datos}
                onCambiar={(c, v) => setDatos((prev) => ({ ...prev, [c]: v }))}
                errores={errores}
                errorGuardar={errorGuardar}
                onAtras={() => setPaso(3)}
                onContinuar={() => { if (validarDatos()) confirmarReserva(); }}
                resumen={{
                  servicios: serviciosSeleccionados,
                  totalPrecio,
                  totalDuracion,
                  profesional: profesional?.nombre,
                  fecha: formatearFecha(fecha),
                  hora,
                }}
                confirmando={confirmando}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* PASO 0 — Servicios */
function PasoServicio({ servicioIds, onActualizar, onContinuar }) {
  function cambiarServicio(idx, val) {
    const nuevos = [...servicioIds];
    nuevos[idx] = val ? parseInt(val) : null;
    onActualizar(nuevos);
  }
  function agregarServicio() { onActualizar([...servicioIds, null]); }
  function quitarServicio(idx) {
    const nuevos = servicioIds.filter((_, i) => i !== idx);
    onActualizar(nuevos.length > 0 ? nuevos : [null]);
  }

  const todosSeleccionados = servicioIds.length > 0 && servicioIds.every((id) => id !== null);
  const totalPrecio = servicioIds
    .map((id) => SERVICIOS.find((s) => s.id === id)).filter(Boolean)
    .reduce((sum, s) => sum + s.precio, 0);
  const totalDuracion = servicioIds
    .map((id) => SERVICIOS.find((s) => s.id === id)).filter(Boolean)
    .reduce((sum, s) => sum + s.duracionMin, 0);

  return (
    <>
      <h4 className="mb-3">1. ¿Qué servicios quieres reservar?</h4>
      {servicioIds.map((id, idx) => (
        <div key={idx} className="mb-3">
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select"
              value={id || ""}
              onChange={(e) => cambiarServicio(idx, e.target.value)}
              aria-label={`Servicio ${idx + 1}`}
            >
              <option value="">Selecciona un servicio…</option>
              {SERVICIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {formatoCLP(s.precio)} ({s.duracionMin} min)
                </option>
              ))}
            </select>
            {servicioIds.length > 1 && (
              <button
                className="btn btn-outline-rosa btn-quitar-servicio"
                onClick={() => quitarServicio(idx)}
                aria-label="Quitar servicio"
                title="Quitar"
              >
                <i className="bi bi-trash" aria-hidden="true"></i>
              </button>
            )}
          </div>
          {id && (
            <div className="alerta-info mt-2 mb-0">
              <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
              {SERVICIOS.find((s) => s.id === id)?.descripcion}
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-outline-rosa btn-sm mb-4" onClick={agregarServicio}>
        <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
        Agregar otro servicio
      </button>

      {todosSeleccionados && servicioIds.length > 1 && (
        <div className="resumen-box mb-4">
          <small className="text-muted d-block mb-2">Resumen de servicios seleccionados</small>
          {servicioIds.map((id) => {
            const s = SERVICIOS.find((sv) => sv.id === id);
            return s ? (
              <div key={id} className="d-flex justify-content-between mb-1">
                <span>{s.nombre}</span>
                <span>{formatoCLP(s.precio)}</span>
              </div>
            ) : null;
          })}
          <hr className="my-2" />
          <div className="d-flex justify-content-between">
            <strong>Total</strong>
            <strong style={{ color: "var(--rosa)" }}>{formatoCLP(totalPrecio)}</strong>
          </div>
          <small className="text-muted">Duración estimada: {totalDuracion} min</small>
        </div>
      )}

      <div className="d-flex justify-content-end">
        <button className="btn btn-rosa" onClick={onContinuar} disabled={!todosSeleccionados}>
          Continuar
          <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 1 — Profesional */
function PasoProfesional({ profesionales, profesionalId, onSeleccionar, onAtras, onContinuar }) {
  if (profesionales.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "var(--rosa)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <h4 className="mb-3">2. Elige tu profesional</h4>
      <div className="row g-3 mb-4">
        {profesionales.map((p) => (
          <div className="col-md-4" key={p.id}>
            <button
              className={"profesional-card w-100 border-0" + (profesionalId === p.id ? " activo" : "")}
              onClick={() => onSeleccionar(p.id)}
              aria-pressed={profesionalId === p.id}
            >
              <div className="profesional-avatar" aria-hidden="true">{iniciales(p.nombre)}</div>
              <h5 className="mb-1">{p.nombre}</h5>
              <small className="text-muted">{p.especialidad}</small>
            </button>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-rosa" onClick={onAtras}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Atrás
        </button>
        <button className="btn btn-rosa" onClick={onContinuar} disabled={!profesionalId}>
          Continuar<i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 2 — Fecha */
function PasoFecha({ fecha, onSeleccionar, onAtras, onContinuar }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [mesActivo, setMesActivo] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );

  const diasMes = useMemo(() => {
    const primerDia = new Date(mesActivo.getFullYear(), mesActivo.getMonth(), 1);
    const ultimo = new Date(mesActivo.getFullYear(), mesActivo.getMonth() + 1, 0).getDate();
    const padInicio = primerDia.getDay();
    const celdas = [];
    for (let i = 0; i < padInicio; i++) celdas.push(null);
    for (let d = 1; d <= ultimo; d++)
      celdas.push(new Date(mesActivo.getFullYear(), mesActivo.getMonth(), d));
    return celdas;
  }, [mesActivo]);

  const limiteMax = new Date();
  limiteMax.setDate(limiteMax.getDate() + 60);

  function cambiarMes(delta) {
    setMesActivo(new Date(mesActivo.getFullYear(), mesActivo.getMonth() + delta, 1));
  }

  const puedeRetroceder =
    mesActivo.getFullYear() > hoy.getFullYear() ||
    (mesActivo.getFullYear() === hoy.getFullYear() && mesActivo.getMonth() > hoy.getMonth());
  const puedeAvanzar =
    mesActivo.getFullYear() < limiteMax.getFullYear() ||
    (mesActivo.getFullYear() === limiteMax.getFullYear() && mesActivo.getMonth() < limiteMax.getMonth());

  return (
    <>
      <h4 className="mb-3">3. ¿Qué día?</h4>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-sm btn-outline-rosa" onClick={() => cambiarMes(-1)} disabled={!puedeRetroceder} aria-label="Mes anterior">
          <i className="bi bi-chevron-left" aria-hidden="true"></i>
        </button>
        <strong>{MESES_ES[mesActivo.getMonth()]} {mesActivo.getFullYear()}</strong>
        <button className="btn btn-sm btn-outline-rosa" onClick={() => cambiarMes(1)} disabled={!puedeAvanzar} aria-label="Mes siguiente">
          <i className="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      <div className="calendario">
        {DIAS_ES.map((d) => <div key={d} className="calendario-cabecera">{d}</div>)}
        {diasMes.map((d, i) => {
          if (!d) return <div key={i}></div>;
          const deshabilitado = d < hoy || d > limiteMax;
          const esHoy = d.getTime() === hoy.getTime();
          const activo = fecha && d.getTime() === fecha.getTime();
          return (
            <button
              key={i}
              className={"calendario-dia" + (activo ? " activo" : "") + (esHoy ? " hoy" : "")}
              disabled={deshabilitado}
              onClick={() => onSeleccionar(d)}
              aria-label={formatearFecha(d)}
              aria-pressed={activo}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {fecha && (
        <p className="text-center mt-3 mb-0">
          Día seleccionado: <strong>{formatearFecha(fecha)}</strong>
        </p>
      )}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-rosa" onClick={onAtras}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Atrás
        </button>
        <button className="btn btn-rosa" onClick={onContinuar} disabled={!fecha}>
          Continuar<i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 3 — Hora */
function PasoHora({ hora, ocupados, onSeleccionar, onAtras, onContinuar }) {
  return (
    <>
      <h4 className="mb-3">4. ¿A qué hora?</h4>
      <div className="slots-horario mb-3">
        {SLOTS_HORARIO.map((h) => {
          const ocupado = ocupados.has(h);
          return (
            <button
              key={h}
              className={"slot" + (hora === h ? " activo" : "")}
              disabled={ocupado}
              onClick={() => onSeleccionar(h)}
              aria-pressed={hora === h}
            >
              {h}
            </button>
          );
        })}
      </div>
      {ocupados.size > 0 && (
        <small className="text-muted d-block text-center mb-3">
          Los horarios deshabilitados ya están reservados.
        </small>
      )}
      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-rosa" onClick={onAtras}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Atrás
        </button>
        <button className="btn btn-rosa" onClick={onContinuar} disabled={!hora}>
          Continuar<i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 4 — Datos */
function PasoDatos({ datos, onCambiar, errores, errorGuardar, onAtras, onContinuar, resumen, confirmando }) {
  return (
    <>
      <h4 className="mb-3">5. Tus datos</h4>

      <div className="resumen-box mb-4">
        <small className="text-muted d-block mb-2">Resumen de tu reserva</small>
        {resumen.servicios.map((s) => (
          <div key={s.id} className="d-flex justify-content-between mb-1">
            <span>{s.nombre}</span>
            <span>{formatoCLP(s.precio)}</span>
          </div>
        ))}
        {resumen.servicios.length > 1 && (
          <>
            <hr className="my-2" />
            <div className="d-flex justify-content-between">
              <strong>Total</strong>
              <strong style={{ color: "var(--rosa)" }}>{formatoCLP(resumen.totalPrecio)}</strong>
            </div>
          </>
        )}
        <small className="text-muted d-block mt-1">
          {resumen.profesional} · {resumen.fecha} · {resumen.hora} hrs · {resumen.totalDuracion} min
        </small>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="res-nombre">Nombre completo</label>
        <input
          id="res-nombre" type="text" autoComplete="name"
          className={"form-control" + (errores.nombre ? " is-invalid" : "")}
          value={datos.nombre}
          onChange={(e) => onCambiar("nombre", e.target.value)}
        />
        {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="res-correo">Correo electrónico</label>
        <input
          id="res-correo" type="email" autoComplete="email"
          className={"form-control" + (errores.correo ? " is-invalid" : "")}
          value={datos.correo}
          onChange={(e) => onCambiar("correo", e.target.value)}
        />
        {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="res-tel">Teléfono</label>
        <input
          id="res-tel" type="tel" autoComplete="tel"
          className={"form-control" + (errores.telefono ? " is-invalid" : "")}
          value={datos.telefono}
          onChange={(e) => onCambiar("telefono", e.target.value)}
          placeholder="+56 9 1234 5678"
        />
        {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
      </div>

      {errorGuardar && (
        <div className="alerta-error mb-3">
          <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
          {errorGuardar}
        </div>
      )}

      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-rosa" onClick={onAtras} disabled={confirmando}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Atrás
        </button>
        <button className="btn btn-rosa" onClick={onContinuar} disabled={confirmando}>
          {confirmando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              Confirmando…
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
              Confirmar reserva
            </>
          )}
        </button>
      </div>
    </>
  );
}

export default Reservar;
