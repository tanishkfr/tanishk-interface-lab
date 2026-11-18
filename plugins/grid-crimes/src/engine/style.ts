import type {
  CompositionSnapshot,
  DesignDNA,
  MutationSettings,
  PresetId,
} from "../shared/types.ts";
import {
  LAB,
} from "../shared/presets.ts";
import {
  clamp,
  chance,
  lerp,
  pick,
  type Rng,
} from "../shared/random.ts";
import {
  contrastRatio,
  isNearBlack,
  isNearWhite,
  mixHex,
  readableOn,
  saturatedEnough,
  uniquePalette,
} from "../shared/color.ts";

interface DnaBase {
  margin: number;
  columns: number;
  gutter: number;
  asymmetry: number;
  rotation: number;
  scaleContrast: number;
  decorative: number;
  occupancy: number;
  alignment: DesignDNA["alignment"];
  split: number;
  backgroundMode: DesignDNA["backgroundMode"];
  colorStrategy: DesignDNA["colorStrategy"];
}

const BASE: Record<PresetId, DnaBase> = {
  brutalist: {
    margin: 0.05,
    columns: 6,
    gutter: 0.018,
    asymmetry: 0.3,
    rotation: 4,
    scaleContrast: 0.92,
    decorative: 0.55,
    occupancy: 0.72,
    alignment: "left",
    split: 0.58,
    backgroundMode: "paper",
    colorStrategy: "bold",
  },
  swiss: {
    margin: 0.085,
    columns: 12,
    gutter: 0.016,
    asymmetry: 0.26,
    rotation: 0.5,
    scaleContrast: 0.55,
    decorative: 0.22,
    occupancy: 0.5,
    alignment: "left",
    split: 0.56,
    backgroundMode: "paper",
    colorStrategy: "restrained",
  },
  minimal: {
    margin: 0.13,
    columns: 12,
    gutter: 0.024,
    asymmetry: -0.18,
    rotation: 0.2,
    scaleContrast: 0.7,
    decorative: 0.06,
    occupancy: 0.2,
    alignment: "mixed",
    split: 0.5,
    backgroundMode: "paper",
    colorStrategy: "mono",
  },
  maximal: {
    margin: 0.042,
    columns: 8,
    gutter: 0.012,
    asymmetry: 0.4,
    rotation: 7,
    scaleContrast: 0.85,
    decorative: 0.92,
    occupancy: 0.92,
    alignment: "mixed",
    split: 0.5,
    backgroundMode: "accent",
    colorStrategy: "layered",
  },
  antigrid: {
    margin: 0.065,
    columns: 7,
    gutter: 0.02,
    asymmetry: 0.55,
    rotation: 5,
    scaleContrast: 0.7,
    decorative: 0.45,
    occupancy: 0.62,
    alignment: "broken",
    split: 0.62,
    backgroundMode: "paper",
    colorStrategy: "bold",
  },
  chaos: {
    margin: 0.048,
    columns: 9,
    gutter: 0.014,
    asymmetry: 0.5,
    rotation: 11,
    scaleContrast: 0.96,
    decorative: 0.85,
    occupancy: 0.8,
    alignment: "mixed",
    split: 0.5,
    backgroundMode: "ink",
    colorStrategy: "layered",
  },
};

export function deriveDna(
  preset: PresetId,
  settings: MutationSettings,
  rng: Rng,
): DesignDNA {
  const base = BASE[preset];
  const chaos = settings.chaos / 100;
  const density = settings.density / 100;
  const hierarchy = settings.hierarchy / 100;
  const margin = clamp(
    base.margin * lerp(1.5, 0.62, density) * (1 - chaos * 0.12),
    0.018,
    0.26,
  );
  return {
    margin,
    columns: Math.max(
      3,
      Math.round(base.columns + (rng() > 0.5 ? 1 : -1) * chaos * 2),
    ),
    gutter: clamp(base.gutter * lerp(1.35, 0.72, density), 0.006, 0.05),
    asymmetry: clamp(base.asymmetry + (chaos - 0.45) * 0.25, -0.8, 0.9),
    rotation: Math.min(16, base.rotation * (0.18 + chaos * 1.3) * (settings.allowOverlap ? 1 : 0.7)),
    scaleContrast: clamp(base.scaleContrast * 0.55 + hierarchy * 0.62, 0.2, 1),
    decorative: clamp(
      base.decorative *
        (0.55 + density * 0.65) *
        (0.7 + chaos * 0.5) *
        (settings.allowOverlap ? 1 : 0.55),
      0.02,
      1,
    ),
    occupancy: clamp(base.occupancy * (0.78 + density * 0.34), 0.15, 0.96),
    alignment: base.alignment,
    split: clamp(base.split + (rng() - 0.5) * chaos * 0.12, 0.34, 0.7),
    backgroundMode: base.backgroundMode,
    colorStrategy: base.colorStrategy,
  };
}

