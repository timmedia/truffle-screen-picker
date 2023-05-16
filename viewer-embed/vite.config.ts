import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/viewer",
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "../hosting/embed/viewer",
    emptyOutDir: true,
  },
  envDir: "../",
});
