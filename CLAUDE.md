# Pendientes del Proyecto — Belleza & Estilo

Guía de trabajo para continuar el desarrollo desde tu terminal con
**Claude Code**. Este documento describe todo lo que falta para
completar la integración de **Supabase** (base de datos) y **Resend**
(notificaciones por correo).

---

## Estado actual del proyecto

Lo que **ya está hecho** y funcionando:

- Aplicación web SPA en **React 18 + Vite**
- Gestor de paquetes **pnpm 11** configurado (`pnpm-workspace.yaml`
  con `allowBuilds: esbuild: true`)
- Secciones completas: Inicio, Servicios, Cotizar (servicio individual
  con cálculo automático + paquete personalizado), Footer
- Diseño responsive con Bootstrap 5
- Datos del estudiante integrados (footer, inicio, README)
- Configuración lista para desplegar en Vercel (`vercel.json`)
- `pnpm install`, `pnpm dev` y `pnpm build` verificados sin errores

Lo que **falta** (objeto de esta guía):

1. Crear cuenta y proyecto en Supabase
2. Crear las tablas y políticas de seguridad (RLS)
3. Crear cuenta en Resend y obtener API key
4. Crear cuenta de Gmail para recibir las notificaciones
5. Integrar Supabase en el frontend
6. Crear la función serverless para enviar correos con Resend
7. Conectar los formularios (paquete + cotización individual)
8. Configurar variables de entorno (local y en Vercel)
9. Subir a GitHub y desplegar en Vercel
10. Grabar el video demostrativo

---

## Arquitectura objetivo

```
Formulario React
   │
   ├─→ Supabase JS (anon key, segura en frontend) → PostgreSQL
   │
   └─→ POST /api/send-email (Vercel Function) → Resend → Gmail del salón
                            ↑
        (RESEND_API_KEY vive aquí, en el servidor, nunca en el frontend)
```

Dos piezas independientes: Supabase persiste el registro; una función
serverless envía el correo. Si una falla, la otra puede seguir
funcionando (manejar el error con gracia).

---

## PASO 1 — Crear cuenta de Gmail del salón

Esta cuenta recibirá las notificaciones y servirá para registrar Resend.

1. Crea un Gmail gratuito (capa de usuario, no Workspace).
   Sugerencia de nombre: `contacto.bellezayestilo@gmail.com`
   (o `contacto.bellezayestilo.cl@gmail.com` si el anterior no
   está disponible).
2. Guarda las credenciales en un lugar seguro.
3. Este correo se usará en los pasos 3 y 6.

---

## PASO 2 — Crear proyecto en Supabase

1. Entra a https://supabase.com → "Start your project"
   (puedes registrarte con tu cuenta de GitHub).
2. "New project":
   - **Name:** `salon-belleza-estilo`
   - **Database Password:** genera una segura y guárdala
   - **Region:** South America (São Paulo) — la más cercana a Chile
3. Espera ~2 minutos a que se provisione.
4. Ve a **Settings → API** y copia:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon / public key** (cadena larga que empieza con `eyJ...`)

> La anon key es segura de exponer en el frontend. Su seguridad se
> controla con las políticas RLS del PASO 3.

---

## PASO 3 — Crear tablas y seguridad en Supabase

En el panel de Supabase → **SQL Editor** → "New query", pega y ejecuta
el siguiente SQL:

```sql
-- Tabla para cotizaciones de servicio individual
create table cotizaciones_servicio (
  id uuid primary key default gen_random_uuid(),
  servicios jsonb not null,
  total integer not null,
  creado_en timestamptz default now()
);

-- Tabla para solicitudes de paquete personalizado
create table solicitudes_paquete (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  telefono text not null,
  mensaje text not null,
  creado_en timestamptz default now()
);

-- Activar Row Level Security en ambas tablas
alter table cotizaciones_servicio enable row level security;
alter table solicitudes_paquete enable row level security;

-- Política: permitir INSERT público (cualquiera puede enviar)
-- pero NO SELECT (nadie puede leer registros desde el frontend)
create policy "permitir_insert_publico_cotizaciones"
  on cotizaciones_servicio for insert
  to anon
  with check (true);

create policy "permitir_insert_publico_paquetes"
  on solicitudes_paquete for insert
  to anon
  with check (true);
```

> **Importante:** Solo se crea política de INSERT. Sin política de
> SELECT, nadie puede leer las cotizaciones desde el frontend con la
> anon key — solo tú, desde el panel de Supabase. Esto es lo que hace
> segura la clave pública.

Para ver las solicitudes recibidas: panel de Supabase → **Table
Editor** → selecciona la tabla.

---

## PASO 4 — Crear cuenta en Resend

1. Entra a https://resend.com → regístrate con el Gmail del PASO 1.
2. Ve a **API Keys** → "Create API Key":
   - **Name:** `salon-belleza-estilo`
   - **Permission:** Sending access
3. Copia la API key (empieza con `re_...`).
   **Guárdala de forma segura — no la subas a GitHub ni la pegues
   en el código.**

### Modo de envío

- **Modo prueba (recomendado para la entrega):** sin verificar
  dominio, Resend solo permite enviar desde `onboarding@resend.dev`
  y **solo hacia el correo con el que te registraste** (el Gmail
  del PASO 1). Suficiente para el video y el caso de estudio.
- **Producción (opcional, después):** verificar un dominio propio
  en Resend → Domains, agregando registros DNS. Permite enviar a
  cualquier correo desde `cotizaciones@tudominio.cl`.

---

## PASO 5 — Integrar Supabase en el frontend

Con Claude Code, desde la raíz del proyecto:

```bash
# Instalar el cliente de Supabase
pnpm add @supabase/supabase-js
```

