import type { PresetDefinition, PresetId } from "./types.ts";

export const LAB = {
  ink: "#23241f",
  paper: "#f3f1e8",
  acid: "#e5e94b",
  violet: "#5834d7",
  coral: "#ff795b",
  muted: "#62635a",
  white: "#fffdf5",
  night: "#161614",
} as const;

export const PRESETS: Record<PresetId, PresetDefinition> = {
  brutalist: {
    id: "brutalist",
    index: "A",
    name: "BRUTALIST",
    philosophy: "Aggressive structure. No apologies.",
    description:
      "Monumental type, hard divisions and awkward, deliberate pressure.",
    defaults: { chaos: 74, density: 68, hierarchy: 92 },
    accent: LAB.acid,
    ink: LAB.ink,
    paper: LAB.paper,
    grammarIds: ["monument", "split", "stack", "stair"],
  },
  swiss: {
    id: "swiss",
    index: "B",
    name: "SWISS EDITORIAL",
    philosophy: "Precision with personality.",
    description:
      "A disciplined asymmetric column grid with editorial scale shifts.",
    defaults: { chaos: 18, density: 46, hierarchy: 72 },
    accent: LAB.violet,
    ink: LAB.ink,
    paper: LAB.paper,
    grammarIds: ["asymmetric-grid", "editorial-spread", "modular", "poster-column"],
  },
  minimal: {
    id: "minimal",
    index: "C",
    name: "RADICAL MINIMAL",
    philosophy: "As little as possible, as deliberately as possible.",
    description:
      "Negative space as material. One decisive focal point, quiet support.",
    defaults: { chaos: 20, density: 16, hierarchy: 64 },
    accent: LAB.violet,
    ink: LAB.ink,
    paper: LAB.white,
    grammarIds: ["focal-low", "horizon", "edge", "quiet-stack"],
  },
  maximal: {
    id: "maximal",
    index: "D",
    name: "MAXIMALIST",
    philosophy: "More, but with intention.",
    description:
      "Layered colour, compressed rhythm and a loud but legible focal hierarchy.",
    defaults: { chaos: 68, density: 88, hierarchy: 78 },
    accent: LAB.coral,
    ink: LAB.ink,
    paper: LAB.paper,
    grammarIds: ["collage", "spectacle", "type-wall", "layered-stack"],
  },
  antigrid: {
    id: "antigrid",
    index: "E",
    name: "ANTI-GRID",
    philosophy: "Rules are there to be broken.",
    description:
      "Coherent offsets, broken columns and tension produced by a system.",
    defaults: { chaos: 66, density: 44, hierarchy: 68 },
    accent: LAB.acid,
    ink: LAB.ink,
    paper: LAB.paper,
    grammarIds: ["broken-columns", "drift", "stagger", "orbit"],
  },
  chaos: {
    id: "chaos",
    index: "F",
    name: "CONTROLLED CHAOS",
    philosophy: "Surprise within a functioning system.",
    description:
      "Hybrid grammars, spatial fractures and unexpected focal points that still hold.",
    defaults: { chaos: 88, density: 60, hierarchy: 84 },
    accent: LAB.coral,
    ink: LAB.ink,
    paper: LAB.night,
    grammarIds: ["hybrid-split", "collision-field", "fracture", "anchor-field"],
  },
};

export const PRESET_LIST = Object.values(PRESETS);

export const DEFAULT_SETTINGS = {
  preset: "brutalist" as PresetId,
  chaos: PRESETS.brutalist.defaults.chaos,
  density: PRESETS.brutalist.defaults.density,
  hierarchy: PRESETS.brutalist.defaults.hierarchy,
  seed: 2718,
  preserveColors: false,
  preserveTypography: true,
  allowOverlap: true,
  outputSize: "source" as const,
};

export const OUTPUT_SIZE_LABELS = {
  source: "Source ratio",
  square: "1:1 square",
  portrait: "4:5 portrait",
  landscape: "16:9 landscape",
} as const;

export const PRESET_GRAMMAR_NAMES: Record<string, string> = {
  monument: "Monument",
  split: "Hard split",
  stack: "Band stack",
  stair: "Stair tension",
  "asymmetric-grid": "Asymmetric grid",
  "editorial-spread": "Editorial spread",
  modular: "Modular field",
  "poster-column": "Poster column",
  "focal-low": "Low focal",
  horizon: "Horizon",
  edge: "Edge tension",
  "quiet-stack": "Quiet stack",
  collage: "Collage",
  spectacle: "Spectacle",
  "type-wall": "Type wall",
  "layered-stack": "Layered stack",
  "broken-columns": "Broken columns",
  drift: "Drift",
  stagger: "Stagger",
  orbit: "Orbit",
  "hybrid-split": "Hybrid split",
  "collision-field": "Collision field",
  fracture: "Fracture",
  "anchor-field": "Anchor field",
};

export function presetName(id: PresetId): string {
  return PRESETS[id]?.name ?? id.toUpperCase();
}
