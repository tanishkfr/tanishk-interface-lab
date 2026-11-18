import {
  DEFAULT_SETTINGS,
  PRESETS,
  presetName,
} from "./presets.ts";
import { PRESET_IDS } from "./types.ts";
import type {
  CompositionSnapshot,
  MutationSettings,
  OutputSize,
  PresetId,
  Role,
  RoleOverride,
} from "./types.ts";
import { ROLES } from "./types.ts";

export function clampSetting(value: unknown, fallback: number): number {
  const numeric =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : fallback;
  return Math.max(0, Math.min(100, numeric));
}

export function validSeed(value: unknown, fallback = DEFAULT_SETTINGS.seed): number {
  const numeric =
    typeof value === "number" && Number.isFinite(value)
      ? Math.floor(value)
      : fallback;
  return Math.max(1, Math.min(9_999_999, numeric));
}

export function validPreset(value: unknown): PresetId {
  return PRESET_IDS.includes(value as PresetId)
    ? (value as PresetId)
    : DEFAULT_SETTINGS.preset;
}

export function validOutputSize(value: unknown): OutputSize {
  return value === "source" ||
    value === "square" ||
    value === "portrait" ||
    value === "landscape"
    ? value
    : "source";
}

export function sanitizeSettings(input: unknown): MutationSettings {
  const source =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const preset = validPreset(source.preset);
  const defaults = PRESETS[preset].defaults;
  return {
    preset,
    chaos: clampSetting(source.chaos, defaults.chaos),
    density: clampSetting(source.density, defaults.density),
    hierarchy: clampSetting(source.hierarchy, defaults.hierarchy),
    seed: validSeed(source.seed),
    preserveColors: source.preserveColors === true,
    preserveTypography:
      typeof source.preserveTypography === "boolean"
        ? source.preserveTypography
        : DEFAULT_SETTINGS.preserveTypography,
    allowOverlap:
      typeof source.allowOverlap === "boolean"
        ? source.allowOverlap
        : DEFAULT_SETTINGS.allowOverlap,
    outputSize: validOutputSize(source.outputSize),
  };
}

export function validRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export function sanitizeOverrides(input: unknown): RoleOverride[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const result: RoleOverride[] = [];
  for (const entry of input) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    if (typeof value.id !== "string" || !validRole(value.role)) continue;
    if (seen.has(value.id)) continue;
    seen.add(value.id);
    result.push({ id: value.id, role: value.role });
  }
  return result.slice(0, 100);
}

export function applyRoleOverrides(
  snapshot: CompositionSnapshot,
  overrides: RoleOverride[],
): CompositionSnapshot {
  if (!overrides.length) return snapshot;
  const map = new Map(overrides.map((entry) => [entry.id, entry.role]));
  const blocks = snapshot.blocks.map((block) =>
    map.has(block.id) ? { ...block, role: map.get(block.id)! } : block,
  );
  const roleCounts = emptyRoleCounts();
  for (const block of blocks) roleCounts[block.role] += 1;
  return { ...snapshot, blocks, roleCounts };
}

export function emptyRoleCounts(): Record<Role, number> {
  return {
    headline: 0,
    subhead: 0,
    body: 0,
    visual: 0,
    action: 0,
    label: 0,
    decoration: 0,
    module: 0,
  };
}

export function describeRoles(snapshot: CompositionSnapshot): string {
  const groups: Array<[Role, string, string]> = [
    ["headline", "heading", "headings"],
    ["subhead", "subheading", "subheadings"],
    ["body", "body block", "body blocks"],
    ["visual", "visual", "visuals"],
    ["action", "action", "actions"],
    ["label", "label", "labels"],
    ["module", "module", "modules"],
    ["decoration", "detail", "details"],
  ];
  const parts = groups
    .filter(([role]) => snapshot.roleCounts[role] > 0)
    .map(([role, singular, plural]) => {
      const count = snapshot.roleCounts[role];
      return `${count} ${count === 1 ? singular : plural}`;
    });
  return parts.length ? parts.join(", ") : "no readable elements";
}

export function summarizeSelection(snapshot: CompositionSnapshot): string {
  return `${snapshot.blocks.length} elements · ${describeRoles(snapshot)}`;
}

/** Output frame size with an area-preserving aspect conversion. */
export function outputDimensions(
  sourceWidth: number,
  sourceHeight: number,
  size: OutputSize,
): { width: number; height: number } {
  const safeW = Math.max(64, Math.min(8192, Math.round(sourceWidth || 1200)));
  const safeH = Math.max(64, Math.min(8192, Math.round(sourceHeight || 800)));
  if (size === "source") return { width: safeW, height: safeH };
  const ratio =
    size === "square" ? 1 : size === "portrait" ? 4 / 5 : 16 / 9;
  const area = safeW * safeH;
  let width = Math.sqrt(area * ratio);
  let height = width / ratio;
  const long = Math.max(width, height);
  const cap = Math.max(960, Math.min(2400, Math.max(safeW, safeH)));
  if (long > cap) {
    const scale = cap / long;
    width *= scale;
    height *= scale;
  }
  const minLong = 640;
  if (long < minLong) {
    const scale = minLong / long;
    width *= scale;
    height *= scale;
  }
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function presetDescription(preset: PresetId): string {
  return `${presetName(preset)} — ${PRESETS[preset].philosophy}`;
}

export function presetDefaults(preset: PresetId): Pick<
  MutationSettings,
  "chaos" | "density" | "hierarchy"
> {
  return { ...PRESETS[preset].defaults };
}
