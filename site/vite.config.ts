import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Builds straight into the repository root, which GitHub Pages serves from `main` / `(root)`.
export default defineConfig({
  base: "./",
  define: { __BUILD_ID__: JSON.stringify(Date.now().toString(36)) },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { outDir: "..", emptyOutDir: false, assetsDir: "assets" },
})
