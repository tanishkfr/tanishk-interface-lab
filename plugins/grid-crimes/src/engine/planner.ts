import type {
  CompositionSnapshot,
  EngineResult,
  LayoutPlan,
  MutationSettings,
  PresetId,
} from "../shared/types.ts";
import { PRESETS, PRESET_GRAMMAR_NAMES, presetName } from "../shared/presets.ts";
import { sanitizeSettings, outputDimensions } from "../shared/settings.ts";
import {
  createRng,
  hashString,
} from "../shared/random.ts";
import { Composer } from "./compose.ts";
import { deriveDna, buildPalette } from "./style.ts";
import { scorePlan, layoutDistance } from "./scoring/score.ts";
import type { GrammarDefinition } from "./grammars/helpers.ts";
import { brutalistGrammars } from "./grammars/brutalist.ts";
import { swissGrammars } from "./grammars/swiss.ts";
import { minimalGrammars } from "./grammars/minimal.ts";
import { maximalGrammars } from "./grammars/maximal.ts";
import { antigridGrammars } from "./grammars/antigrid.ts";
import { chaosGrammars } from "./grammars/chaos.ts";

export const GRAMMARS: Record<string, GrammarDefinition> = Object.fromEntries(
  [
    ...brutalistGrammars,
    ...swissGrammars,
    ...minimalGrammars,
    ...maximalGrammars,
    ...antigridGrammars,
    ...chaosGrammars,
  ].map((grammar) => [grammar.id, grammar]),
);

const GRAMMARS_BY_PRESET: Record<PresetId, GrammarDefinition[]> = {
  brutalist: brutalistGrammars,
  swiss: swissGrammars,
  minimal: minimalGrammars,
  maximal: maximalGrammars,
  antigrid: antigridGrammars,
  chaos: chaosGrammars,
};

export interface GenerateOptions {
  count?: number;
  /** Explicit grammar ids, used by Crossbreed and the preview renderer. */
  grammarIds?: string[];
  /** Alter the seed stream without changing the user's visible seed. */
  salt?: string;
  presetOverride?: PresetId;
  /** Crossbreed supplies an already-mixed DNA per variation. */
  dnaForVariation?: (variation: number, seed: number) => import("../shared/types.ts").DesignDNA;
}

function effectiveSeed(
  base: number,
  preset: PresetId,
  salt: string,
  variationIndex: number,
): number {
  return (hashString(`${base}:${preset}:${salt}:${variationIndex}`) % 8_999_999) + 1;
}

function buildCandidate(
  snapshot: CompositionSnapshot,
  settings: MutationSettings,
  grammar: GrammarDefinition,
  seed: number,
  width: number,
  height: number,
  dnaOverride?: import("../shared/types.ts").DesignDNA,
): LayoutPlan {
  const rng = createRng(seed);
  const dna = dnaOverride
    ? {
        ...dnaOverride,
        // A small deterministic nudge keeps four offspring from sharing the
        // exact same inherited geometry.
        margin: Math.max(0.018, dnaOverride.margin + (rng() - 0.5) * 0.01),
        asymmetry: Math.max(-0.8, Math.min(0.9, dnaOverride.asymmetry + (rng() - 0.5) * 0.06)),
        rotation: Math.max(0, dnaOverride.rotation + (rng() - 0.5) * 1.4),
        split: Math.max(0.32, Math.min(0.72, dnaOverride.split + (rng() - 0.5) * 0.04)),
      }
    : deriveDna(settings.preset, settings, rng);
  const palette = buildPalette(snapshot, settings.preset, settings, dna, rng);
  const composer = new Composer(snapshot, settings, dna, palette, rng, width, height);
  try {
    grammar.build(composer);
  } catch (error) {
    composer.warnings.push(
      `Grammar ${grammar.id} stopped early: ${
        error instanceof Error ? error.message : "unknown layout error"
      }`,
    );
  }
  const plan = composer.finish(
    {
      grammarId: grammar.id,
      grammarName: grammar.name || PRESET_GRAMMAR_NAMES[grammar.id] || grammar.id,
      seed,
    },
    0,
    {},
  );
  return plan;
}

function finishPlan(plan: LayoutPlan, snapshot: CompositionSnapshot): LayoutPlan {
  const scored = scorePlan(plan, snapshot);
  return {
    ...plan,
    score: scored.total,
    scoreParts: scored.parts,
    warnings: [...plan.warnings, ...scored.issues.slice(0, 4)],
  };
}

