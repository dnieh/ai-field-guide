import { ChevronDown, ExternalLink } from "lucide-react"
import type { Company, Stat } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function StatCell({ label, v }: { label: string; v: Stat }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <dt className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold tabular break-words">{v?.s || "—"}</dd>
      {v?.d && <dd className="text-muted-foreground mt-0.5 text-xs leading-snug break-words">{v.d}</dd>}
    </div>
  )
}

export function CheckLine({ ok, fixed, open, conf }: { ok: number; fixed: number; open: number; conf?: string | null }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      <span className={cn("size-2 shrink-0 rounded-full", open ? "bg-warn" : "bg-good")} aria-hidden />
      <span>
        {ok} confirmed{fixed ? ` · ${fixed} corrected` : ""}{open ? ` · ${open} open` : ""}
        {conf ? ` · ${conf} confidence` : ""}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h5 className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{title}</h5>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export function CompanyCard({ c, where }: { c: Company; where?: string }) {
  const list = (items?: string[]) =>
    items && items.length ? (
      <ul className="list-disc space-y-1 pl-4">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    ) : null
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle className="text-lg leading-tight">{c.name}</CardTitle>
        <CardDescription className="text-xs">
          {[c.hq, c.founded && `founded ${c.founded}`].filter(Boolean).join(" · ")}
        </CardDescription>
        <CardAction>
          <Badge variant="outline" className="text-muted-foreground font-normal">{c.kindLabel}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-5">
        {where && <p className="text-muted-foreground -mt-2 text-xs">{where}</p>}
        <p className="text-sm leading-relaxed">{c.one}</p>
        {c.flux && <Badge variant="secondary" className="bg-warn/15 text-foreground">{c.flux}</Badge>}
        <dl className="bg-muted/40 grid grid-cols-3 divide-x rounded-lg border">
          <StatCell label="Last round" v={c.round} />
          <StatCell label="Valuation" v={c.val} />
          <StatCell label="Revenue" v={c.rev} />
        </dl>
        <div className="mt-auto space-y-3">
          {c.stage && <p className="text-muted-foreground text-xs"><span className="text-foreground font-medium">Stage:</span> {c.stage}</p>}
          <CheckLine ok={c.fc.ok} fixed={c.fc.fixed} open={c.fc.open.length} conf={c.conf} />
          <Separator />
          <Collapsible>
            <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-medium hover:underline">
              Details &amp; sources
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              {c.leaders && <Section title="Leadership">{c.leaders}</Section>}
              {c.flagship && <Section title="Products">{c.flagship}</Section>}
              {c.status && <Section title="Status">{c.status}</Section>}
              {c.recent && c.recent.length > 0 && <Section title="Recent">{list(c.recent)}</Section>}
              {c.why && <Section title="Why it matters">{c.why}</Section>}
              {c.roundFull && <Section title="Funding detail">{c.roundFull}</Section>}
              {c.revFull && <Section title="Revenue detail">{c.revFull}</Section>}
              {c.fc.open.length > 0 && <Section title="Open fact-check items"><div className="text-muted-foreground">{list(c.fc.open)}</div></Section>}
              {c.flags && c.flags.length > 0 && <Section title="Caveats"><div className="text-muted-foreground">{list(c.flags)}</div></Section>}
              {c.sources && c.sources.length > 0 && (
                <Section title="Sources">
                  <ul className="space-y-1.5">
                    {c.sources.map((s, i) => (
                      <li key={i} className="text-xs leading-snug">
                        <a href={s.u} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline">
                          {s.p || "Source"}<ExternalLink className="size-3" />
                        </a>
                        {s.d && <span className="text-muted-foreground tabular"> · {s.d}</span>}
                        {s.c && <span className="text-muted-foreground"> — {s.c}</span>}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
