/* ===========================================================
   auth.js - Funciones de autenticación con Supabase Auth
   =========================================================== */

import { supabase } from "./supabase.js";

/* ── REGISTRO ─────────────────────────────────────────────── */
export async function register({ nombre, apellido, email, password, telefono, rut }) {
  // Verificar que el RUT no esté ya registrado
  if (rut) {
    const { data: rutExistente } = await supabase
      .from("ruts_registrados")
      .select("rut")
      .eq("rut", rut)
      .maybeSingle();

    if (rutExistente) {
      return { ok: false, error: "Ya existe una cuenta registrada con ese RUT." };
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, apellido, telefono: telefono || null, rut: rut || null },
    },
  });

  if (error) return { ok: false, error: traducirError(error.message) };
  return { ok: true, user: data.user };
}

/* ── LOGIN ────────────────────────────────────────────────── */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ok: false, error: traducirError(error.message) };

  // Verificar que no está baneado
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, activo, nombre, apellido")
    .eq("id", data.user.id)
    .single();

  if (perfil && !perfil.activo) {
    await supabase.auth.signOut();
    return { ok: false, error: "Tu cuenta ha sido suspendida. Contáctanos para más información." };
  }

  return { ok: true, user: data.user, perfil };
}

/* ── LOGOUT ───────────────────────────────────────────────── */
export async function logout() {
  await supabase.auth.signOut();
}

/* ── PERFIL ───────────────────────────────────────────────── */
export async function getPerfil(userId) {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function updatePerfil(userId, updates) {
  const { error } = await supabase
    .from("perfiles")
    .update(updates)
    .eq("id", userId);

  return { ok: !error, error: error ? traducirError(error.message) : null };
}

/* ── HELPER: traducir errores de Supabase al español ─────── */
function traducirError(msg) {
  if (!msg) return "Error desconocido.";
  if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (msg.includes("Email not confirmed"))       return "Debes confirmar tu correo antes de ingresar.";
  if (msg.includes("User already registered"))   return "Ya existe una cuenta con ese correo.";
  if (msg.includes("Password should be"))        return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("Unable to validate"))        return "Sesión expirada. Inicia sesión nuevamente.";
  if (msg.includes("rate limit"))                return "Demasiados intentos. Espera unos minutos.";
  return msg;
}