export interface PalettePlan {
  background: string;
  ink: string;
  paper: string;
  accent: string;
  accentInk: string;
  alt: string;
  altInk: string;
  block: string;
  blockInk: string;
  sourceAccent: string | null;
  all: string[];
}

function sourceAccent(snapshot: CompositionSnapshot): string | null {
  const candidates = snapshot.palette.filter(
    (color) => !isNearWhite(color) && !isNearBlack(color) && saturatedEnough(color),
  );
  return candidates[0] ?? null;
}

export function buildPalette(
  snapshot: CompositionSnapshot,
  preset: PresetId,
  settings: MutationSettings,
  dna: DesignDNA,
  rng: Rng,
): PalettePlan {
  const fallbackAccent: Record<PresetId, string> = {
    brutalist: LAB.acid,
    swiss: LAB.violet,
    minimal: LAB.violet,
    maximal: LAB.coral,
    antigrid: LAB.acid,
    chaos: LAB.coral,
  };
  const foundAccent = sourceAccent(snapshot);
  const accent =
    !settings.preserveColors && chance(rng, 0.12)
      ? pick(rng, [LAB.acid, LAB.violet, LAB.coral])
      : foundAccent && chance(rng, preset === "minimal" ? 0.25 : 0.45)
        ? foundAccent
        : fallbackAccent[preset];

  let background = snapshot.background || LAB.paper;
  if (!settings.preserveColors) {
    switch (dna.backgroundMode) {
      case "ink":
        background = chance(rng, 0.7) ? LAB.ink : LAB.night;
        break;
      case "accent":
        background =
          preset === "maximal"
            ? pick(rng, [LAB.ink, LAB.violet, mixHex(LAB.coral, LAB.ink, 0.12)])
            : accent;
        break;
      case "source":
        background = snapshot.background || LAB.paper;
        break;
      default:
        background =
          preset === "minimal"
            ? LAB.white
            : preset === "brutalist" && chance(rng, 0.24)
              ? LAB.ink
              : LAB.paper;
    }
  }

  // A very saturated source background can make body copy unreadable. Keep it
  // but allow the planner to place opaque panels beneath copy where needed.
  const ink = readableOn(background, [LAB.ink, LAB.paper, LAB.white]);
  const accentInk = readableOn(accent, [LAB.ink, LAB.paper, LAB.white]);
  const altCandidates: Record<PresetId, string[]> = {
    brutalist: [LAB.coral, LAB.violet, LAB.acid],
    swiss: [LAB.violet, LAB.coral, LAB.acid],
    minimal: [LAB.violet, LAB.coral],
    maximal: [LAB.coral, LAB.violet, LAB.acid],
    antigrid: [LAB.violet, LAB.coral, LAB.acid],
    chaos: [LAB.acid, LAB.violet, LAB.coral],
  };
  const alt = pick(rng, altCandidates[preset]);
  const altInk = readableOn(alt, [LAB.ink, LAB.paper, LAB.white]);
  const block =
    preset === "maximal" || preset === "chaos"
      ? pick(rng, [LAB.acid, LAB.violet, LAB.coral, LAB.paper])
      : preset === "minimal"
        ? mixHex(background, ink, 0.06)
        : pick(rng, [LAB.ink, accent, LAB.coral]);
  const blockInk = readableOn(block, [LAB.ink, LAB.paper, LAB.white]);

  // Guarantee dark backgrounds get light text and vice versa.
  const textOptions = [LAB.ink, LAB.paper, LAB.white].filter(
    (color) => contrastRatio(color, background) >= 3.6,
  );

  const all = uniquePalette(
    [
      background,
      ink,
      accent,
      alt,
      block,
      ...snapshot.palette,
      ...textOptions,
    ],
    9,
  );

  return {
    background,
    ink,
    paper: LAB.paper,
    accent,
    accentInk,
    alt,
    altInk,
    block,
    blockInk,
    sourceAccent: foundAccent,
    all,
  };
}

export function textColorFor(
  background: string,
  palette: PalettePlan,
  prefer: "ink" | "paper" | "accent" = "ink",
): string {
  const preferred = prefer === "paper" ? palette.paper : prefer === "accent" ? palette.accent : palette.ink;
  if (contrastRatio(preferred, background) >= 4.5) return preferred;
  return readableOn(background, [palette.ink, palette.paper, palette.accentInk]);
}
