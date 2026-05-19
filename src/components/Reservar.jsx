/* ===========================================================
   Reservar.jsx - Wizard de reserva de cita
   Servicio(s) → Profesional → Fecha → Hora → Datos → Confirmación
   Persiste en localStorage (mock; se reemplaza por Supabase)
   =========================================================== */

import { useState, useMemo } from "react";
import {
  SERVICIOS,
  PROFESIONALES,
  SLOTS_HORARIO,
  INFO_SALON,
  formatoCLP,
} from "../data/data.js";
import { agregarReserva, leerReservas } from "../lib/storage.js";
import Stepper from "./ui/Stepper.jsx";

const DIAS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
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

function Reservar({ payload, navegar }) {
  const [paso, setPaso] = useState(0);
  const [servicioIds, setServicioIds] = useState(
    payload?.servicioId ? [payload.servicioId] : [null]
  );
  const [profesionalId, setProfesionalId] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [datos, setDatos] = useState({ nombre: "", correo: "", telefono: "" });
  const [errores, setErrores] = useState({});
  const [confirmando, setConfirmando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const serviciosSeleccionados = useMemo(
    () =>
      servicioIds
        .map((id) => SERVICIOS.find((s) => s.id === id))
        .filter(Boolean),
    [servicioIds]
  );
  const totalPrecio = serviciosSeleccionados.reduce(
    (sum, s) => sum + s.precio,
    0
  );
  const totalDuracion = serviciosSeleccionados.reduce(
    (sum, s) => sum + s.duracionMin,
    0
  );

  const profesional = PROFESIONALES.find((p) => p.id === profesionalId);

  const reservasExistentes = useMemo(() => leerReservas(), [paso]);
  const ocupados = useMemo(() => {
    if (!fecha || !profesionalId) return new Set();
    return new Set(
      reservasExistentes
        .filter(
          (r) =>
            r.fechaISO === fechaISO(fecha) && r.profesionalId === profesionalId
        )
        .map((r) => r.hora)
    );
  }, [fecha, profesionalId, reservasExistentes]);

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

  function confirmarReserva() {
    setConfirmando(true);
    setTimeout(() => {
      const reserva = {
        codigo: generarCodigo(),
        creadaEn: new Date().toISOString(),
        servicios: serviciosSeleccionados.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          precio: s.precio,
          duracionMin: s.duracionMin,
        })),
        totalPrecio,
        totalDuracion,
        profesionalId,
        profesionalNombre: profesional.nombre,
        fechaISO: fechaISO(fecha),
        fechaTexto: formatearFecha(fecha),
        hora,
        ...datos,
      };
      agregarReserva(reserva);
      setReservaConfirmada(reserva);
      setConfirmando(false);
      setPaso(5);
    }, 700);
  }

  function reiniciar() {
    setPaso(0);
    setServicioIds([null]);
    setProfesionalId(null);
    setFecha(null);
    setHora(null);
    setDatos({ nombre: "", correo: "", telefono: "" });
    setReservaConfirmada(null);
    setErrores({});
  }

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
                {reservaConfirmada.servicios.length > 1
                  ? "Servicios"
                  : "Servicio"}
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
              <span className="val">
                {formatoCLP(reservaConfirmada.totalPrecio)}
              </span>
            </div>

            <p className="text-muted small mt-4 mb-0">
              Te esperamos en {INFO_SALON.direccion}. Guarda este código.
            </p>
            <div className="d-flex gap-2 mt-4 justify-content-center flex-wrap">
              <button className="btn btn-outline-rosa" onClick={reiniciar}>
                Nueva reserva
              </button>
              <button
                className="btn btn-rosa"
                onClick={() => navegar("mis-reservas")}
              >
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
                profesionalId={profesionalId}
                onSeleccionar={setProfesionalId}
                onAtras={() => setPaso(0)}
                onContinuar={() => setPaso(2)}
              />
            )}

            {paso === 2 && (
              <PasoFecha
                fecha={fecha}
                onSeleccionar={(f) => {
                  setFecha(f);
                  setHora(null);
                }}
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
                onCambiar={(c, v) =>
                  setDatos((prev) => ({ ...prev, [c]: v }))
                }
                errores={errores}
                onAtras={() => setPaso(3)}
                onContinuar={() => {
                  if (validarDatos()) confirmarReserva();
                }}
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

/* PASO 0 */
function PasoServicio({ servicioIds, onActualizar, onContinuar }) {
  function cambiarServicio(idx, val) {
    const nuevos = [...servicioIds];
    nuevos[idx] = val ? parseInt(val) : null;
    onActualizar(nuevos);
  }

  function agregarServicio() {
    onActualizar([...servicioIds, null]);
  }

  function quitarServicio(idx) {
    const nuevos = servicioIds.filter((_, i) => i !== idx);
    onActualizar(nuevos.length > 0 ? nuevos : [null]);
  }

  const todosSeleccionados =
    servicioIds.length > 0 && servicioIds.every((id) => id !== null);

  const totalPrecio = servicioIds
    .map((id) => SERVICIOS.find((s) => s.id === id))
    .filter(Boolean)
    .reduce((sum, s) => sum + s.precio, 0);

  const totalDuracion = servicioIds
    .map((id) => SERVICIOS.find((s) => s.id === id))
    .filter(Boolean)
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

      <button
        className="btn btn-outline-rosa btn-sm mb-4"
        onClick={agregarServicio}
      >
        <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
        Agregar otro servicio
      </button>

      {todosSeleccionados && servicioIds.length > 1 && (
        <div className="resumen-box mb-4">
          <small className="text-muted d-block mb-2">
            Resumen de servicios seleccionados
          </small>
          {servicioIds.map((id) => {
            const s = SERVICIOS.find((sv) => sv.id === id);
            return s ? (
              <div
                key={id}
                className="d-flex justify-content-between mb-1"
              >
                <span>{s.nombre}</span>
                <span>{formatoCLP(s.precio)}</span>
              </div>
            ) : null;
          })}
          <hr className="my-2" />
          <div className="d-flex justify-content-between">
            <strong>Total</strong>
            <strong style={{ color: "var(--rosa)" }}>
              {formatoCLP(totalPrecio)}
            </strong>
          </div>
          <small className="text-muted">Duración estimada: {totalDuracion} min</small>
        </div>
      )}

      <div className="d-flex justify-content-end">
        <button
          className="btn btn-rosa"
          onClick={onContinuar}
          disabled={!todosSeleccionados}
        >
          Continuar
          <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 1 */
function PasoProfesional({
  profesionalId,
  onSeleccionar,
  onAtras,
  onContinuar,
}) {
  return (
    <>
      <h4 className="mb-3">2. Elige tu profesional</h4>
      <div className="row g-3 mb-4">
        {PROFESIONALES.map((p) => (
          <div className="col-md-4" key={p.id}>
            <button
              className={
                "profesional-card w-100 border-0" +
                (profesionalId === p.id ? " activo" : "")
              }
              onClick={() => onSeleccionar(p.id)}
              aria-pressed={profesionalId === p.id}
            >
              <div className="profesional-avatar" aria-hidden="true">
                {p.iniciales}
              </div>
              <h5 className="mb-1">{p.nombre}</h5>
              <small className="text-muted">{p.especialidad}</small>
            </button>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-rosa" onClick={onAtras}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Atrás
        </button>
        <button
          className="btn btn-rosa"
          onClick={onContinuar}
          disabled={!profesionalId}
        >
          Continuar
          <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 2 - Calendario */
function PasoFecha({ fecha, onSeleccionar, onAtras, onContinuar }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [mesActivo, setMesActivo] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );

  const diasMes = useMemo(() => {
    const primerDia = new Date(
      mesActivo.getFullYear(),
      mesActivo.getMonth(),
      1
    );
    const ultimo = new Date(
      mesActivo.getFullYear(),
      mesActivo.getMonth() + 1,
      0
    ).getDate();
    const padInicio = primerDia.getDay();
    const celdas = [];
    for (let i = 0; i < padInicio; i++) celdas.push(null);
    for (let d = 1; d <= ultimo; d++) {
      celdas.push(new Date(mesActivo.getFullYear(), mesActivo.getMonth(), d));
    }
    return celdas;
  }, [mesActivo]);

  const limiteMax = new Date();
  limiteMax.setDate(limiteMax.getDate() + 60);

  function cambiarMes(delta) {
    setMesActivo(
      new Date(mesActivo.getFullYear(), mesActivo.getMonth() + delta, 1)
    );
  }

  const puedeRetroceder =
    mesActivo.getFullYear() > hoy.getFullYear() ||
    (mesActivo.getFullYear() === hoy.getFullYear() &&
      mesActivo.getMonth() > hoy.getMonth());

  const puedeAvanzar =
    mesActivo.getFullYear() < limiteMax.getFullYear() ||
    (mesActivo.getFullYear() === limiteMax.getFullYear() &&
      mesActivo.getMonth() < limiteMax.getMonth());

  return (
    <>
      <h4 className="mb-3">3. ¿Qué día?</h4>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-sm btn-outline-rosa"
          onClick={() => cambiarMes(-1)}
          disabled={!puedeRetroceder}
          aria-label="Mes anterior"
        >
          <i className="bi bi-chevron-left" aria-hidden="true"></i>
        </button>
        <strong>
          {MESES_ES[mesActivo.getMonth()]} {mesActivo.getFullYear()}
        </strong>
        <button
          className="btn btn-sm btn-outline-rosa"
          onClick={() => cambiarMes(1)}
          disabled={!puedeAvanzar}
          aria-label="Mes siguiente"
        >
          <i className="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      <div className="calendario">
        {DIAS_ES.map((d) => (
          <div key={d} className="calendario-cabecera">
            {d}
          </div>
        ))}
        {diasMes.map((d, i) => {
          if (!d) return <div key={i}></div>;
          const deshabilitado = d < hoy || d > limiteMax;
          const esHoy = d.getTime() === hoy.getTime();
          const activo = fecha && d.getTime() === fecha.getTime();
          return (
            <button
              key={i}
              className={
                "calendario-dia" +
                (activo ? " activo" : "") +
                (esHoy ? " hoy" : "")
              }
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
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Atrás
        </button>
        <button className="btn btn-rosa" onClick={onContinuar} disabled={!fecha}>
          Continuar
          <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 3 - Hora */
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
          Los horarios tachados ya están reservados.
        </small>
      )}
      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-rosa" onClick={onAtras}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Atrás
        </button>
        <button className="btn btn-rosa" onClick={onContinuar} disabled={!hora}>
          Continuar
          <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </button>
      </div>
    </>
  );
}

/* PASO 4 - Datos */
function PasoDatos({
  datos,
  onCambiar,
  errores,
  onAtras,
  onContinuar,
  resumen,
  confirmando,
}) {
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
              <strong style={{ color: "var(--rosa)" }}>
                {formatoCLP(resumen.totalPrecio)}
              </strong>
            </div>
          </>
        )}
        <small className="text-muted d-block mt-1">
          {resumen.profesional} · {resumen.fecha} · {resumen.hora} hrs ·{" "}
          {resumen.totalDuracion} min
        </small>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="res-nombre">
          Nombre completo
        </label>
        <input
          id="res-nombre"
          type="text"
          autoComplete="name"
          className={"form-control" + (errores.nombre ? " is-invalid" : "")}
          value={datos.nombre}
          onChange={(e) => onCambiar("nombre", e.target.value)}
        />
        {errores.nombre && (
          <div className="invalid-feedback">{errores.nombre}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="res-correo">
          Correo electrónico
        </label>
        <input
          id="res-correo"
          type="email"
          autoComplete="email"
          className={"form-control" + (errores.correo ? " is-invalid" : "")}
          value={datos.correo}
          onChange={(e) => onCambiar("correo", e.target.value)}
        />
        {errores.correo && (
          <div className="invalid-feedback">{errores.correo}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="res-tel">
          Teléfono
        </label>
        <input
          id="res-tel"
          type="tel"
          autoComplete="tel"
          className={"form-control" + (errores.telefono ? " is-invalid" : "")}
          value={datos.telefono}
          onChange={(e) => onCambiar("telefono", e.target.value)}
          placeholder="+56 9 1234 5678"
        />
        {errores.telefono && (
          <div className="invalid-feedback">{errores.telefono}</div>
        )}
      </div>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-rosa"
          onClick={onAtras}
          disabled={confirmando}
        >
          <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Atrás
        </button>
        <button
          className="btn btn-rosa"
          onClick={onContinuar}
          disabled={confirmando}
        >
          {confirmando ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>
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
