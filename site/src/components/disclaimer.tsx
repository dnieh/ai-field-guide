import { Separator } from "@/components/ui/separator"

export const ISSUES_URL = "https://github.com/dnieh/ai-field-guide/issues"

export function fmtDate(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export function Disclaimer({ updated }: { updated: string }) {
  return (
    <footer className="text-muted-foreground mt-16 max-w-3xl space-y-3 text-sm">
      <Separator />
      <p>
        <span className="text-foreground font-medium">Snapshot as of {fmtDate(updated)}.</span> Figures come from cited public
        sources; estimates and unconfirmed reports are labeled, and some may be wrong or out of date. Not investment advice.
      </p>
      <p>
        Researched with AI agents and independently fact-checked; see{" "}
        <a href="#about" className="text-foreground underline underline-offset-4">How this was made</a>. Spot an error?{" "}
        <a href={ISSUES_URL} target="_blank" rel="noopener" className="text-foreground underline underline-offset-4">Report a correction</a>.
      </p>
    </footer>
  )
}
