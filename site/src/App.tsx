import { useCallback, useEffect, useState } from "react"
import { useGuide } from "@/hooks/use-guide"
import { useHashRoute } from "@/hooks/use-hash-route"
import { useTheme } from "@/hooks/use-theme"
import { AppNav } from "@/components/app-nav"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Overview } from "@/pages/overview"
import { LayerPage } from "@/pages/layer"
import { SearchPage, type Filters } from "@/pages/search"
import { AboutPage } from "@/pages/about"

export default function App() {
  const { data: ix, error } = useGuide()
  const [theme, setTheme] = useTheme()
  const catLayer = useCallback((id: string) => ix?.catById[id]?.layerId, [ix])
  const route = useHashRoute(catLayer)
  const [filters, setFilters] = useState<Filters>({ q: "", layer: "all", cat: "all", kind: "all" })

  useEffect(() => {
    if (!ix) return
    const base = "AI Industry Field Guide"
    document.title =
      route.view === "layer" ? `${ix.layerById[route.layerId].name} · ${base}` :
      route.view === "search" ? `Search · ${base}` :
      route.view === "about" ? `How this was made · ${base}` : base
    if (route.view === "home") window.scrollTo(0, 0)
  }, [route, ix])

  if (error) return <p className="p-6">{error}</p>
  if (!ix) return <p className="text-muted-foreground p-6">Loading the guide…</p>

  const onSearch = (q: string) => {
    setFilters({ q, layer: "all", cat: "all", kind: "all" })
    window.location.hash = "search"
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col lg:flex-row">
        <AppNav ix={ix} route={route} onSearch={onSearch} theme={theme} setTheme={setTheme} />
        <main
          className="min-w-0 flex-1 py-8 lg:py-12"
          style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
        >
          <div className="mx-auto max-w-6xl sm:px-2 lg:px-6">
            {route.view === "home" && <Overview ix={ix} />}
            {route.view === "layer" && <LayerPage ix={ix} layerId={route.layerId} anchor={route.anchor} />}
            {route.view === "search" && <SearchPage ix={ix} filters={filters} setFilters={setFilters} />}
            {route.view === "about" && <AboutPage ix={ix} />}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
