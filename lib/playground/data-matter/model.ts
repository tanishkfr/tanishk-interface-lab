import { SAMPLE_DATA, type Datum } from "../math.ts";

export type { Datum };

export type Formation = "terrain" | "fossil";
export type Material = "strata" | "porcelain" | "blueprint";

export const FORMATIONS: Formation[] = ["terrain", "fossil"];
export const MATERIALS: Material[] = ["strata", "porcelain", "blueprint"];

export const FORMATION_LABEL: Record<Formation, string> = {
  terrain: "Terrain",
  fossil: "Fossil",
};

export const MATERIAL_LABEL: Record<Material, string> = {
  strata: "Strata",
  porcelain: "Porcelain",
  blueprint: "Blueprint",
};

export const MIN_VALUES = 2;
export const MAX_VALUES = 64;
export const MAX_EDIT_VALUE = 1_000_000;
export const RELIEF_MIN = 40;
export const RELIEF_MAX = 230;
export const RELIEF_DEFAULT = 170;
export const FOSSIL_LAYERS = 32;
export const TERRAIN_RIBS = 47;

/**
 * The two encodings are deliberately unchanged from v0.1.
 *
 * Terrain: a datum at position i sits at u = i / (n - 1). Height above the
 * plinth is `value / max * relief * envelope(t)`, where the smoothstep
 * interpolation between neighbours forms the surface and
 * `envelope(t) = 0.25 + 0.75 * sin(pi * t)` gives the sheet its ridge across
 * depth. `max` is the dataset maximum, floored at 1 (matching v0.1).
 *
 * Fossil: row order wraps clockwise around 32 nested contours. Each value
 * displaces its angular segment outward by
 * `value / max * relief * 0.38 * sin(((layer + 2) / 34) * pi)` in the original
 * SVG units. The 3D engine scales that displacement into world units but does
 * not change the mapping, its layer ordering, or its clockwise direction.
 */
export function dataMaximum(data: readonly Datum[]): number {
  return valuesMaximum(data.map((d) => d.value));
}

export function valuesMaximum(values: ArrayLike<number>): number {
  let max = 1;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > max) max = values[i];
  }
  return max;
}

export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function normalizeValue(value: number, max: number): number {
  return max > 0 ? value / max : 0;
}

/** Linear-position sampling across the row order, with smoothstep easing. */
export function sampleSeries(values: ArrayLike<number>, u: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  const position = Math.min(1, Math.max(0, u)) * (values.length - 1);
  const a = Math.floor(position);
  const b = Math.min(values.length - 1, a + 1);
  const t = smoothstep(position - a);
  return values[a] * (1 - t) + values[b] * t;
}

/**
 * Row order wraps around the ring. `u` is in [0, 1) clockwise from +x toward
 * +z, matching the v0.1 SVG's angle direction. The interpolation is the same
 * smoothstep series used by Terrain.
 */
export function sampleSeriesCyclic(values: ArrayLike<number>, u: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  const wrapped = ((u % 1) + 1) % 1;
  const position = wrapped * values.length;
  const a = Math.floor(position) % values.length;
  const b = (a + 1) % values.length;
  const t = smoothstep(position - Math.floor(position));
  return values[a] * (1 - t) + values[b] * t;
}

export function terrainEnvelope(t: number): number {
  return 0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
}

/** The original SVG displacement multiplier for a fossil layer. */
export function fossilEnvelope(layer: number): number {
  return 0.38 * Math.sin(((layer + 2) / 34) * Math.PI);
}

/** The datum nearest a terrain's horizontal position, u in [0, 1]. */
export function datumIndexFromU(count: number, u: number): number {
  if (count <= 1) return 0;
  return Math.max(0, Math.min(count - 1, Math.round(u * (count - 1))));
}

/** The datum occupying an angular segment, u in [0, 1) clockwise. */
export function datumIndexFromAngle(count: number, u: number): number {
  if (count <= 0) return 0;
  const wrapped = ((u % 1) + 1) % 1;
  return Math.floor(wrapped * count) % count;
}

