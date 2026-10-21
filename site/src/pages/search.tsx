import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { Company, MapEntry } from "@/types"
import { categoryOf, type GuideIndex } from "@/hooks/use-guide"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CompanyCard } from "@/components/company-card"
import { LongTailTable } from "@/components/long-tail-table"
import { Disclaimer } from "@/components/disclaimer"

export interface Filters { q: string; layer: string; cat: string; kind: string }

const KINDS: [string, string][] = [
  ["all", "Any status"], ["private", "Private"], ["public", "Public"], ["division", "Big Tech / product"], ["flux", "Acquired or in flux"],
]

export function SearchPage({ ix, filters, setFilters }: { ix: GuideIndex; filters: Filters; setFilters: (f: Filters) => void }) {
  const [shown, setShown] = useState(60)
  const [q, setQ] = useState(filters.q)
  useEffect(() => setQ(filters.q), [filters.q])
  useEffect(() => {
    const t = setTimeout(() => { if (q !== filters.q) setFilters({ ...filters, q }) }, 150)
    return () => clearTimeout(t)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setShown(60), [filters])
  useEffect(() => window.scrollTo(0, 0), [])

  const where = (x: Company | MapEntry) => {
    const C = categoryOf(ix, x)
    return C ? `${ix.layerById[C.layerId].short} · ${C.title}` : undefined
  }
  const match = (x: Company | MapEntry) => {
    const C = categoryOf(ix, x)
    if (filters.layer !== "all" && (!C || C.layerId !== filters.layer)) return false
    if (filters.cat !== "all" && (!C || C.id !== filters.cat)) return false
    if (filters.kind !== "all" && x.kind !== filters.kind) return false
    if (filters.q) {
      const hay = [x.name, x.one, (x as Company).leaders, (x as Company).flagship, (x as Company).hq, x.status].join(" ").toLowerCase()
      if (!filters.q.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false
    }
    return true
  }
  const deep = useMemo(() => ix.guide.companies.filter(match), [filters, ix]) // eslint-disable-line react-hooks/exhaustive-deps
  const maps = useMemo(() => ix.guide.maps.filter(match), [filters, ix]) // eslint-disable-line react-hooks/exhaustive-deps
  const cats = filters.layer === "all" ? ix.layers.flatMap(L => L.cats) : ix.layerById[filters.layer].cats

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-4">
        <Badge variant="secondary">Search &amp; filter</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a company</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Search names, people, products and places across every layer, then narrow by layer, category or status.
        </p>
      </section>

      <div className="bg-background/95 z-30 md:sticky md:top-[64px] space-y-3 rounded-xl border p-4 shadow-sm backdrop-blur lg:top-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Try “humanoid”, “Sequoia” or a founder's name" className="pl-8" aria-label="Search companies" autoFocus />
          </div>
          <Select value={filters.layer} onValueChange={v => setFilters({ ...filters, layer: v, cat: "all" })}>
            <SelectTrigger className="w-full md:w-56" aria-label="Layer"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All layers</SelectItem>
              {ix.layers.map(L => <SelectItem key={L.id} value={L.id}>{L.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.cat} onValueChange={v => setFilters({ ...filters, cat: v })}>
            <SelectTrigger className="w-full md:w-64" aria-label="Category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {cats.map(C => <SelectItem key={C.id} value={C.id}>{C.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-full overflow-x-auto">
            <ToggleGroup type="single" variant="outline" size="sm" value={filters.kind} onValueChange={v => v && setFilters({ ...filters, kind: v })} aria-label="Status">
              {KINDS.map(([k, t]) => <ToggleGroupItem key={k} value={k} className="flex-none px-3">{t}</ToggleGroupItem>)}
            </ToggleGroup>
          </div>
          <span className="text-muted-foreground text-sm tabular">{deep.length + maps.length} of {ix.guide.stats.companies}</span>
        </div>
      </div>

      {deep.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Detailed profiles <span className="text-muted-foreground font-normal tabular">{deep.length}</span></h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {deep.slice(0, shown).map(c => <CompanyCard key={c.mod + c.id} c={c} where={where(c)} />)}
          </div>
          {deep.length > shown && (
            <Button variant="outline" onClick={() => setShown(s => s + 60)}>Show {Math.min(60, deep.length - shown)} more</Button>
          )}
        </section>
      )}
      {maps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Shorter entries <span className="text-muted-foreground font-normal tabular">{maps.length}</span></h2>
          <LongTailTable rows={maps} whereOf={where} />
        </section>
      )}
      {!deep.length && !maps.length && (
        <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm">No companies match. Try fewer words or clear a filter.</p>
      )}

      <Disclaimer updated={ix.guide.updated} />
    </div>
  )
}
