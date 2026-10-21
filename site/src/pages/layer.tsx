import { useEffect } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import type { GuideIndex } from "@/hooks/use-guide"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { CompanyCard } from "@/components/company-card"
import { LongTailTable } from "@/components/long-tail-table"
import { Disclaimer } from "@/components/disclaimer"

export function LayerPage({ ix, layerId, anchor }: { ix: GuideIndex; layerId: string; anchor?: string }) {
  const L = ix.layerById[layerId]
  const deepN = L.cats.reduce((s, C) => s + C.deep.length, 0)
  const mapN = L.cats.reduce((s, C) => s + C.maps.length, 0)

  useEffect(() => {
    if (anchor) {
      const el = document.getElementById(anchor)
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }))
    } else window.scrollTo(0, 0)
  }, [layerId, anchor])

  return (
    <div className="space-y-10">
      <section className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ background: `var(--layer-${L.id})` }} />
          <span className="text-muted-foreground text-sm font-medium tabular">Layer {L.index} · {deepN + mapN} companies</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{L.name}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">{L.intro}</p>
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm tabular">
          <span><b className="text-foreground">{deepN}</b> detailed profiles</span>
          <span><b className="text-foreground">{mapN}</b> shorter entries</span>
          <span><b className="text-foreground">{L.cats.length}</b> categories</span>
        </div>
      </section>

      <nav className="flex flex-wrap gap-2" aria-label="Categories">
        {L.cats.map(C => (
          <Badge key={C.id} asChild variant="outline" className="px-2.5 py-1 text-[13px] font-normal">
            <a href={`#${C.id}`}>{C.title}</a>
          </Badge>
        ))}
      </nav>

      {L.cats.map((C, i) => (
        <section key={C.id} id={C.id} className="scroll-mt-20 space-y-6 lg:scroll-mt-6">
          {i > 0 && <Separator className="mb-10" />}
          <div className="max-w-3xl space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">{C.title}</h2>
            <p className="leading-relaxed">{C.overview}</p>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">What's happening</p>
              <ul className="space-y-2">
                {C.happening.map((h, k) => (
                  <li key={k} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full" style={{ background: `var(--layer-${L.id})` }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {C.deep.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {C.deep.map(c => <CompanyCard key={c.id} c={c} />)}
            </div>
          )}

          {C.maps.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-base font-semibold">Also in this category</h3>
                <span className="text-muted-foreground text-xs">Shorter entries · one dated source each</span>
              </div>
              <LongTailTable rows={C.maps} />
            </div>
          )}

          {C.notes.length > 0 && (
            <Collapsible className="max-w-4xl">
              <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium">
                Sourced data points ({C.notes.length})
                <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  {C.notes.map((n, k) => (
                    <li key={k} className="border-l-2 pl-3">
                      {n.note}{" "}
                      <a href={n.url} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline">
                        {n.pub}<ExternalLink className="size-3" />
                      </a>{" "}
                      <span className="text-muted-foreground text-xs tabular">{n.date}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}
        </section>
      ))}

      <Disclaimer updated={ix.guide.updated} />
    </div>
  )
}
