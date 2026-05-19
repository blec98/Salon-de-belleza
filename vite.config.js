import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true expone el servidor en la red local (0.0.0.0)
    // equivale a: npm run dev -- --host
    // Así puedes abrir la app desde tu teléfono usando la IP del PC
    host: true,
    port: 5173,
  },
});
