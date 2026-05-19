/* ===========================================================
   storage.js - Wrapper sobre localStorage con try/catch
   Hoy persiste en navegador. Cuando se integre Supabase,
   estas funciones se reemplazan por llamadas a la BD.
   =========================================================== */

const PREFIJO = "be:"; // belleza-estilo

export function leer(clave, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIJO + clave);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function escribir(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    /* ignorar */
  }
}

// Helpers específicos de dominio

export function leerReservas() {
  return leer("reservas", []);
}

export function agregarReserva(reserva) {
  const lista = leerReservas();
  lista.unshift(reserva);
  escribir("reservas", lista);
  return reserva;
}

export function eliminarReserva(codigo) {
  const lista = leerReservas().filter((r) => r.codigo !== codigo);
  escribir("reservas", lista);
}

export function leerBorradorCotizacion() {
  return leer("cotizacion:borrador", null);
}

export function guardarBorradorCotizacion(borrador) {
  escribir("cotizacion:borrador", borrador);
}

export function limpiarBorradorCotizacion() {
  borrar("cotizacion:borrador");
}

// Tema (claro/oscuro)

export function leerTema() {
  try {
    return localStorage.getItem("tema");
  } catch {
    return null;
  }
}

export function escribirTema(tema) {
  try {
    localStorage.setItem("tema", tema);
  } catch {
    /* ignorar */
  }
}
