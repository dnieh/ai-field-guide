import { useEffect, useState } from "react"
import type { Category, Company, Guide, Layer, MapEntry } from "@/types"

/** Layers in reading order: bottom of the stack to the top. */
export const LAYER_ORDER = ["m2", "m1", "m3", "m4", "m5"] as const

export interface GuideIndex {
  guide: Guide
  layers: Layer[]
  layerById: Record<string, Layer>
  catById: Record<string, Category>
  catOf: Record<string, Category>
}

const key = (x: { mod: string; id: string }) => `${x.mod}:${x.id}`

function index(guide: Guide): GuideIndex {
  const catOf: Record<string, Category> = {}
  const catById: Record<string, Category> = {}
  const layerById: Record<string, Layer> = {}
  for (const L of guide.layers) {
    for (const C of L.cats) {
      const inCat = (x: Company | MapEntry) =>
        x.mod === L.id && (C.ids ? C.ids.includes(x.id) : (C.segs || []).includes(x.seg))
      C.deep = guide.companies.filter(inCat)
      C.maps = guide.maps.filter(inCat)
      C.layerId = L.id
      catById[C.id] = C
      for (const x of [...C.deep, ...C.maps]) catOf[key(x)] = C
    }
    L.count = L.cats.reduce((s, C) => s + C.deep.length + C.maps.length, 0)
    layerById[L.id] = L
  }
  const layers = LAYER_ORDER.map((id, i) => ({ ...layerById[id], index: i + 1 }))
  layers.forEach(L => (layerById[L.id] = L))
  return { guide, layers, layerById, catById, catOf }
}

export function categoryOf(ix: GuideIndex, x: { mod: string; id: string }) {
  return ix.catOf[key(x)]
}

export function useGuide() {
  const [state, setState] = useState<{ data?: GuideIndex; error?: string }>({})
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/guide.json?v=${__BUILD_ID__}`)
      .then(r => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((g: Guide) => setState({ data: index(g) }))
      .catch(() => setState({ error: "Couldn't load the guide data. Try reloading the page." }))
  }, [])
  return state
}
