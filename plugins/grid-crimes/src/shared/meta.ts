import type { GridCrimesMeta } from "./types.ts";
import { GENERATOR_VERSION, PRESET_IDS } from "./types.ts";
import { sanitizeSettings, validRole } from "./settings.ts";
import { PRESETS } from "./presets.ts";

const META_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function encodeMeta(meta: GridCrimesMeta): string {
  return JSON.stringify(meta);
}

export function decodeMeta(raw: string | null | undefined): GridCrimesMeta | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return null;
    if (value.v !== META_VERSION) return null;
    if (value.kind !== "variation") return null;
    if (typeof value.batchId !== "string") return null;
    if (typeof value.containerId !== "string") return null;
    if (typeof value.variationId !== "string") return null;
    if (typeof value.preset !== "string") return null;
    if (!PRESET_IDS.includes(value.preset as never)) return null;
    if (typeof value.sourceFingerprint !== "string") return null;
    if (!Array.isArray(value.sourceIds)) return null;
    if (
      !value.dna ||
      typeof value.dna !== "object" ||
      !isRecord(value.dna)
    ) {
      return null;
    }
    return {
      v: 1,
      generator: String(value.generator ?? GENERATOR_VERSION),
      kind: "variation",
      batchId: value.batchId,
      containerId: value.containerId,
      variationId: value.variationId,
      index: Number(value.index) || 0,
      preset: value.preset as GridCrimesMeta["preset"],
      presetName: String(
        value.presetName ??
          PRESETS[value.preset as keyof typeof PRESETS]?.name ??
          "",
      ),
      seed: Number(value.seed) || 1,
      settings: sanitizeSettings(value.settings),
      grammar: String(value.grammar ?? "unknown"),
      grammarName: String(value.grammarName ?? value.grammar ?? "Unknown"),
      score: Number(value.score) || 0,
      sourceFingerprint: value.sourceFingerprint,
      sourceName: String(value.sourceName ?? ""),
      sourceIds: value.sourceIds.filter(
        (id): id is string => typeof id === "string",
      ),
      dna: value.dna as unknown as GridCrimesMeta["dna"],
      createdAt: Number(value.createdAt) || 0,
      kept: value.kept === true,
      locked: value.locked === true,
      revision: Number(value.revision) || 0,
      crossbreed: isRecord(value.crossbreed)
        ? (value.crossbreed as unknown as GridCrimesMeta["crossbreed"])
        : undefined,
    };
  } catch {
    return null;
  }
}

export function makeVariationMeta(
  input: Omit<GridCrimesMeta, "v" | "generator" | "kind">,
): GridCrimesMeta {
  return {
    v: 1,
    generator: GENERATOR_VERSION,
    kind: "variation",
    ...input,
  };
}

export function roleFromMeta(raw: string | null | undefined) {
  return validRole(raw) ? raw : null;
}
