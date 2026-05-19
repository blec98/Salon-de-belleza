# Belleza & Estilo — Aplicación Web SPA

Aplicación Web SPA para el salón de belleza **"Belleza & Estilo"** (Osorno).
Caso de Estudio 1 — INACAP.

## Autor

- **Estudiante:** Bernardo Cárdenas Carrillo
- **Institución:** INACAP
- **GitHub:** https://github.com/blec98

## Tecnologías utilizadas

- **React 18** — Framework JavaScript para la SPA
- **Vite** — Bundler y servidor de desarrollo
- **pnpm** — Gestor de paquetes (rápido y seguro)
- **HTML5** — Estructura
- **CSS3** — Estilos personalizados (`src/css/styles.css`)
- **JavaScript (ES6+)** — Lógica de la aplicación
- **Bootstrap 5** — Framework responsive y componentes UI

## Estructura del proyecto

```
belleza-estilo/
├── index.html              Punto de entrada (Vite)
├── package.json            Dependencias y scripts
├── vite.config.js          Configuración de Vite (host habilitado)
├── vercel.json             Configuración de despliegue (SPA)
├── public/
│   └── images/             Imágenes estáticas
└── src/
    ├── main.jsx            Arranque de React
    ├── App.jsx             Componente raíz (navegación SPA)
    ├── css/
    │   └── styles.css      Estilos personalizados
    ├── data/
    │   └── data.js         Datos: servicios, promos, info salón
    └── components/         Componentes de React
        ├── Navbar.jsx      Menú de navegación
        ├── Inicio.jsx      Sección Inicio (hero, MVV, promos)
        ├── Servicios.jsx   Galería de servicios
        ├── Cotizar.jsx     Cotización individual + paquete
        └── Footer.jsx      Pie de página
```

## Instalación y ejecución local

Requisitos: Node.js 18+ y **pnpm** (gestor de paquetes elegido por
seguridad y eficiencia en disco).

> ¿No tienes pnpm? Instálalo con: `npm install -g pnpm`
> o vía corepack: `corepack enable pnpm`

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar servidor de desarrollo
pnpm dev
```

**Nota de seguridad (pnpm 11):** pnpm bloquea por defecto los scripts
post-instalación de las dependencias para prevenir ataques de cadena
de suministro (`strictDepBuilds` activo por defecto desde pnpm 11).
Este proyecto incluye un archivo **`pnpm-workspace.yaml`** que aprueba
explícitamente solo el paquete necesario:

```yaml
allowBuilds:
  esbuild: true
```

`esbuild` es usado internamente por Vite y su build es legítimo. Al
estar declarado ahí, `pnpm install` lo aprueba automáticamente sin
pedir confirmación interactiva — y solo ese paquete, manteniendo el
resto bloqueado por seguridad. No necesitas ejecutar
`pnpm approve-builds` manualmente.

> Si prefieres revisarlo tú: borra `pnpm-workspace.yaml`, corre
> `pnpm install` y luego `pnpm approve-builds` para aprobar esbuild
> de forma interactiva. El resultado es el mismo.

El proyecto está configurado con `host: true` en `vite.config.js`,
por lo que `pnpm dev` **ya expone el servidor en la red local**.
La terminal mostrará dos direcciones:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.X:5173/   ← usar esta desde el teléfono
```

### Probar el responsive desde el teléfono

1. PC y teléfono deben estar en la **misma red WiFi**.
2. Ejecuta `pnpm dev`.
3. En el navegador del teléfono abre la dirección **Network**
   que aparece en la terminal (ej: `http://192.168.1.X:5173/`).
4. Si no carga, permite el acceso en el **firewall** de tu PC
   (Windows pregunta la primera vez; permitir en redes privadas).

> Equivale a `npm run dev -- --host`. También puedes forzarlo así
> si lo prefieres: `pnpm dev -- --host`

## Build de producción

```bash
pnpm build      # genera la carpeta dist/
pnpm preview    # previsualiza el build localmente
```

## Despliegue en Vercel

1. Sube este proyecto a un repositorio de GitHub
   (incluye el `pnpm-lock.yaml` que se genera con `pnpm install`).
2. En https://vercel.com → "Add New Project" → importa el repo.
3. Vercel detecta Vite y el `pnpm-lock.yaml` automáticamente,
   usando pnpm como gestor. Configuración:
   - **Framework Preset:** Vite
   - **Install Command:** `pnpm install` (autodetectado)
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
4. "Deploy". En ~1 minuto tendrás la URL pública.

> Nota: en Vercel, el archivo `pnpm-workspace.yaml` con
> `allowBuilds: { esbuild: true }` permite que esbuild se compile
> sin aprobación interactiva (Vercel no tiene terminal interactiva).
> Por eso es importante que ese archivo se suba al repositorio.

El archivo `vercel.json` ya incluye el rewrite necesario para
que la SPA funcione correctamente al recargar.

## Funcionalidades

- **SPA**: navegación entre Inicio / Servicios / Cotizar sin recargar.
- **Inicio**: imagen destacada, misión/visión/valores y promociones.
- **Servicios**: galería con imagen, descripción y precio.
- **Cotizar servicio individual**: selección múltiple, cantidad,
  cálculo automático del total y resumen.
- **Cotizar paquete personalizado**: formulario validado con
  mensaje de confirmación.
- **Footer**: información del salón, links rápidos, redes sociales,
  ubicación y sitios de referencia.
- **Responsive**: adaptable a móviles, tablets y escritorio.
