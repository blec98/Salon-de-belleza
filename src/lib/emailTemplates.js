/* ===========================================================
   emailTemplates.js - Plantillas HTML para Resend
   Cada función retorna { subject, html } listo para pasar a
   resend.emails.send(). Usar inline styles: máxima compatibilidad
   con Gmail, Outlook, Apple Mail.
   =========================================================== */

const SALON_NOMBRE  = "Belleza & Estilo";
const SALON_DIR     = "Av. Mackenna 850, Osorno";
const SALON_TEL     = "+56 9 8765 4321";
const SALON_EMAIL   = "contacto.bellezayestilo@yahoo.com";
const SALON_COLOR   = "#d6336c";
const SALON_DORADO  = "#c9973e";
const SALON_OSCURO  = "#2b2230";

/* ---------- BASE LAYOUT ---------- */
function base(contenido) {
  return /* html */ `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${SALON_NOMBRE}</title>
</head>
<body style="margin:0;padding:0;background:#f4eff2;font-family:Arial,Helvetica,sans-serif;color:#2b2230;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4eff2;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(43,34,48,0.10);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,${SALON_COLOR} 0%,${SALON_DORADO} 100%);padding:32px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.80);">
                Salón de Belleza
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#ffffff;font-weight:400;letter-spacing:1px;">
                ✿ ${SALON_NOMBRE}
              </h1>
            </td>
          </tr>

          <!-- BORDE DORADO -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${SALON_COLOR},${SALON_DORADO},${SALON_COLOR});"></td>
          </tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${contenido}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#fdf6f9;border-top:1px solid #f0e4ea;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#888;">
                <strong style="color:${SALON_OSCURO};">${SALON_NOMBRE}</strong>
                &nbsp;·&nbsp; ${SALON_DIR}
              </p>
              <p style="margin:0;font-size:12px;color:#aaa;">
                ${SALON_TEL} &nbsp;·&nbsp; ${SALON_EMAIL}
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#ccc;">
                Este correo fue generado automáticamente. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ---------- BOTÓN HELPER ---------- */
function boton(texto, url, color = SALON_COLOR) {
  return /* html */ `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
      <tr>
        <td align="center" style="background:${color};border-radius:8px;">
          <a href="${url}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;
                    color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            ${texto}
          </a>
        </td>
      </tr>
    </table>`;
}

/* ---------- SEPARADOR ---------- */
const sep = `<hr style="border:none;border-top:1px solid #f0e4ea;margin:24px 0;" />`;

/* ============================================================
   1. VERIFICACIÓN DE CUENTA
   Parámetros: { nombre, urlVerificacion }
   ============================================================ */
export function emailVerificacionCuenta({ nombre, urlVerificacion }) {
  const html = base(/* html */ `
    <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;
               font-size:22px;color:${SALON_OSCURO};font-weight:400;">
      Hola, ${nombre} 👋
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
      Gracias por registrarte en <strong>${SALON_NOMBRE}</strong>. Para activar tu cuenta
      y comenzar a reservar tus citas, confirma tu correo electrónico haciendo clic en el botón:
    </p>

    ${boton("✓ Verificar mi cuenta", urlVerificacion)}

    <p style="margin:16px 0 0;font-size:13px;color:#999;text-align:center;">
      Este enlace expira en <strong>24 horas</strong>.
    </p>

    ${sep}

    <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">
      Si no creaste una cuenta en ${SALON_NOMBRE}, puedes ignorar este correo
      con total tranquilidad. Tu seguridad es nuestra prioridad.
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#ccc;">
      Si el botón no funciona, copia y pega esta URL en tu navegador:<br/>
      <span style="color:${SALON_COLOR};word-break:break-all;">${urlVerificacion}</span>
    </p>
  `);

  return {
    subject: `Verifica tu cuenta en ${SALON_NOMBRE}`,
    html,
  };
}

/* ============================================================
   2. RESTABLECER CONTRASEÑA
   Parámetros: { nombre, urlReset }
   ============================================================ */
export function emailRestablecerPassword({ nombre, urlReset }) {
  const html = base(/* html */ `
    <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;
               font-size:22px;color:${SALON_OSCURO};font-weight:400;">
      Solicitud de nueva contraseña
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
      Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer
      la contraseña de tu cuenta en <strong>${SALON_NOMBRE}</strong>.
      Si fuiste tú, haz clic en el botón:
    </p>

    ${boton("🔑 Restablecer mi contraseña", urlReset)}

    <p style="margin:0 0 0;font-size:13px;color:#999;text-align:center;">
      Este enlace expira en <strong>1 hora</strong> por seguridad.
    </p>

    ${sep}

    <!-- Aviso de seguridad -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#fff8f0;border-left:4px solid ${SALON_DORADO};
                   padding:14px 16px;border-radius:0 6px 6px 0;">
          <p style="margin:0;font-size:13px;color:#7a5c20;line-height:1.6;">
            <strong>⚠️ ¿No solicitaste esto?</strong><br/>
            Si no pediste cambiar tu contraseña, ignora este correo.
            Tu cuenta permanece segura y sin cambios.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 0;font-size:12px;color:#ccc;">
      Si el botón no funciona, copia y pega esta URL en tu navegador:<br/>
      <span style="color:${SALON_COLOR};word-break:break-all;">${urlReset}</span>
    </p>
  `);

  return {
    subject: `Restablece tu contraseña — ${SALON_NOMBRE}`,
    html,
  };
}

/* ============================================================
   3. CONFIRMACIÓN DE RESERVA
   Parámetros: {
     nombre, codigo, servicios (array de strings),
     totalPrecio (number), profesional (string),
     fecha (string), hora (string), duracionMin (number)
   }
   ============================================================ */
export function emailReservaConfirmada({
  nombre,
  codigo,
  servicios,
  totalPrecio,
  profesional,
  fecha,
  hora,
  duracionMin,
}) {
  const formatoCLP = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);

  const filasServicios = servicios
    .map(
      (s) => /* html */ `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#555;border-bottom:1px solid #f0e4ea;">
          ${s}
        </td>
      </tr>`
    )
    .join("");

  const html = base(/* html */ `
    <!-- Encabezado confirmación -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:linear-gradient(135deg,#fdf0f5,#fef9ec);
                  border:1px solid #f0d8e8;border-radius:8px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;text-align:center;">
          <p style="margin:0;font-size:32px;">✅</p>
          <h2 style="margin:8px 0 4px;font-family:Georgia,'Times New Roman',serif;
                     font-size:22px;color:${SALON_OSCURO};font-weight:400;">
            ¡Reserva confirmada!
          </h2>
          <p style="margin:0;font-size:13px;color:#999;">Código de reserva</p>
          <p style="margin:6px 0 0;font-size:24px;font-weight:bold;
                    letter-spacing:3px;color:${SALON_COLOR};">
            ${codigo}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.7;">
      Hola <strong>${nombre}</strong>, tu cita en <strong>${SALON_NOMBRE}</strong>
      está confirmada. Aquí tienes el resumen:
    </p>

    <!-- Tabla detalle -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border:1px solid #f0e4ea;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#fdf6f9;">
        <td colspan="2" style="padding:12px 16px;font-size:12px;
                                text-transform:uppercase;letter-spacing:1px;
                                color:#999;font-weight:bold;">
          Detalle de tu cita
        </td>
      </tr>

      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#888;
                   border-top:1px solid #f0e4ea;width:40%;">Profesional</td>
        <td style="padding:12px 16px;font-size:14px;color:${SALON_OSCURO};
                   font-weight:bold;border-top:1px solid #f0e4ea;">${profesional}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#888;
                   border-top:1px solid #f0e4ea;">Fecha</td>
        <td style="padding:12px 16px;font-size:14px;color:${SALON_OSCURO};
                   font-weight:bold;border-top:1px solid #f0e4ea;">${fecha}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#888;
                   border-top:1px solid #f0e4ea;">Hora</td>
        <td style="padding:12px 16px;font-size:14px;color:${SALON_OSCURO};
                   font-weight:bold;border-top:1px solid #f0e4ea;">${hora} hrs</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#888;
                   border-top:1px solid #f0e4ea;">Duración estimada</td>
        <td style="padding:12px 16px;font-size:14px;color:${SALON_OSCURO};
                   font-weight:bold;border-top:1px solid #f0e4ea;">${duracionMin} min</td>
      </tr>

      <!-- Servicios -->
      <tr style="background:#fdf6f9;">
        <td colspan="2" style="padding:12px 16px;font-size:12px;
                                text-transform:uppercase;letter-spacing:1px;
                                color:#999;font-weight:bold;
                                border-top:1px solid #f0e4ea;">
          Servicio${servicios.length > 1 ? "s" : ""}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:4px 16px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${filasServicios}
          </table>
        </td>
      </tr>

      <!-- Total -->
      <tr style="background:#fdf0f5;">
        <td style="padding:14px 16px;font-size:14px;color:${SALON_OSCURO};
                   font-weight:bold;border-top:2px solid #f0d8e8;">Total</td>
        <td style="padding:14px 16px;font-size:18px;color:${SALON_COLOR};
                   font-weight:bold;border-top:2px solid #f0d8e8;">
          ${formatoCLP(totalPrecio)}
        </td>
      </tr>
    </table>

    <!-- Aviso presentar código -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#f0faf4;border-left:4px solid #2d8f5e;
                   padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;color:#1d6b3a;line-height:1.6;">
            <strong>📍 Preséntate en ${SALON_DIR}</strong><br/>
            Guarda tu código <strong>${codigo}</strong> — te lo pediremos al llegar.
            Si necesitas cancelar o reagendar, contáctanos con al menos
            <strong>24 horas de anticipación</strong>.
          </p>
        </td>
      </tr>
    </table>

    ${sep}

    <p style="margin:0;font-size:13px;color:#aaa;text-align:center;line-height:1.6;">
      ¿Tienes dudas? Escríbenos a
      <a href="mailto:${SALON_EMAIL}" style="color:${SALON_COLOR};">${SALON_EMAIL}</a>
      o llámanos al ${SALON_TEL}.
    </p>
  `);

  return {
    subject: `✅ Reserva confirmada · ${codigo} — ${SALON_NOMBRE}`,
    html,
  };
}