export function datumU(count: number, index: number): number {
  return count <= 1 ? 0.5 : index / (count - 1);
}

export function datumAngle(count: number, index: number): number {
  return ((index + 0.5) / Math.max(1, count)) * Math.PI * 2;
}

const VALUE_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatValue(value: number): string {
  return VALUE_FORMATTER.format(value);
}

export function valueStep(value: number): number {
  return Number.isInteger(value) ? 1 : 0.1;
}

export function clampValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_EDIT_VALUE, Math.max(0, value));
}

export function withValue(data: readonly Datum[], index: number, value: number): Datum[] {
  return data.map((datum, i) =>
    i === index ? { ...datum, value: clampValue(value) } : datum,
  );
}

export type Dataset = {
  title: string;
  note: string;
  data: Datum[];
};

export function editDataset(
  dataset: Dataset,
  index: number,
  value: number,
): Dataset {
  return { ...dataset, data: withValue(dataset.data, index, value) };
}

export type Preset = Dataset & {
  id: string;
};

const week: Datum[] = SAMPLE_DATA.map((datum) => ({ ...datum }));

export const PRESETS: Preset[] = [
  {
    id: "week",
    title: "Week, observed",
    note: "Illustrative sample · daily observations",
    data: week,
  },
  {
    id: "arc",
    title: "Rise and fall",
    note: "Illustrative sample · a single arc",
    data: [
      { label: "Jan", value: 18 },
      { label: "Feb", value: 26 },
      { label: "Mar", value: 41 },
      { label: "Apr", value: 62 },
      { label: "May", value: 78 },
      { label: "Jun", value: 91 },
      { label: "Jul", value: 86 },
      { label: "Aug", value: 68 },
      { label: "Sep", value: 49 },
      { label: "Oct", value: 31 },
      { label: "Nov", value: 22 },
      { label: "Dec", value: 14 },
    ],
  },
  {
    id: "needles",
    title: "Needles",
    note: "Illustrative sample · sharp spikes",
    data: [
      { label: "A", value: 8 },
      { label: "B", value: 61 },
      { label: "C", value: 12 },
      { label: "D", value: 94 },
      { label: "E", value: 16 },
      { label: "F", value: 44 },
      { label: "G", value: 9 },
      { label: "H", value: 77 },
      { label: "I", value: 14 },
      { label: "J", value: 53 },
      { label: "K", value: 10 },
      { label: "L", value: 34 },
    ],
  },
  {
    id: "swell",
    title: "Long swell",
    note: "Illustrative sample · a slow wave",
    data: Array.from({ length: 20 }, (_, i) => ({
      label: `${String(i + 1).padStart(2, "0")}`,
      value: Math.round(52 + Math.sin((i / 20) * Math.PI * 2 - 0.7) * 34),
    })),
  },
  {
    id: "uneven",
    title: "Uneven field",
    note: "Illustrative sample · a strongly uneven distribution",
    data: [
      { label: "Field 1", value: 6 },
      { label: "Field 2", value: 8 },
      { label: "Field 3", value: 92 },
      { label: "Field 4", value: 12 },
      { label: "Field 5", value: 10 },
      { label: "Field 6", value: 64 },
      { label: "Field 7", value: 9 },
      { label: "Field 8", value: 24 },
      { label: "Field 9", value: 108 },
      { label: "Field 10", value: 14 },
    ],
  },
];

export const DEFAULT_DATASET: Dataset = {
  title: PRESETS[0].title,
  note: PRESETS[0].note,
  data: PRESETS[0].data,
};

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

export function datasetCsv(data: readonly Datum[]): string {
  return "label,value\n" + data.map((d) => `${d.label},${d.value}`).join("\n");
}

export type CameraSnapshot = {
  azimuth: number;
  elevation: number;
  zoom: number;
};

export const DEFAULT_CAMERA: CameraSnapshot = {
  azimuth: -22,
  elevation: 40,
  zoom: 1,
};

export function isFormation(value: string): value is Formation {
  return FORMATIONS.includes(value as Formation);
}

export function isMaterial(value: string): value is Material {
  return MATERIALS.includes(value as Material);
}
