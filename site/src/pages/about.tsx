import { useEffect } from "react"
import type { GuideIndex } from "@/hooks/use-guide"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Disclaimer, ISSUES_URL } from "@/components/disclaimer"

export function AboutPage({ ix }: { ix: GuideIndex }) {
  useEffect(() => window.scrollTo(0, 0), [])
  const all = [...ix.guide.companies, ...ix.guide.maps]
  const ok = all.reduce((s, c) => s + c.fc.ok, 0)
  const fixed = all.reduce((s, c) => s + c.fc.fixed, 0)
  const open = all.reduce((s, c) => s + c.fc.open.length, 0)
  const total = ok + fixed + open
  const stats: [string, string][] = [
    [String(ix.guide.stats.companies), "companies"],
    [total.toLocaleString(), "claims re-checked"],
    [`${Math.round((100 * ok) / total)}%`, "confirmed as written"],
    [String(fixed), "found wrong and fixed"],
    [String(open), "open items, labeled"],
  ]
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-8 text-xl font-semibold tracking-tight">{children}</h2>
  return (
    <div className="max-w-3xl space-y-4 leading-relaxed">
      <Badge variant="secondary">How this was made</Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Method, checks and limits</h1>
      <p className="text-muted-foreground text-lg">
        This guide was researched between {ix.guide.researched} by AI research agents (Claude, made by Anthropic) working under a strict
        sourcing rule, then checked by separate fact-checking agents, and compiled and published by Daniel Nieh. It's a snapshot meant
        to orient you, not a live database.
      </p>
      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([v, l]) => (
          <Card key={l} className="gap-1 py-4 shadow-none">
            <CardContent className="px-4">
              <div className="text-2xl font-semibold tabular">{v}</div>
              <div className="text-muted-foreground text-xs">{l}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <H>1. Research from 2026 sources only</H>
      <p>
        No funding round, valuation, revenue figure, executive or deal was stated from an AI model's memory. Each claim needed a page the
        researcher actually opened, recorded with its URL, publisher and date. Company announcements, regulatory filings and major news
        outlets were preferred; estimates from aggregators like Sacra, and blog sources, are labeled as such. When something couldn't be
        verified, the field was left blank.
      </p>
      <H>2. An independent fact-check</H>
      <p>
        A separate agent that hadn't done the research reopened the cited pages and checked each claim: status, funding, valuation,
        revenue, leadership and recent events. Wrong figures were corrected. Claims that couldn't be confirmed were removed or labeled,
        and each profile's colored dot shows whether anything is still open.
      </p>
      <H>3. Editorial review</H>
      <p>
        Category summaries were rewritten after corrections came in. Pending deals are labeled pending, claims that rest on a single weak
        source are labeled or dropped, and web pages that contained hidden text aimed at AI systems were excluded as sources.
      </p>
      <H>Known limits</H>
      <ul className="list-disc space-y-2 pl-5">
        <li><b>A check confirms the source says it, not that the source is right.</b> If a reputable outlet got a number wrong, the error carries through.</li>
        <li><b>Many startup revenue figures are estimates or company claims,</b> not audited numbers.</li>
        <li><b>The fact-checker is the same kind of AI as the researcher,</b> working with a fresh context. That catches misreadings but shares the same blind spots.</li>
        <li><b>Shorter entries</b> rest on one dated source each and got a lighter check.</li>
        <li><b>Coverage is selective.</b> Plenty of real companies are missing, and missing doesn't mean unimportant.</li>
        <li><b>It goes stale.</b> Market caps move daily and private rounds close weekly. Check the latest before relying on any figure.</li>
      </ul>
      <H>Corrections</H>
      <p>
        If you spot something wrong or out of date, please{" "}
        <a href={ISSUES_URL} target="_blank" rel="noopener" className="underline underline-offset-4">open an issue on GitHub</a> with a link to
        a better source.
      </p>
      <p className="text-muted-foreground text-sm">
        Not investment, legal or career advice. Company names and trademarks belong to their owners. Summaries are paraphrased; follow
        the source links for the original reporting.
      </p>
      <Disclaimer updated={ix.guide.updated} />
    </div>
  )
}
