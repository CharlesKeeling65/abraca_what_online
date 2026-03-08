import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(process.cwd(), "apps/web"),
  build: {
    outDir: resolve(process.cwd(), "dist/web"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 4173,
  },
});
