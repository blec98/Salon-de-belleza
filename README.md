# Belleza & Estilo — Aplicación Web SPA

Aplicación Web SPA para el salón de belleza **"Belleza & Estilo"** (Osorno).
Caso de Estudio — INACAP.

## Autor

- **Estudiante:** Bernardo Cárdenas Carrillo
- **Institución:** INACAP
- **GitHub:** https://github.com/blec98

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + pnpm |
| Estilos | CSS3 personalizado + Bootstrap 5 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel (SSR desactivado, SPA estática) |

## Estructura del proyecto

```
belleza-estilo/
├── index.html              Punto de entrada (Vite)
├── database.sql            Schema completo de Supabase (ejecutar en SQL Editor)
├── vite.config.js
├── vercel.json
├── public/
│   ├── favicon.svg
│   └── images/             Imágenes locales de respaldo
└── src/
    ├── App.jsx             Componente raíz (navegación por estado)
    ├── main.jsx
    ├── css/styles.css      Sistema de diseño + dark mode
    ├── data/data.js        Datos estáticos (categorías, promos, FAQ, blog)
    ├── lib/
    │   ├── supabase.js         Cliente Supabase (singleton)
    │   ├── supabaseStorage.js  Helpers para Supabase Storage
    │   └── auth.js             Funciones de autenticación
    └── components/
        ├── Navbar.jsx      Navegación + avatar de usuario + dark mode
        ├── Inicio.jsx      Hero, testimonios, galería, promociones
        ├── Servicios.jsx   Galería con filtros (datos desde Supabase)
        ├── Cotizar.jsx     Cotización individual y paquete personalizado
        ├── Reservar.jsx    Wizard de reserva (integrado con Supabase)
        ├── Blog.jsx        Posts estáticos de tips de belleza
        ├── FAQ.jsx         Preguntas frecuentes (acordeón)
        ├── Auth.jsx        Login y registro
        ├── MiCuenta.jsx    Panel del cliente (perfil + reservas)
        ├── Admin.jsx       Panel de administración completo
        ├── Recuperar.jsx   Recuperación de contraseña
        └── Footer.jsx      Pie de página
```

## Variables de entorno

Crear un archivo `.env` en la raíz con:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Instalación y ejecución local

Requisitos: Node.js 18+ y pnpm.

```bash
pnpm install
pnpm dev
```

El servidor queda disponible en red local (`host: true` en vite.config.js).

## Build y deploy

```bash
pnpm build      # genera dist/
pnpm preview    # previsualiza el build
```

El deploy en Vercel es automático al hacer push a `main`. La configuración `vercel.json` redirige todas las rutas a `index.html` para que la SPA funcione correctamente.

## Base de datos

El archivo `database.sql` contiene el schema completo de Supabase:
extensiones, tipos, tablas, RLS, triggers, funciones, vistas y el bucket de Storage.
Ejecutarlo una sola vez desde el SQL Editor de Supabase.
