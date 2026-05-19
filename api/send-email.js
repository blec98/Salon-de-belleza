/* ===========================================================
   api/send-email.js — Vercel Serverless Function
   Envía emails transaccionales vía Resend.

   Instalar dependencia antes de usar:
     pnpm add resend

   Variables de entorno requeridas en Vercel:
     RESEND_API_KEY   → obtenida en resend.com/api-keys
     EMAIL_FROM       → dominio verificado en Resend, ej: "Belleza & Estilo <noreply@tudominio.cl>"
                        (mientras no haya dominio propio, usar: "onboarding@resend.dev" en pruebas)

   Tipos de email aceptados (campo "tipo" en el body):
     - "verificar-cuenta"       → { nombre, correo, urlVerificacion }
     - "restablecer-password"   → { nombre, correo, urlReset }
     - "reserva-confirmada"     → { nombre, correo, codigo, servicios,
                                    totalPrecio, profesional, fecha, hora, duracionMin }
   =========================================================== */

import { Resend } from "resend";
import {
  emailVerificacionCuenta,
  emailRestablecerPassword,
  emailReservaConfirmada,
} from "../src/lib/emailTemplates.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ORIGINS = [
  "https://bellezayestilo.vercel.app", // reemplazar con dominio final
  "http://localhost:5173",
  "http://localhost:4173",
];

export default async function handler(req, res) {
  /* ── CORS ── */
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  /* ── Validar API key configurada ── */
  if (!process.env.RESEND_API_KEY) {
    console.error("[send-email] RESEND_API_KEY no configurada");
    return res.status(500).json({ error: "Servicio de email no configurado" });
  }

  const { tipo, correo, ...datos } = req.body ?? {};

  /* ── Validar campos mínimos ── */
  if (!tipo || !correo) {
    return res.status(400).json({ error: "Faltan campos: tipo, correo" });
  }

  /* ── Elegir template ── */
  let template;
  try {
    switch (tipo) {
      case "verificar-cuenta":
        if (!datos.nombre || !datos.urlVerificacion)
          return res.status(400).json({ error: "Faltan: nombre, urlVerificacion" });
        template = emailVerificacionCuenta(datos);
        break;

      case "restablecer-password":
        if (!datos.nombre || !datos.urlReset)
          return res.status(400).json({ error: "Faltan: nombre, urlReset" });
        template = emailRestablecerPassword(datos);
        break;

      case "reserva-confirmada":
        if (!datos.nombre || !datos.codigo || !datos.servicios)
          return res.status(400).json({ error: "Faltan: nombre, codigo, servicios" });
        template = emailReservaConfirmada(datos);
        break;

      default:
        return res.status(400).json({ error: `Tipo desconocido: ${tipo}` });
    }
  } catch (err) {
    console.error("[send-email] Error al generar template:", err);
    return res.status(500).json({ error: "Error al generar el email" });
  }

  /* ── Enviar vía Resend ── */
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: [correo],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error("[send-email] Resend error:", error);
      return res.status(502).json({ error: "Error al enviar el email", detalle: error.message });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error("[send-email] Excepción inesperada:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
