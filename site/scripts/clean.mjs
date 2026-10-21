// Remove the previous build from the repository root before Vite writes a new one.
import { rmSync, existsSync } from "node:fs"
import { resolve } from "node:path"
const root = resolve(import.meta.dirname, "..", "..")
for (const p of ["assets", "data", "index.html", "og.png", "favicon.svg"]) {
  const full = resolve(root, p)
  if (existsSync(full)) rmSync(full, { recursive: true, force: true })
}
