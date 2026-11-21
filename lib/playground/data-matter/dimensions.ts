import {
  RELIEF_MAX,
  TERRAIN_RIBS,
  sampleSeries,
  sampleSeriesCyclic,
  terrainEnvelope,
} from "./model";

/** Shared world-space dimensions. Data meaning never lives in these numbers. */
export const WORLD = {
  plinthTop: 0.16,
  terrainWidth: 10.6,
  terrainDepth: 8.2,
  terrainRibCount: TERRAIN_RIBS,
  terrainColumns: 160,
  terrainGridColumns: 192,
  terrainGridRows: 76,
  fossilBaseRadius: 0.95,
  fossilRadiusStep: 0.115,
  fossilWallWidth: 0.09,
  fossilWallHeight: 0.045,
  fossilLayerLift: 0.055,
  fossilZScale: 0.77,
  fossilSegments: 192,
  fossilGridRows: 92,
  fossilHubRadius: 0.52,
} as const;

export const TERRAIN_MAX_WORLD_HEIGHT = 4;
export const FOSSIL_MAX_WORLD_DISPLACEMENT = 2.3;

export function reliefWorldHeight(relief: number): number {
  return (relief / RELIEF_MAX) * TERRAIN_MAX_WORLD_HEIGHT;
}

export function fossilWorldDisplacement(relief: number): number {
  return (relief / RELIEF_MAX) * FOSSIL_MAX_WORLD_DISPLACEMENT;
}

export function terrainZ(t: number): number {
  return (t - 0.5) * WORLD.terrainDepth;
}

export function terrainEnvelopeAt(t: number): number {
  return terrainEnvelope(t);
}

/** One terrain cross-section, normalised to [0, 1], sampled across the row
 * order. Reused by every material so the silhouette cannot drift apart. */
export function terrainProfile(
  values: ArrayLike<number>,
  max: number,
  columns: number,
  out?: Float32Array,
): Float32Array {
  const target = out && out.length === columns + 1 ? out : new Float32Array(columns + 1);
  const scale = max > 0 ? 1 / max : 0;
  for (let i = 0; i <= columns; i++) {
    target[i] = sampleSeries(values, i / columns) * scale;
  }
  return target;
}

/** A fossil contour's radius before the 0.77 ellipse compression. */
export function fossilRadiusAt(
  values: readonly number[],
  max: number,
  layer: number,
  u: number,
  relief: number,
): number {
  const normalized = max > 0 ? sampleSeriesCyclic(values, u) / max : 0;
  return (
    WORLD.fossilBaseRadius +
    layer * WORLD.fossilRadiusStep +
    normalized *
      fossilWorldDisplacement(relief) *
      Math.sin(((layer + 2) / 34) * Math.PI)
  );
}

/** Vertical position of an encoded fossil contour. Inner layers sit higher. */
export function fossilLayerY(layer: number): number {
  return (
    WORLD.plinthTop +
    0.035 +
    (31 - layer) * WORLD.fossilLayerLift
  );
}

/** Material-specific offset from the datum surface to the rendered top. */
export const TERRAIN_TOP_OFFSET = {
  strata: 0,
  porcelain: 0.1,
  blueprint: 0,
} as const;
