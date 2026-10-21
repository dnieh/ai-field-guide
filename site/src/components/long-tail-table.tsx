import type { MapEntry } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function Dot({ open, tip }: { open: boolean; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className={cn("inline-block size-2 shrink-0 rounded-full", open ? "bg-warn" : "bg-good")} aria-label={tip} />
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  )
}

export function LongTailTable({ rows, whereOf }: { rows: MapEntry[]; whereOf?: (m: MapEntry) => string | undefined }) {
  return (
    <div className="bg-card rounded-xl border">
      {/* Phone: stacked list */}
      <ul className="divide-y md:hidden">
        {rows.map(m => {
          const open = m.fc.open.length > 0
          return (
            <li key={m.mod + m.id} className="space-y-1.5 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium">{m.name}</span>
                <Badge variant="outline" className="text-muted-foreground font-normal">{m.kindLabel}</Badge>
              </div>
              {whereOf?.(m) && <p className="text-muted-foreground text-xs">{whereOf(m)}</p>}
              {m.one && <p className="text-muted-foreground text-sm">{m.one}</p>}
              <p className="text-xs tabular">{m.round || "—"}{m.val ? ` · val. ${m.val}` : ""}</p>
              <div className="flex items-center gap-2 text-xs">
                <Dot open={open} tip={open ? m.fc.open.join(" | ") : "Checked against its source"} />
                {m.src?.u ? <a href={m.src.u} target="_blank" rel="noopener" className="underline-offset-4 hover:underline">{m.src.p || "Source"}</a> : null}
                {m.src?.d && <span className="text-muted-foreground tabular">{m.src.d}</span>}
              </div>
            </li>
          )
        })}
      </ul>
      {/* Tablet and up: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Company</TableHead>
              <TableHead>Last round</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(m => {
              const open = m.fc.open.length > 0
              return (
                <TableRow key={m.mod + m.id}>
                  <TableCell className="max-w-[28rem] pl-4 align-top whitespace-normal">
                    <div className="font-medium">{m.name}</div>
                    {whereOf?.(m) && <div className="text-muted-foreground text-xs">{whereOf(m)}</div>}
                    {m.one && <div className="text-muted-foreground mt-0.5 text-sm">{m.one}</div>}
                  </TableCell>
                  <TableCell className="align-top text-xs whitespace-normal tabular">
                    {m.round || "—"}
                    {m.val && <div className="text-muted-foreground">val. {m.val}</div>}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline" className="text-muted-foreground font-normal">{m.kindLabel}</Badge>
                  </TableCell>
                  <TableCell className="pr-4 align-top text-xs whitespace-normal">
                    <div className="flex items-center gap-2">
                      <Dot open={open} tip={open ? m.fc.open.join(" | ") : "Checked against its source"} />
                      {m.src?.u ? <a href={m.src.u} target="_blank" rel="noopener" className="underline-offset-4 hover:underline">{m.src.p || "Source"}</a> : "—"}
                    </div>
                    {m.src?.d && <div className="text-muted-foreground mt-0.5 pl-4 tabular">{m.src.d}</div>}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