Crear el archivo `src/lib/supabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

> Pídele a Claude Code: "Crea el cliente de Supabase en
> src/lib/supabase.js leyendo las variables de entorno VITE_".

---

## PASO 6 — Crear la función serverless de correo (Resend)

Crear `api/send-email.js` en la raíz del proyecto (Vercel detecta
la carpeta `/api` automáticamente):

```javascript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { tipo, datos } = req.body;

    const asunto =
      tipo === "paquete"
        ? "Nueva solicitud de paquete personalizado"
        : "Nueva cotización de servicios";

    await resend.emails.send({
      from: "Belleza & Estilo <onboarding@resend.dev>",
      to: process.env.CORREO_SALON,
      subject: asunto,
      text: JSON.stringify(datos, null, 2),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

```bash
# Instalar Resend
pnpm add resend
```

> Pídele a Claude Code: "Crea la función serverless api/send-email.js
> con Resend, que reciba tipo y datos por POST y arme un correo legible
> en HTML según el tipo (paquete o cotización)."
> Mejora sugerida: que el cuerpo del correo sea HTML formateado, no
> JSON crudo.

---

## PASO 7 — Conectar los formularios

Modificar `src/components/Cotizar.jsx`:

- **CotizarPaquete:** al enviar (tras validar), antes de mostrar el
  mensaje de éxito:
  1. `INSERT` en la tabla `solicitudes_paquete` vía Supabase
  2. `fetch("/api/send-email", ...)` con `tipo: "paquete"`
  3. Mostrar el mensaje de confirmación existente
  4. Manejar errores sin romper la experiencia (si falla el correo
     pero guardó en BD, igual confirmar al usuario)

- **CotizarServicio:** al pulsar "Solicitar cotización":
  1. `INSERT` en `cotizaciones_servicio` (servicios + total)
  2. `fetch("/api/send-email", ...)` con `tipo: "servicio"`
  3. Mostrar el resumen existente

> Pídele a Claude Code: "Integra Supabase y la llamada a /api/send-email
> en los dos formularios de Cotizar.jsx, con manejo de errores y
> estados de carga (botón deshabilitado mientras envía)."

---

## PASO 8 — Variables de entorno

### Local (desarrollo)

Crear `.env` en la raíz (este archivo NO se sube a GitHub):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Verifica que `.env` esté en `.gitignore` (agrégalo si no está).

> La RESEND_API_KEY y CORREO_SALON NO van en `.env` local porque
> la función serverless solo corre en Vercel. Para probar el correo
> en local se necesita `vercel dev` (ver nota al final).

### En Vercel (producción)

En el dashboard de Vercel → tu proyecto → **Settings → Environment
Variables**, agregar:

| Variable | Valor | Notas |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Pública |
| `VITE_SUPABASE_ANON_KEY` | anon key de Supabase | Pública (segura con RLS) |
| `RESEND_API_KEY` | API key de Resend (`re_...`) | **SECRETA** |
| `CORREO_SALON` | El Gmail del PASO 1 | Destinatario de avisos |

---

## PASO 9 — Subir a GitHub y desplegar

```bash
# Si aún no inicializaste git
git init
git add .
git commit -m "Proyecto base SPA + integración Supabase y Resend"
git branch -M main
git remote add origin https://github.com/blec98/NOMBRE_DEL_REPO.git
git push -u origin main
```

Verifica antes del push que NO se suba:
- `.env` (debe estar en `.gitignore`)
- `node_modules/`, `dist/`

En Vercel:
1. "Add New Project" → importa el repo de GitHub
2. Framework Preset: **Vite** (autodetectado)
3. Install Command: `pnpm install` (autodetectado por `pnpm-lock.yaml`)
4. Build Command: `pnpm build`
5. Output Directory: `dist`
6. Agrega las 4 variables de entorno del PASO 8
7. Deploy

---

## PASO 10 — Video demostrativo (ítem 9, 10 pts)

- Máximo 2 minutos
- Grabación de pantalla + webcam en miniatura (para identificarte)
- Mostrar: navegación SPA, servicios, cotización con cálculo
  automático, envío de paquete, y opcionalmente el registro
  llegando a Supabase y el correo en Gmail
- Explicar brevemente las funcionalidades

---

## Comandos útiles de referencia

```bash
pnpm install        # instalar dependencias
pnpm dev            # servidor local (expone red para el teléfono)
pnpm build          # build de producción
pnpm preview        # previsualizar el build

# Para probar la función serverless de correo en local:
pnpm add -g vercel  # o: npm i -g vercel
vercel dev          # corre el proyecto + funciones /api localmente
```

---

## Orden recomendado de ejecución

1. PASO 1 (Gmail) → PASO 2 (Supabase) → PASO 3 (tablas/RLS)
2. PASO 4 (Resend)
3. PASO 5, 6, 7 (código — aquí Claude Code hace el trabajo pesado)
4. PASO 8 (variables, primero local para probar)
5. Probar todo en local con `pnpm dev` (Supabase ya funciona)
   y `vercel dev` (para probar el correo)
6. PASO 9 (GitHub + Vercel)
7. Probar en la URL pública de Vercel
8. PASO 10 (video)

---

## Consejos al trabajar con Claude Code

- Trabaja un PASO a la vez; verifica antes de avanzar.
- Pídele que ejecute `pnpm dev` y revise errores tras cada cambio.
- Antes de tocar `Cotizar.jsx`, pídele que lo lea completo para
  no romper la lógica de cálculo existente.
- Mantén las claves fuera del código: solo en `.env` (local) y
  en variables de entorno de Vercel.
- Haz commits pequeños y frecuentes por si necesitas revertir.