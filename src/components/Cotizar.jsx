/* ===========================================================
   Cotizar.jsx - Cotización en wizard multi-paso
   1) Cotizar servicio individual (selección + acciones)
   2) Cotizar paquete personalizado (formulario contacto)
   =========================================================== */

import { useState, useEffect } from "react";
import {
  SERVICIOS,
  INFO_SALON,
  CATEGORIAS,
  formatoCLP,
} from "../data/data.js";
import {
  leerBorradorCotizacion,
  guardarBorradorCotizacion,
  limpiarBorradorCotizacion,
} from "../lib/storage.js";
import Stepper from "./ui/Stepper.jsx";

function Cotizar({ payload }) {
  const [modo, setModo] = useState(payload?.servicioId ? "servicio" : null);

  return (
    <div className="fade-in" style={{ paddingTop: "90px" }}>
      <section className="seccion container">
        <div className="text-center">
          <h2 className="seccion-titulo">Cotiza tus Servicios</h2>
          <p className="text-muted mb-5">
            Elige cómo deseas cotizar con {INFO_SALON.nombre}
          </p>
        </div>

        {modo === null && (
          <div className="row g-4 justify-content-center">
            <div className="col-md-5">
              <div
                className="opcion-cotizar"
                onClick={() => setModo("servicio")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setModo("servicio");
                  }
                }}
              >
                <div className="icono-grande">
                  <i className="bi bi-list-check" aria-hidden="true"></i>
                </div>
                <h4>Cotizar Servicio Individual</h4>
                <p className="text-muted">
                  Selecciona uno o más servicios, indica la cantidad y obtén el
                  cálculo automático del total.
                </p>
                <button className="btn btn-rosa mt-2">Comenzar</button>
              </div>
            </div>
            <div className="col-md-5">
              <div
                className="opcion-cotizar"
                onClick={() => setModo("paquete")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setModo("paquete");
                  }
                }}
              >
                <div className="icono-grande">
                  <i className="bi bi-box-seam" aria-hidden="true"></i>
                </div>
                <h4>Cotizar Paquete Personalizado</h4>
                <p className="text-muted">
                  Cuéntanos qué necesitas y te prepararemos un paquete a tu
                  medida mediante nuestro formulario de contacto.
                </p>
                <button className="btn btn-outline-rosa mt-2">
                  Solicitar paquete
                </button>
              </div>
            </div>
          </div>
        )}

        {modo !== null && (
          <button
            className="btn btn-sm btn-outline-rosa mb-4"
            onClick={() => setModo(null)}
          >
            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a opciones
          </button>
        )}

        {modo === "servicio" && (
          <CotizarServicio servicioPreseleccionado={payload?.servicioId} />
        )}
        {modo === "paquete" && <CotizarPaquete />}
      </section>
    </div>
  );
}

/* ============================================================
   COTIZAR SERVICIO INDIVIDUAL (wizard 3 pasos)
   ============================================================ */
