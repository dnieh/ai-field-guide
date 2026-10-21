import { useEffect, useState } from "react"

export type Route =
  | { view: "home" }
  | { view: "layer"; layerId: string; anchor?: string }
  | { view: "search" }
  | { view: "about" }

function parse(hash: string, catLayer: (catId: string) => string | undefined): Route {
  const h = hash.replace(/^#/, "")
  if (/^m[1-5]$/.test(h)) return { view: "layer", layerId: h }
  if (/^c\d-\d+$/.test(h)) {
    const layerId = catLayer(h)
    if (layerId) return { view: "layer", layerId, anchor: h }
  }
  if (h === "search") return { view: "search" }
  if (h === "about") return { view: "about" }
  return { view: "home" }
}

export function useHashRoute(catLayer: (catId: string) => string | undefined) {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash, catLayer))
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash, catLayer))
    on()
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [catLayer])
  return route
}
