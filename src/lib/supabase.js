/* ===========================================================
   supabase.js - Cliente Supabase (singleton)
   Con timeout global de 10s para evitar requests colgadas que
   bloquean la UI (token corrupto en localStorage, red intermitente,
   PostgREST sin responder, etc).
   =========================================================== */

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
}

// Fetch con timeout para que ninguna request quede colgada para siempre
function fetchConTimeout(input, init = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

export const supabase = createClient(url, key, {
  global: { fetch: fetchConTimeout },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
