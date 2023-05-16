import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/visualizer",
  plugins: [react()],
  server: {
    port: 5175,
  },
  build: {
    outDir: "../hosting/results/visualizer",
  },
  envDir: "../",
});