function CotizarServicio({ servicioPreseleccionado }) {
  const [paso, setPaso] = useState(0);
  const [categoria, setCategoria] = useState("Todos");
  const [seleccionados, setSeleccionados] = useState(() => {
    const borrador = leerBorradorCotizacion();
    if (borrador && borrador.tipo === "servicio") return borrador.seleccionados;
    if (servicioPreseleccionado) {
      return { [servicioPreseleccionado]: 1 };
    }
    return {};
  });

  // Persistir borrador en cada cambio
  useEffect(() => {
    if (Object.keys(seleccionados).length > 0) {
      guardarBorradorCotizacion({ tipo: "servicio", seleccionados });
    }
  }, [seleccionados]);

  function toggleServicio(id) {
    setSeleccionados((prev) => {
      const copia = { ...prev };
      if (copia[id]) {
        delete copia[id];
      } else {
        copia[id] = 1;
      }
      return copia;
    });
  }

  function cambiarCantidad(id, valor) {
    const cantidad = Math.max(1, parseInt(valor) || 1);
    setSeleccionados((prev) => ({ ...prev, [id]: cantidad }));
  }

  const itemsSeleccionados = SERVICIOS.filter((s) => seleccionados[s.id]);
  const total = itemsSeleccionados.reduce(
    (acc, s) => acc + s.precio * seleccionados[s.id],
    0
  );
  const tiempoTotal = itemsSeleccionados.reduce(
    (acc, s) => acc + (s.duracionMin || 0) * seleccionados[s.id],
    0
  );

  const serviciosFiltrados =
    categoria === "Todos"
      ? SERVICIOS
      : SERVICIOS.filter((s) => s.categoria === categoria);

  function generarTextoResumen() {
    const lineas = [
      `Cotización — ${INFO_SALON.nombre}`,
      `Fecha: ${new Date().toLocaleString("es-CL")}`,
      "",
      "Servicios solicitados:",
      ...itemsSeleccionados.map(
        (s) =>
          `- ${s.nombre} × ${seleccionados[s.id]} ${s.unidad} = ${formatoCLP(
            s.precio * seleccionados[s.id]
          )}`
      ),
      "",
      `Total estimado: ${formatoCLP(total)}`,
      `Duración aproximada: ${tiempoTotal} min`,
      "",
      "Para agendar, contáctanos:",
      `Tel: ${INFO_SALON.telefono}`,
      `Correo: ${INFO_SALON.correo}`,
    ];
    return lineas.join("\n");
  }

  function compartirWhatsApp() {
    const texto = encodeURIComponent(generarTextoResumen());
    window.open(
      `https://wa.me/${INFO_SALON.whatsapp}?text=${texto}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function descargarTxt() {
    const blob = new Blob([generarTextoResumen()], { type: "text/plain" });
    const ahora = new Date();
    const stamp =
      ahora.getFullYear().toString() +
      String(ahora.getMonth() + 1).padStart(2, "0") +
      String(ahora.getDate()).padStart(2, "0") +
      "-" +
      String(ahora.getHours()).padStart(2, "0") +
      String(ahora.getMinutes()).padStart(2, "0");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion-${stamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copiarPortapapeles() {
    try {
      await navigator.clipboard.writeText(generarTextoResumen());
      alert("Cotización copiada al portapapeles.");
    } catch {
      alert("No se pudo copiar. Usa el botón de descarga.");
    }
  }

  function reiniciar() {
    setSeleccionados({});
    setPaso(0);
    setCategoria("Todos");
    limpiarBorradorCotizacion();
  }

  return (
    <>
      <Stepper
        pasos={["Selección", "Resumen", "Acciones"]}
        pasoActivo={paso}
      />

      {/* PASO 0 - selección */}
      {paso === 0 && (
        <div className="row g-4">
          <div className="col-lg-7">
            <h4 className="mb-3">
              <i className="bi bi-list-check me-2" aria-hidden="true"></i>
              Selecciona uno o más servicios
            </h4>

            {/* Filtro por categoría */}
            <div className="chips-categoria mb-3">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  className={"chip-categoria" + (categoria === cat ? " activo" : "")}
                  onClick={() => setCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="table-responsive">
              <table className="table align-middle tabla-cotizacion">
                <thead>
                  <tr>
                    <th scope="col" aria-label="Seleccionar"></th>
                    <th scope="col">Servicio</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosFiltrados.map((s) => {
                    const activo = !!seleccionados[s.id];
                    return (
                      <tr key={s.id} className="fila-servicio">
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={activo}
                            onChange={() => toggleServicio(s.id)}
                            aria-label={"Agregar " + s.nombre}
                          />
                        </td>
                        <td>
                          <strong>{s.nombre}</strong>
                          <br />
                          <small className="text-muted">
                            {s.categoria} · por {s.unidad}
                          </small>
                        </td>
                        <td>{formatoCLP(s.precio)}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="form-control input-cantidad"
                            value={seleccionados[s.id] || 1}
                            disabled={!activo}
                            onChange={(e) =>
                              cambiarCantidad(s.id, e.target.value)
                            }
                            aria-label={"Cantidad de " + s.nombre}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="resumen-box">
              <h4 className="mb-3">
                <i className="bi bi-receipt me-2" aria-hidden="true"></i>
                Resumen
              </h4>

              {itemsSeleccionados.length === 0 ? (
                <p className="text-muted mb-0">
                  Aún no has seleccionado servicios. Marca las casillas para
                  agregarlos a tu cotización.
                </p>
              ) : (
                <div>
                  <ul className="list-group list-group-flush mb-3">
                    {itemsSeleccionados.map((s) => (
                      <li
                        key={s.id}
                        className="list-group-item bg-transparent d-flex justify-content-between px-0"
                      >
                        <span>
                          {s.nombre}{" "}
                          <small className="text-muted">
                            ×{seleccionados[s.id]} {s.unidad}
                          </small>
                        </span>
                        <strong>
                          {formatoCLP(s.precio * seleccionados[s.id])}
                        </strong>
                      </li>
                    ))}
                  </ul>
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="fw-bold">TOTAL:</span>
                    <span className="total-destacado">{formatoCLP(total)}</span>
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-clock me-1" aria-hidden="true"></i>
                    Duración aproximada: {tiempoTotal} min
                  </small>
                  <button
                    className="btn btn-rosa w-100 mt-4"
                    onClick={() => setPaso(1)}
                  >
                    Continuar al resumen
                    <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASO 1 - resumen */}
      {paso === 1 && (
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <h4 className="mb-3">
              <i className="bi bi-receipt me-2" aria-hidden="true"></i>
              Revisa tu cotización
            </h4>
            <div className="resumen-box">
              <ul className="list-group list-group-flush mb-3">
                {itemsSeleccionados.map((s) => (
                  <li
                    key={s.id}
                    className="list-group-item bg-transparent d-flex justify-content-between px-0"
                  >
                    <span>
                      {s.nombre}{" "}
                      <small className="text-muted">
                        ×{seleccionados[s.id]} {s.unidad}
                      </small>
                    </span>
                    <strong>
                      {formatoCLP(s.precio * seleccionados[s.id])}
                    </strong>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <span className="fw-bold">TOTAL ESTIMADO:</span>
                <span className="total-destacado">{formatoCLP(total)}</span>
              </div>
              <small className="text-muted d-block mt-2">
                <i className="bi bi-clock me-1" aria-hidden="true"></i>
                Duración aproximada: {tiempoTotal} min
              </small>
            </div>
            <div className="d-flex gap-2 mt-4 flex-wrap">
              <button
                className="btn btn-outline-rosa"
                onClick={() => setPaso(0)}
              >
                <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
                Modificar selección
              </button>
              <button
                className="btn btn-rosa ms-auto"
                onClick={() => setPaso(2)}
              >
                Confirmar y elegir acción
                <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 2 - acciones */}
      {paso === 2 && (
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="alerta-exito mb-4">
              <h5>
                <i
                  className="bi bi-check-circle-fill me-2"
                  aria-hidden="true"
                ></i>
                ¡Cotización generada!
              </h5>
              <p className="mb-0">
                Total: <strong>{formatoCLP(total)}</strong> · {tiempoTotal} min
                aproximados
              </p>
            </div>

            <h4 className="mb-3">¿Qué quieres hacer?</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <button
                  className="btn btn-whatsapp w-100"
                  onClick={compartirWhatsApp}
                >
                  <i className="bi bi-whatsapp me-2" aria-hidden="true"></i>
                  Enviar por WhatsApp
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-outline-rosa w-100"
                  onClick={descargarTxt}
                >
                  <i className="bi bi-download me-2" aria-hidden="true"></i>
                  Descargar (.txt)
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-outline-rosa w-100"
                  onClick={copiarPortapapeles}
                >
                  <i className="bi bi-clipboard me-2" aria-hidden="true"></i>
                  Copiar al portapapeles
                </button>
              </div>
              <div className="col-md-6">
                <button className="btn btn-outline-rosa w-100" onClick={reiniciar}>
                  <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
                  Nueva cotización
                </button>
              </div>
            </div>

            <div className="alerta-info mt-4">
              <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
              Presenta este resumen en {INFO_SALON.nombre} o contáctanos para
              agendar tu hora. Los precios pueden variar levemente según
              características específicas del servicio.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   COTIZAR PAQUETE PERSONALIZADO (wizard 4 pasos)
   ============================================================ */
const TIPOS_PAQUETE = [
  { id: "novia", nombre: "Novia", icono: "bi-gem" },
  { id: "cumpleanos", nombre: "Cumpleaños", icono: "bi-balloon" },
  { id: "evento", nombre: "Sesión foto / Evento", icono: "bi-camera" },
  { id: "otro", nombre: "Otro", icono: "bi-three-dots" },
];

function CotizarPaquete() {
  const [paso, setPaso] = useState(0);
  const [tipo, setTipo] = useState(null);
  const [fecha, setFecha] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });
  const [errores, setErrores] = useState({});
  const [isEnviando, setIsEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function validarDatos() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre completo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo))
      e.correo = "Ingresa un correo electrónico válido.";
    if (!form.telefono.trim()) {
      e.telefono = "Ingresa un teléfono de contacto.";
    } else if (!/^\+?5?6?\s?9?\s?\d{4}\s?\d{4}$/.test(form.telefono.trim())) {
      e.telefono = "Formato inválido. Ej: +56 9 1234 5678";
    }
    if (!form.mensaje.trim())
      e.mensaje = "Describe el paquete o servicio que deseas cotizar.";
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function enviar() {
    if (!validarDatos()) return;
    setIsEnviando(true);
    // Mock latencia: hoy localStorage / luego Supabase + Resend
    setTimeout(() => {
      setIsEnviando(false);
      setEnviado(true);
    }, 700);
  }

  function reiniciar() {
    setPaso(0);
    setTipo(null);
    setFecha("");
    setForm({ nombre: "", correo: "", telefono: "", mensaje: "" });
    setErrores({});
    setEnviado(false);
  }

  if (enviado) {
    return (
      <div
        className="alerta-exito text-center fade-in mx-auto"
        style={{ maxWidth: "560px" }}
      >
        <i
          className="bi bi-check-circle-fill"
          style={{ fontSize: "3rem" }}
          aria-hidden="true"
        ></i>
        <h4 className="mt-3">¡Solicitud enviada!</h4>
        <p className="mb-0">
          Tu solicitud ha sido registrada. Nos pondremos en contacto contigo a
          la brevedad por {form.correo || "el correo indicado"}.
        </p>
        <button className="btn btn-rosa mt-4" onClick={reiniciar}>
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <>
      <Stepper
        pasos={["Tipo", "Fecha", "Datos", "Confirmar"]}
        pasoActivo={paso}
      />

      <div className="row justify-content-center">
        <div className="col-lg-7">
          {/* PASO 0 - tipo de paquete */}
          {paso === 0 && (
            <>
              <h4 className="mb-3">¿Qué tipo de paquete necesitas?</h4>
              <div className="tipo-paquete-grid">
                {TIPOS_PAQUETE.map((t) => (
                  <button
                    key={t.id}
                    className={
                      "tipo-paquete-card" + (tipo === t.id ? " activo" : "")
                    }
                    onClick={() => setTipo(t.id)}
                    aria-pressed={tipo === t.id}
                  >
                    <i className={"bi " + t.icono} aria-hidden="true"></i>
                    <div className="mt-2 fw-semibold">{t.nombre}</div>
                  </button>
                ))}
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-rosa"
                  onClick={() => setPaso(1)}
                  disabled={!tipo}
                >
                  Continuar
                  <i
                    className="bi bi-arrow-right ms-2"
                    aria-hidden="true"
                  ></i>
                </button>
              </div>
            </>
          )}

          {/* PASO 1 - fecha estimada */}
          {paso === 1 && (
            <>
              <h4 className="mb-3">¿Para cuándo lo necesitas?</h4>
              <label className="form-label">Fecha estimada del evento</label>
              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
              <small className="text-muted d-block mt-2">
                Si aún no tienes fecha definida, puedes saltar este paso.
              </small>
              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-outline-rosa"
                  onClick={() => setPaso(0)}
                >
                  <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
                  Atrás
                </button>
                <button className="btn btn-rosa" onClick={() => setPaso(2)}>
                  Continuar
                  <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                </button>
              </div>
            </>
          )}

          {/* PASO 2 - datos */}
          {paso === 2 && (
            <>
              <h4 className="mb-3">Tus datos de contacto</h4>
              <div className="mb-3">
                <label className="form-label" htmlFor="paq-nombre">
                  Nombre completo
                </label>
                <input
                  id="paq-nombre"
                  type="text"
                  autoComplete="name"
                  className={
                    "form-control" + (errores.nombre ? " is-invalid" : "")
                  }
                  value={form.nombre}
                  onChange={(e) => actualizar("nombre", e.target.value)}
                  placeholder="Ej: María Pérez González"
                />
                {errores.nombre && (
                  <div className="invalid-feedback">{errores.nombre}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="paq-correo">
                  Correo electrónico
                </label>
                <input
                  id="paq-correo"
                  type="email"
                  autoComplete="email"
                  className={
                    "form-control" + (errores.correo ? " is-invalid" : "")
                  }
                  value={form.correo}
                  onChange={(e) => actualizar("correo", e.target.value)}
                  placeholder="Ej: maria@correo.cl"
                />
                {errores.correo && (
                  <div className="invalid-feedback">{errores.correo}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="paq-tel">
                  Teléfono
                </label>
                <input
                  id="paq-tel"
                  type="tel"
                  autoComplete="tel"
                  className={
                    "form-control" + (errores.telefono ? " is-invalid" : "")
                  }
                  value={form.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                  placeholder="Ej: +56 9 1234 5678"
                />
                {errores.telefono && (
                  <div className="invalid-feedback">{errores.telefono}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="paq-mensaje">
                  Descripción del paquete
                </label>
                <textarea
                  id="paq-mensaje"
                  className={
                    "form-control" + (errores.mensaje ? " is-invalid" : "")
                  }
                  rows="4"
                  value={form.mensaje}
                  onChange={(e) => actualizar("mensaje", e.target.value)}
                  placeholder="Ej: Quiero un paquete novia con maquillaje, peinado y manicure para el 15 de marzo."
                />
                {errores.mensaje && (
                  <div className="invalid-feedback">{errores.mensaje}</div>
                )}
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-outline-rosa"
                  onClick={() => setPaso(1)}
                >
                  <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
                  Atrás
                </button>
                <button
                  className="btn btn-rosa"
                  onClick={() => {
                    if (validarDatos()) setPaso(3);
                  }}
                >
                  Revisar
                  <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                </button>
              </div>
            </>
          )}

          {/* PASO 3 - confirmación */}
          {paso === 3 && (
            <>
              <h4 className="mb-3">Confirma tu solicitud</h4>
              <div className="resumen-box">
                <ul className="list-unstyled mb-0">
                  <li className="d-flex justify-content-between border-bottom py-2">
                    <span className="text-muted">Tipo de paquete:</span>
                    <strong>
                      {TIPOS_PAQUETE.find((t) => t.id === tipo)?.nombre}
                    </strong>
                  </li>
                  <li className="d-flex justify-content-between border-bottom py-2">
                    <span className="text-muted">Fecha estimada:</span>
                    <strong>{fecha || "Por definir"}</strong>
                  </li>
                  <li className="d-flex justify-content-between border-bottom py-2">
                    <span className="text-muted">Nombre:</span>
                    <strong>{form.nombre}</strong>
                  </li>
                  <li className="d-flex justify-content-between border-bottom py-2">
                    <span className="text-muted">Correo:</span>
                    <strong>{form.correo}</strong>
                  </li>
                  <li className="d-flex justify-content-between border-bottom py-2">
                    <span className="text-muted">Teléfono:</span>
                    <strong>{form.telefono}</strong>
                  </li>
                  <li className="py-2">
                    <span className="text-muted d-block mb-1">Mensaje:</span>
                    <div>{form.mensaje}</div>
                  </li>
                </ul>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-outline-rosa"
                  onClick={() => setPaso(2)}
                  disabled={isEnviando}
                >
                  <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
                  Editar
                </button>
                <button
                  className="btn btn-rosa"
                  onClick={enviar}
                  disabled={isEnviando}
                >
                  {isEnviando ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      ></span>
                      Enviando…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2" aria-hidden="true"></i>
                      Enviar solicitud
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Cotizar;
