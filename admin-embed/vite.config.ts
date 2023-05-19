import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/admin",
  plugins: [react()],
  server: {
    port: 5174,
  },
  envDir: "../",
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(
      process.env.npm_package_version
    ),
    "import.meta.env.VITE_TRUFFLE_VERSION": JSON.stringify(
      packageJson.dependencies["@trufflehq/sdk"]
    ),
  },
  build: {
    outDir: "../hosting/embed/admin",
    emptyOutDir: true,
  },
});