function buildSafePlan(
  snapshot: CompositionSnapshot,
  settings: MutationSettings,
  seed: number,
  width: number,
  height: number,
): LayoutPlan {
  const rng = createRng(seed);
  const dna = {
    ...deriveDna(settings.preset, { ...settings, chaos: 20, density: 42 }, rng),
    margin: 0.07,
    rotation: 0,
    alignment: "left" as const,
    asymmetry: 0,
  };
  const palette = buildPalette(snapshot, settings.preset, settings, dna, rng);
  const composer = new Composer(snapshot, settings, dna, palette, rng, width, height);
  const content = composer.content;
  const headlineBlock =
    snapshot.blocks.find((block) => block.role === "headline") ??
    snapshot.blocks.find((block) => block.role === "visual") ??
    snapshot.blocks[0];
  const visualBlock = snapshot.blocks.find((block) => block.role === "visual");

  if (headlineBlock) {
    composer.place(
      headlineBlock,
      {
        x: content.x,
        y: content.y,
        w: content.w * 0.92,
        h: content.h * 0.3,
      },
      { z: 31, emphasis: 1.06 },
    );
  }

  if (visualBlock && !composer.isPlaced(visualBlock)) {
    composer.place(
      visualBlock,
      {
        x: content.x,
        y: content.y + content.h * 0.36,
        w: content.w * 0.52,
        h: content.h * 0.34,
      },
      { z: 8, fit: "contain" },
    );
  }

  const remaining = composer.remaining;
  if (remaining.length) {
    composer.placeSupport(
      {
        x: content.x + content.w * 0.56,
        y: content.y + content.h * 0.36,
        w: content.w * 0.44,
        h: content.h * 0.34,
      },
      { columns: 2, emphasis: 0.88, z: 27 },
    );
  }
  if (composer.remaining.length) {
    composer.placeSupport(
      {
        x: content.x,
        y: content.y + content.h * 0.73,
        w: content.w,
        h: content.h * 0.22,
      },
      { columns: 4, emphasis: 0.82, z: 27 },
    );
  }

  composer.decor(
    "rule",
    {
      x: content.x,
      y: content.y + content.h * 0.33,
      w: content.w,
      h: Math.max(2, height * 0.003),
    },
    palette.ink,
    { z: 17 },
  );
  composer.decor(
    "bar",
    {
      x: content.x,
      y: content.y + content.h * 0.71,
      w: content.w * 0.22,
      h: Math.max(6, height * 0.01),
    },
    palette.accent,
    { z: 18 },
  );

  return finishPlan(
    composer.finish(
      {
        grammarId: `${settings.preset}-safe`,
        grammarName: "Safe composition",
        seed,
      },
      0,
      {},
    ),
    snapshot,
  );
}

/**
 * Dense sources (more than 18 elements) switch to an editorial index grid.
 * Every element keeps a readable cell, the visual gets a larger span, and the
 * preset still controls palette, rules and typographic emphasis. Four variants
 * vary the grid rather than randomly scattering 30 tiny layers.
 */
