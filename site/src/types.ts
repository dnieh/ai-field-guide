export type Stat = { s: string; d?: string } | null

export interface FactCheck { ok: number; fixed: number; open: string[] }
export interface Source { p?: string; d?: string; u: string; c?: string }

export interface Company {
  mod: string
  id: string
  name: string
  seg: string
  hq?: string | null
  founded?: string | null
  leaders?: string | null
  one?: string | null
  flagship?: string | null
  status?: string | null
  kind: "private" | "public" | "division" | "flux"
  kindLabel: string
  flux?: string | null
  stage?: string | null
  round: Stat
  val: Stat
  rev: Stat
  roundFull?: string | null
  revFull?: string | null
  recent?: string[]
  why?: string | null
  sources?: Source[]
  conf?: string | null
  flags?: string[]
  fc: FactCheck
}

export interface MapEntry {
  mod: string
  id: string
  name: string
  seg: string
  one?: string | null
  kind: Company["kind"]
  kindLabel: string
  status?: string | null
  round?: string | null
  val?: string | null
  src?: { u?: string; p?: string; d?: string }
  fc: FactCheck
}

export interface Note { note: string; url: string; date: string; pub: string }

export interface Category {
  id: string
  title: string
  segs?: string[] | null
  ids?: string[] | null
  overview: string
  happening: string[]
  notes: Note[]
  deep: Company[]
  maps: MapEntry[]
  layerId: string
}

export interface Layer {
  id: string
  n: number
  name: string
  short: string
  color: string
  what: string
  intro: string
  cats: Category[]
  count: number
  index: number
}

export interface Guide {
  updated: string
  researched: string
  stats: { companies: number; deep: number; maps: number; checks: number }
  facts: Note[]
  layers: Layer[]
  companies: Company[]
  maps: MapEntry[]
}
