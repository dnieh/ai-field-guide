import { useState } from "react"
import { BookOpen, Home, Menu, Moon, Search, Sun, SunMoon } from "lucide-react"
import type { GuideIndex } from "@/hooks/use-guide"
import type { Route } from "@/hooks/use-hash-route"
import type { Theme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ISSUES_URL } from "@/components/disclaimer"
import { cn } from "@/lib/utils"

interface NavProps {
  ix: GuideIndex
  route: Route
  onSearch: (q: string) => void
  theme: Theme
  setTheme: (t: Theme) => void
  onNavigate?: () => void
}

function NavLink({ href, active, children, onClick }: { href: string; active: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </a>
  )
}

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const next: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" }
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon
  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"
  return (
    <Button variant="ghost" size="sm" className="text-muted-foreground justify-start px-2.5" onClick={() => setTheme(next[theme])}>
      <Icon /> Theme: {label}
    </Button>
  )
}

function NavBody({ ix, route, onSearch, theme, setTheme, onNavigate }: NavProps) {
  const [q, setQ] = useState("")
  const activeLayer = route.view === "layer" ? route.layerId : null
  return (
    <div className="flex h-full flex-col gap-5">
      <form
        role="search"
        onSubmit={e => { e.preventDefault(); onSearch(q.trim()); onNavigate?.() }}
        className="relative"
      >
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${ix.guide.stats.companies} companies…`} className="pl-8" aria-label="Search all companies" />
      </form>
      <nav className="flex flex-col gap-0.5" aria-label="Guide">
        <NavLink href="#" active={route.view === "home"} onClick={onNavigate}><Home className="size-4" /> Overview</NavLink>
        <p className="text-muted-foreground mt-4 mb-1 px-2.5 text-xs font-medium">The stack, bottom to top</p>
        {ix.layers.map(L => (
          <div key={L.id}>
            <NavLink href={`#${L.id}`} active={activeLayer === L.id} onClick={onNavigate}>
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: `var(--layer-${L.id})` }} />
              <span className="flex-1">{L.name}</span>
              <span className="text-muted-foreground text-xs tabular">{L.count}</span>
            </NavLink>
            {activeLayer === L.id && (
              <ul className="my-1 ml-[18px] border-l pl-2">
                {L.cats.map(C => (
                  <li key={C.id}>
                    <a href={`#${C.id}`} onClick={onNavigate} className="text-muted-foreground hover:text-foreground block rounded-md px-2 py-1.5 text-[13px] leading-snug">
                      {C.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <Separator className="my-3" />
        <NavLink href="#search" active={route.view === "search"} onClick={onNavigate}><Search className="size-4" /> Search &amp; filter</NavLink>
        <NavLink href="#about" active={route.view === "about"} onClick={onNavigate}><BookOpen className="size-4" /> How this was made</NavLink>
      </nav>
      <div className="text-muted-foreground mt-auto space-y-1.5 pt-4 text-xs">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <p className="px-2.5 tabular">{ix.guide.stats.companies} companies · {ix.guide.stats.checks.toLocaleString()} facts re-checked</p>
        <p className="px-2.5">Researched {ix.guide.researched}</p>
        <a href={ISSUES_URL} target="_blank" rel="noopener" className="hover:text-foreground block px-2.5 underline underline-offset-4">Report a correction</a>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary">
        <span className="flex w-4 flex-col gap-[2px]">
          {["m4", "m3", "m1", "m2"].map(id => <span key={id} className="h-[3px] rounded-sm" style={{ background: `var(--layer-${id})` }} />)}
        </span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">AI Industry Field Guide</span>
        <span className="text-muted-foreground block text-xs">October 2026 snapshot</span>
      </span>
    </a>
  )
}

export function AppNav(props: NavProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="bg-muted/30 sticky top-0 hidden h-svh w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r px-4 py-5 lg:flex">
        <Brand />
        <NavBody {...props} />
      </aside>
      {/* Mobile top bar */}
      <header className="bg-background/90 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur lg:hidden" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <Brand />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto px-4 pb-6">
            <SheetHeader className="px-0 pb-0"><SheetTitle>AI Industry Field Guide</SheetTitle></SheetHeader>
            <NavBody {...props} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