function buildDensePlan(
  snapshot: CompositionSnapshot,
  settings: MutationSettings,
  seed: number,
  width: number,
  height: number,
  variant: number,
): LayoutPlan {
  const rng = createRng(seed);
  const base = deriveDna(settings.preset, settings, rng);
  const dna = {
    ...base,
    margin: 0.035,
    gutter: Math.max(0.008, base.gutter * 0.75),
    rotation: 0,
    decorative: Math.min(0.45, base.decorative),
    alignment: variant % 2 === 0 ? ("left" as const) : ("mixed" as const),
  };
  const palette = buildPalette(snapshot, settings.preset, settings, dna, rng);
  const composer = new Composer(snapshot, settings, dna, palette, rng, width, height);
  const content = composer.content;
  const header =
    snapshot.blocks.find((block) => block.role === "headline") ??
    snapshot.blocks.find((block) => block.role === "visual") ??
    snapshot.blocks[0];

  if (header) {
    composer.place(
      header,
      {
        x: content.x,
        y: content.y,
        w: content.w * (variant === 3 ? 0.72 : 0.92),
        h: content.h * 0.14,
      },
      {
        z: 31,
        emphasis: 1.04,
        align: variant === 3 ? "RIGHT" : "LEFT",
      },
    );
  }

  const gridBlocks = snapshot.blocks.filter((block) => block.id !== header?.id);
  const visual = gridBlocks.find((block) => block.role === "visual");
  const columns = [6, 7, 5, 8][variant % 4];
  const rows = Math.max(
    3,
    Math.ceil((gridBlocks.length + 3) / columns) + 1,
  );
  const top = content.y + content.h * (header ? 0.18 : 0.02);
  const grid = {
    x: content.x,
    y: top,
    w: content.w,
    h: Math.max(80, content.y + content.h - top),
  };
  const gap = Math.max(6, Math.round(composer.gutterPx));
  const cellW = (grid.w - gap * (columns - 1)) / columns;
  const cellH = (grid.h - gap * (rows - 1)) / rows;
  const occupied = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false),
  );
  const cellRect = (col: number, row: number, colSpan = 1, rowSpan = 1) => ({
    x: grid.x + col * (cellW + gap),
    y: grid.y + row * (cellH + gap),
    w: cellW * colSpan + gap * (colSpan - 1),
    h: cellH * rowSpan + gap * (rowSpan - 1),
  });
  const claim = (col: number, row: number, colSpan = 1, rowSpan = 1) => {
    for (let r = row; r < Math.min(rows, row + rowSpan); r += 1) {
      for (let c = col; c < Math.min(columns, col + colSpan); c += 1) {
        occupied[r][c] = true;
      }
    }
  };
  const free = (col: number, row: number, colSpan = 1, rowSpan = 1) => {
    if (col + colSpan > columns || row + rowSpan > rows) return false;
    for (let r = row; r < row + rowSpan; r += 1) {
      for (let c = col; c < col + colSpan; c += 1) {
        if (occupied[r][c]) return false;
      }
    }
    return true;
  };
  const nextFree = (colSpan = 1, rowSpan = 1): { col: number; row: number } | null => {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        if (free(col, row, colSpan, rowSpan)) return { col, row };
      }
    }
    return null;
  };

  if (visual && gridBlocks.length <= 34) {
    const span =
      variant === 1
        ? { w: Math.min(3, columns), h: 1 }
        : variant === 2
          ? { w: 2, h: 2 }
          : { w: 2, h: 2 };
    const spot = nextFree(span.w, span.h);
    if (spot) {
      claim(spot.col, spot.row, span.w, span.h);
      composer.place(
        visual,
        cellRect(spot.col, spot.row, span.w, span.h),
        { z: 8, fit: "fill" },
      );
    }
  }

  for (const block of gridBlocks) {
    if (composer.isPlaced(block)) continue;
    const spot = nextFree(1, 1);
    if (!spot) {
      composer.place(
        block,
        {
          x: content.x,
          y: content.y + content.h * 0.88,
          w: content.w / 4,
          h: content.h * 0.1,
        },
        { z: 27, emphasis: 0.8 },
      );
      continue;
    }
    claim(spot.col, spot.row);
    composer.place(block, cellRect(spot.col, spot.row), {
      z: 27,
      emphasis: block.role === "action" ? 0.95 : 0.88,
      align: variant % 2 === 0 ? "LEFT" : "RIGHT",
    });
  }

  composer.rule("h", content.y + content.h * 0.155, {
    thickness: Math.max(2, height * 0.0035),
    color: palette.accent,
    z: 18,
  });
  composer.decor(
    "bar",
    {
      x: content.x,
      y: content.y + content.h * 0.965,
      w: content.w * 0.3,
      h: Math.max(4, height * 0.007),
    },
    palette.accent,
    { z: 19 },
  );
  composer.decor("index", {
    x: content.x + content.w * 0.94,
    y: content.y + content.h * 0.97,
    w: content.w * 0.06,
    h: height * 0.02,
  }, palette.ink, {
    label: `${String(seed).slice(-3)} / ${columns}×${rows}`,
    z: 45,
  });

  return finishPlan(
    composer.finish(
      {
        grammarId: `dense-index-${variant + 1}`,
        grammarName: "Dense index",
        seed,
      },
      0,
      {},
    ),
    snapshot,
  );
}

