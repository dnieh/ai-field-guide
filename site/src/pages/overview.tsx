import { ArrowRight, ExternalLink } from "lucide-react"
import type { GuideIndex } from "@/hooks/use-guide"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Disclaimer, fmtDate } from "@/components/disclaimer"

export function Overview({ ix }: { ix: GuideIndex }) {
  const g = ix.guide
  return (
    <div className="space-y-12">
      <section className="max-w-3xl space-y-4">
        <Badge variant="secondary">Overview</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">The AI industry, mapped layer by layer</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          A reference guide to {g.stats.companies} AI companies, from the chips and data centers at the bottom of the stack to the
          labs that train models, the tools developers use, the products people buy and the robots that act in the physical world.
          Every figure links to its source, and a separate pass re-checked the claims.
        </p>
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm tabular">
          <span><b className="text-foreground">{g.stats.deep}</b> detailed profiles</span>
          <span><b className="text-foreground">{g.stats.maps}</b> shorter entries</span>
          <span><b className="text-foreground">{g.stats.checks.toLocaleString()}</b> facts re-checked</span>
          <span>Snapshot as of <b className="text-foreground">{fmtDate(g.updated)}</b></span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">The stack, bottom to top</h2>
          <p className="text-muted-foreground text-sm">Open a layer to browse it</p>
        </div>
        <div className="grid gap-3">
          {ix.layers.map(L => (
            <a key={L.id} href={`#${L.id}`} className="group block rounded-xl focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]">
              <Card className="relative gap-2 overflow-hidden py-5 transition-colors group-hover:border-foreground/20">
                <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: `var(--layer-${L.id})` }} aria-hidden />
                <CardHeader className="pl-7">
                  <p className="text-muted-foreground text-xs font-medium tabular">Layer {L.index} · {L.count} companies</p>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {L.name}
                    <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                  </CardTitle>
                  <CardDescription className="text-sm">{L.what}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5 pl-7">
                  {L.cats.map(C => <Badge key={C.id} variant="secondary" className="font-normal">{C.title}</Badge>)}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card className="bg-muted/40 gap-2 py-5 shadow-none">
          <CardHeader><CardDescription className="text-xs font-medium uppercase tracking-wide">Money flowing down</CardDescription></CardHeader>
          <CardContent className="text-sm leading-relaxed">
            Hyperscalers keep raising their AI data-center spending: Amazon guides about $220B for 2026 and Alphabet $195–205B. Most of it
            ends up with chip, memory and power suppliers.
          </CardContent>
        </Card>
        <Card className="bg-muted/40 gap-2 py-5 shadow-none">
          <CardHeader><CardDescription className="text-xs font-medium uppercase tracking-wide">Revenue flowing up</CardDescription></CardHeader>
          <CardContent className="text-sm leading-relaxed">
            The two largest labs each run at roughly $65–70B a year. One layer up, coding tools and inference platforms passed $1B
            run-rates, and vertical apps like Harvey and EliseAI reached hundreds of millions.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Things that are true right now</h2>
          <p className="text-muted-foreground text-sm">Each links to its source</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {g.facts.map((f, i) => (
            <Card key={i} className="gap-3 py-4">
              <CardContent className="space-y-3 px-5 text-sm leading-relaxed">
                <p>{f.note}</p>
                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="tabular">{f.date}</span>
                  <a href={f.url} target="_blank" rel="noopener" className="hover:text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline">
                    {f.pub}<ExternalLink className="size-3" />
                  </a>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">How to read a company profile</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["The numbers", "Last round, valuation and revenue, each with the month it was reported. Startup revenue is usually a run-rate (current month × 12), not a full year. Public companies show market cap and the latest quarter instead."],
            ["Labels", "Estimates (for example from Sacra) and unconfirmed reports are labeled where they appear. “Pending” means a deal was agreed but hadn't closed when this was researched."],
            ["The check mark", "A green dot means every checked claim matched its source. Amber means at least one figure conflicts between sources or couldn't be confirmed; “Details & sources” lists what's open."],
          ].map(([t, d]) => (
            <Card key={t} className="gap-2 py-5 shadow-none">
              <CardHeader><CardTitle className="text-base">{t}</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed">{d}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Disclaimer updated={g.updated} />
    </div>
  )
}
