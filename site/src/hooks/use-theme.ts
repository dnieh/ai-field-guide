import { useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

function read(): Theme {
  try {
    const t = localStorage.getItem("aifg-theme")
    if (t === "light" || t === "dark" || t === "system") return t
  } catch {}
  return "system"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches)
      document.documentElement.classList.toggle("dark", dark)
    }
    apply()
    try { localStorage.setItem("aifg-theme", theme) } catch {}
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [theme])
  return [theme, setTheme] as const
}