export function generatePlans(
  snapshot: CompositionSnapshot,
  rawSettings: MutationSettings,
  options: GenerateOptions = {},
): EngineResult {
  const settings = sanitizeSettings(rawSettings);
  const count = Math.max(1, Math.min(6, options.count ?? 4));
  const grammarPool = options.grammarIds?.length
    ? options.grammarIds
        .map((id) => GRAMMARS[id])
        .filter((grammar): grammar is GrammarDefinition => Boolean(grammar))
    : GRAMMARS_BY_PRESET[settings.preset];
  const pool = grammarPool.length
    ? grammarPool
    : GRAMMARS_BY_PRESET[settings.preset];
  const { width, height } = outputDimensions(
    snapshot.width,
    snapshot.height,
    settings.outputSize,
  );
  const warnings: string[] = [];
  const accepted: LayoutPlan[] = [];
  const salt = options.salt ?? "batch";
  const dense = snapshot.blocks.length > 18;
  if (dense) {
    warnings.push(
      "This is a dense composition. GRID CRIMES/ uses its editorial index layout so every element stays legible and editable.",
    );
  }

  for (let variation = 0; variation < count; variation += 1) {
    const seed = effectiveSeed(settings.seed, settings.preset, salt, variation);
    if (dense) {
      const plan = buildDensePlan(
        snapshot,
        settings,
        seed,
        width,
        height,
        variation,
      );
      accepted.push(plan);
      continue;
    }
    const usedGrammars = new Set(accepted.map((plan) => plan.grammarId));
    const unusedPool = pool.filter((grammar) => !usedGrammars.has(grammar.id));
    const candidatePool = unusedPool.length ? unusedPool : pool;
    const primaryGrammar = candidatePool[variation % candidatePool.length];
    const fallbackGrammar = candidatePool.find(
      (grammar) => grammar !== primaryGrammar,
    );
    const candidateGrammars = fallbackGrammar
      ? [primaryGrammar, fallbackGrammar]
      : [primaryGrammar];
    const candidates: LayoutPlan[] = [];
    for (const grammar of candidateGrammars) {
      const attempts = grammar === primaryGrammar ? 3 : 2;
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const attemptSeed = (hashString(`${seed}:${grammar.id}:${attempt}`) % 8_999_999) + 1;
        const candidate = finishPlan(
          buildCandidate(
            snapshot,
            settings,
            grammar,
            attemptSeed,
            width,
            height,
            options.dnaForVariation?.(variation, attemptSeed),
          ),
          snapshot,
        );
        candidate.warnings = [...candidate.warnings];
        candidates.push(candidate);
      }
    }

    let best: LayoutPlan | null = null;
    let bestValue = -Infinity;
    for (const candidate of candidates) {
      const scored = scorePlan(candidate, snapshot);
      const diversityPenalty =
        accepted.reduce((max, plan) => Math.max(max, 1 - layoutDistance(candidate, plan)), 0) *
        14;
      const value =
        scored.total -
        diversityPenalty +
        (scored.valid ? 12 : 0) +
        (candidate.grammarId === primaryGrammar.id ? 2 : 0);
      if (value > bestValue) {
        best = candidate;
        bestValue = value;
      }
    }

    if (!best || scorePlan(best, snapshot).total < 52 || !scorePlan(best, snapshot).valid) {
      const safe = buildSafePlan(snapshot, settings, seed, width, height);
      if (
        !best ||
        scorePlan(safe, snapshot).total > scorePlan(best, snapshot).total ||
        !scorePlan(best, snapshot).valid
      ) {
        best = safe;
        warnings.push(
          `Variation ${variation + 1} used the safe layout because the expressive candidates violated a hard constraint.`,
        );
      }
    }

    if (best) {
      const scored = scorePlan(best, snapshot);
      best.score = scored.total;
      best.scoreParts = scored.parts;
      accepted.push(best);
    }
  }

  // If a grammar was not applicable (e.g. no visuals), the four grammars can
  // still collide in shape. Report rather than hide that.
  const uniqueGrammars = new Set(accepted.map((plan) => plan.grammarId));
  if (uniqueGrammars.size < Math.min(count, pool.length)) {
    warnings.push(
      "Some variations share a grammar because the available content did not support every layout archetype.",
    );
  }

  return {
    plans: accepted,
    warnings: [...new Set(warnings)],
    effectiveSeed: accepted[0]?.seed ?? settings.seed,
  };
}

export function grammarName(id: string): string {
  return GRAMMARS[id]?.name ?? PRESET_GRAMMAR_NAMES[id] ?? id;
}

export function grammarsForPreset(preset: PresetId): string[] {
  return PRESETS[preset].grammarIds;
}

export function presetDefaultPlan(
  snapshot: CompositionSnapshot,
  settings: MutationSettings,
): LayoutPlan {
  return generatePlans(snapshot, settings, { count: 1 }).plans[0];
}

export { presetName };
