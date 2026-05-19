/* ===========================================================
   imagenes.js - Helper para URLs de imágenes
   Hoy sirve desde /public/images/. Cuando integremos Supabase
   Storage, cambia solo VITE_IMAGENES_BASE en el .env y todo
   el sitio apunta al bucket sin tocar componentes.
   =========================================================== */

const BASE_LOCAL = "/images";
const BASE_REMOTA = import.meta.env.VITE_IMAGENES_BASE;

function base() {
  return BASE_REMOTA && BASE_REMOTA.length > 0 ? BASE_REMOTA : BASE_LOCAL;
}

// urlImagen("servicios", "corte-cabello-dama.webp")
//   → "/images/servicios/corte-cabello-dama.webp" (local)
//   → "https://xxx.supabase.co/storage/v1/object/public/imagenes/servicios/corte-cabello-dama.webp"
//      (cuando se defina VITE_IMAGENES_BASE)
export function urlImagen(carpeta, archivo) {
  return `${base()}/${carpeta}/${archivo}`;
}

// Atajo para servicios
export function imgServicio(archivo) {
  return urlImagen("servicios", archivo);
}

// Atajo para galería antes/después
export function imgAntesDespues(archivo) {
  return urlImagen("antes_despues", archivo);
}
