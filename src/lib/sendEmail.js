/* ===========================================================
   sendEmail.js - Cliente frontend para /api/send-email
   Uso:
     import { sendEmail } from "./sendEmail.js";
     await sendEmail("reserva-confirmada", correo, { ...datos });
   =========================================================== */

const ENDPOINT = "/api/send-email";

/**
 * @param {"verificar-cuenta"|"restablecer-password"|"reserva-confirmada"} tipo
 * @param {string} correo  Destinatario
 * @param {object} datos   Campos requeridos por cada tipo (ver emailTemplates.js)
 * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
 */
export async function sendEmail(tipo, correo, datos = {}) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, correo, ...datos }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("[sendEmail]", json.error);
      return { ok: false, error: json.error };
    }

    return { ok: true, id: json.id };
  } catch (err) {
    console.error("[sendEmail] Error de red:", err);
    return { ok: false, error: "No se pudo conectar con el servidor de email" };
  }
}
