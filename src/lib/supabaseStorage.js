/* ===========================================================
   supabaseStorage.js - Operaciones sobre Supabase Storage
   Bucket "imagenes" (público). Carpetas: servicios/
   =========================================================== */

import { supabase } from "./supabase.js";

const BUCKET = "imagenes";

/* Devuelve la URL pública de un archivo en /servicios/ */
export function urlServicio(imagenPath) {
  if (!imagenPath) return null;
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`servicios/${imagenPath}`);
  return data?.publicUrl ?? null;
}

/* Sube un File al bucket y devuelve el nombre del archivo guardado.
   Lanza error si falla (manejar con try/catch en el caller). */
export async function subirServicio(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const nombre = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`servicios/${nombre}`, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (error) throw error;
  return nombre;
}

/* Elimina un archivo del bucket (falla silenciosa — no bloquea el flujo). */
export async function eliminarServicio(imagenPath) {
  if (!imagenPath) return;
  await supabase.storage
    .from(BUCKET)
    .remove([`servicios/${imagenPath}`]);
}
