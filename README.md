# Belleza & Estilo — Aplicación Web SPA

Aplicación Web SPA para el salón de belleza **"Belleza & Estilo"** (Osorno).
Caso de Estudio — INACAP.

## Autor

- **Estudiante:** Bernardo Cárdenas Carrillo
- **Institución:** INACAP
- **GitHub:** https://github.com/blec98

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + pnpm |
| Estilos | CSS3 personalizado + Bootstrap 5 + dark mode |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel (SPA estática) |

## Funcionalidades

- **Catálogo de servicios** con filtros por categoría y búsqueda (datos servidos desde Supabase).
- **Sistema de reservas** integrado con la base de datos (wizard de 6 pasos, slots dinámicos por profesional).
- **Cotizador** individual y por paquetes personalizados.
- **Autenticación completa** (registro con RUT obligatorio anti-multicuenta, login, recuperación de contraseña).
- **Panel del cliente** "Mi Cuenta" con perfil editable e historial de reservas.
- **Panel de administración** con dashboard de KPIs, CRUD de servicios (con upload de imágenes a Supabase Storage), profesionales, clientes y cupones.
- **Blog y FAQ** estáticos.
- **Dark mode** opcional persistente.
- **Responsive** y accesible.

---

## Estructura del proyecto

```
belleza-estilo/
├── index.html              Punto de entrada (Vite)
├── database.sql            Schema completo de Supabase (ejecutar 1 vez en SQL Editor)
├── vite.config.js          Vite (host: true para red local)
├── vercel.json             Rewrite SPA: todas las rutas → index.html
├── public/
│   ├── favicon.svg
│   └── images/             Respaldo local de imágenes
└── src/
    ├── App.jsx             Componente raíz (navegación por useState)
    ├── main.jsx
    ├── css/styles.css      Sistema de diseño con tokens y dark mode
    ├── data/data.js        Datos estáticos (categorías, promos, FAQ, blog, info salón)
    ├── lib/
    │   ├── supabase.js         Cliente Supabase con timeout global de 10s
    │   ├── supabaseStorage.js  Helpers para upload/getPublicUrl de imágenes
    │   └── auth.js             register, login, logout, getPerfil, updatePerfil
    └── components/
        ├── Navbar.jsx      Navegación + avatar de usuario + toggle dark mode
        ├── Inicio.jsx      Hero, MVV, testimonios, galería, promociones
        ├── Servicios.jsx   Galería con filtros, datos desde Supabase
        ├── Cotizar.jsx     Cotización individual y paquete personalizado
        ├── Reservar.jsx    Wizard de reserva (Supabase: profesionales + slots + inserción)
        ├── Blog.jsx        Posts estáticos
        ├── FAQ.jsx         Acordeón de preguntas frecuentes
        ├── Auth.jsx        Login + registro con validación RUT (mod-11) y teléfono +569
        ├── MiCuenta.jsx    Perfil + Mis reservas (con cancelación)
        ├── Admin.jsx       Dashboard, Reservas, Servicios, Profesionales, Clientes, Cupones
        ├── Recuperar.jsx   Recuperación de contraseña vía email
        └── Footer.jsx      Pie de página
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz con:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Ambos valores se obtienen en Supabase → Project Settings → API.

---

## Instalación y ejecución local

### Requisitos previos

#### Node.js 18 o superior

Verificar si ya está instalado:
```bash
node --version
```

Si no lo tienes o tu versión es menor a 18, instalarlo:

- **Windows / macOS:** descargar el instalador LTS desde [nodejs.org](https://nodejs.org/) y ejecutarlo (siguiente → siguiente → finalizar).
- **Windows con winget:**
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
- **macOS con Homebrew:**
  ```bash
  brew install node
  ```
- **Linux (Ubuntu/Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **Multi-versión (recomendado para devs):** usar [nvm](https://github.com/nvm-sh/nvm) (Linux/macOS) o [nvm-windows](https://github.com/coreybutler/nvm-windows):
  ```bash
  nvm install 20
  nvm use 20
  ```

Verificar la instalación con `node --version` (debe mostrar `v18.x` o superior) y `npm --version`.

#### pnpm (gestor de paquetes)

Más rápido y eficiente en disco que npm. Si no lo tienes instalado:

  **Opción 1 — vía npm (la más sencilla):**
  ```bash
  npm install -g pnpm
  ```

  **Opción 2 — vía Corepack (incluido en Node 16.10+):**
  ```bash
  corepack enable pnpm
  ```

  **Opción 3 — Windows con PowerShell:**
  ```powershell
  iwr https://get.pnpm.io/install.ps1 -useb | iex
  ```

  Verificar con `pnpm --version`.

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/blec98/Salon-de-belleza.git
cd Salon-de-belleza

# 2. Instalar dependencias
pnpm install

# 3. Crear archivo .env en la raíz con las claves de Supabase
#    (ver sección "Variables de entorno" arriba)

# 4. Levantar el servidor de desarrollo
pnpm dev
```

El servidor queda disponible en red local (`host: true`), por lo que se puede acceder desde un teléfono en la misma WiFi.

> **Nota:** si prefieres usar `npm` o `yarn` en lugar de `pnpm`, los comandos son equivalentes: `npm install`/`npm run dev` o `yarn`/`yarn dev`. Aunque el proyecto fue desarrollado con pnpm y el `pnpm-lock.yaml` garantiza versiones exactas.

## Build y deploy

```bash
pnpm build      # genera dist/
pnpm preview    # previsualiza el build localmente
```

El deploy en Vercel es automático al hacer push a `main`. La configuración `vercel.json` redirige todas las rutas a `index.html` para que la SPA funcione correctamente.

---

## Setup de Supabase (primera vez)

1. **Crear proyecto** en https://supabase.com.
2. **Ejecutar `database.sql`** completo desde el SQL Editor. Crea extensiones, tipos, tablas, RLS, triggers, funciones, views, el bucket de Storage y los REVOKE de funciones internas.
3. **Authentication → Settings:**
   - Activar *Enable email confirmations*.
   - Activar *Leaked password protection*.
   - En *URL Configuration* agregar el dominio de producción y `http://localhost:5173/**` para desarrollo.
4. **Storage → bucket `imagenes` → carpeta `servicios/`:** subir los archivos `.webp` cuyos nombres coincidan con la columna `imagen_path` de la tabla `servicios`.
5. **Crear el primer admin:** registrarse desde la web, confirmar el correo y ejecutar:
   ```sql
   update public.perfiles set rol = 'admin' where email = 'tu@correo.com';
   ```

---

## Seguridad

- **RLS habilitada** en todas las tablas (`perfiles`, `reservas`, `servicios`, `cupones`, etc.).
- **RUT inmutable** por trigger `fn_perfiles_inmutables` + constraint `unique`.
- **Tabla auxiliar `ruts_registrados`** con lectura pública para validación pre-registro.
- **Views admin** con `security_invoker = true` para respetar RLS del usuario que consulta.
- **Funciones con `SET search_path = public, pg_catalog`** (mitiga search-path injection).
- **REVOKE EXECUTE** en funciones internas (`fn_es_admin`, `fn_slot_*`, etc.) para que no sean callable vía RPC pública.
- **Bucket público sin policy SELECT** (los archivos son accesibles por URL directa pero no listables).
- **Cliente Supabase con timeout** global de 10s para evitar requests colgadas.
- **Validación RUT** chileno con algoritmo mod-11 antes de enviar al backend.
