import type {
  CompositionSnapshot,
  CrossbreedParent,
  DesignDNA,
  EngineResult,
  MutationSettings,
} from "../../shared/types.ts";
import { PRESETS } from "../../shared/presets.ts";
import { sanitizeSettings } from "../../shared/settings.ts";
import { clamp, createRng, hashString, lerp, pick } from "../../shared/random.ts";
import { generatePlans, grammarsForPreset } from "../planner.ts";

export interface CrossbreedOptions {
  inheritance: number;
  settings: MutationSettings;
  count?: number;
}

export function canCrossbreed(
  a: CrossbreedParent,
  b: CrossbreedParent,
): { ok: true } | { ok: false; reason: string } {
  if (a.frameId === b.frameId) {
    return { ok: false, reason: "Choose two different parents." };
  }
  if (a.sourceFingerprint !== b.sourceFingerprint) {
    return {
      ok: false,
      reason:
        "These variations came from different source structures. Crossbreed needs two directions built from the same composition.",
    };
  }
  if (a.preset === b.preset && a.grammar === b.grammar) {
    return {
      ok: false,
      reason:
        "These two variations already share the same engine. Regenerate one or pick a different parent.",
    };
  }
  return { ok: true };
}

export function mixDna(
  a: DesignDNA,
  b: DesignDNA,
  inheritance: number,
  rng: () => number,
  variation = 0,
): DesignDNA {
  const t = clamp(inheritance / 100, 0, 1);
  const jitter = (amount: number) => (rng() - 0.5) * amount;
  const numeric = (key: keyof DesignDNA, amount = 0) => {
    const left = a[key] as number;
    const right = b[key] as number;
    return lerp(left, right, t) + jitter(amount);
  };
  return {
    margin: clamp(numeric("margin", 0.008), 0.018, 0.25),
    columns: Math.max(3, Math.round(numeric("columns", 0))),
    gutter: clamp(numeric("gutter", 0.003), 0.006, 0.05),
    asymmetry: clamp(numeric("asymmetry", 0.05), -0.8, 0.9),
    rotation: clamp(numeric("rotation", 0.7), 0, 16),
    scaleContrast: clamp(numeric("scaleContrast", 0.04), 0.15, 1),
    decorative: clamp(numeric("decorative", 0.05), 0.01, 1),
    occupancy: clamp(numeric("occupancy", 0.03), 0.12, 0.96),
    alignment:
      t < 0.34
        ? a.alignment
        : t > 0.66
          ? b.alignment
          : pick(rng, [a.alignment, b.alignment, "mixed"]),
    split: clamp(numeric("split", 0.03), 0.32, 0.72),
    backgroundMode:
      t < 0.4 ? a.backgroundMode : t > 0.6 ? b.backgroundMode : pick(rng, [a.backgroundMode, b.backgroundMode]),
    colorStrategy:
      t < 0.33
        ? a.colorStrategy
        : t > 0.67
          ? b.colorStrategy
          : variation % 2 === 0
            ? a.colorStrategy
            : b.colorStrategy,
  };
}

export function crossbreedPlans(
  snapshot: CompositionSnapshot,
  parentA: CrossbreedParent,
  parentB: CrossbreedParent,
  options: CrossbreedOptions,
): EngineResult & { settings: MutationSettings; dna: DesignDNA; grammarPool: string[] } {
  const compatibility = canCrossbreed(parentA, parentB);
  if (!compatibility.ok) throw new Error(compatibility.reason);
  if (parentA.sourceFingerprint !== snapshot.fingerprint) {
    throw new Error(
      "The current source no longer matches these parents. Crossbreed from the generated frames instead, or regenerate the batch.",
    );
  }
  const inheritance = clamp(options.inheritance, 0, 100);
  const t = inheritance / 100;
  const settings = sanitizeSettings({
    ...options.settings,
    preset: t < 0.5 ? parentA.preset : parentB.preset,
    chaos: Math.round(lerp(parentA.settings.chaos, parentB.settings.chaos, t)),
    density: Math.round(lerp(parentA.settings.density, parentB.settings.density, t)),
    hierarchy: Math.round(lerp(parentA.settings.hierarchy, parentB.settings.hierarchy, t)),
    seed:
      (hashString(
        `${options.settings.seed}:${parentA.seed}:${parentB.seed}:${inheritance}`,
      ) %
        8_999_999) +
      1,
  });
  const baseSeed = settings.seed;
  const grammarPool = hybridGrammarPool(parentA, parentB, t);
  const count = Math.max(1, Math.min(4, options.count ?? 4));
  let firstDna: DesignDNA | null = null;
  const dnaForVariation = (_index: number, seed: number) => {
    const rng = createRng(seed);
    const dna = mixDna(parentA.dna, parentB.dna, inheritance, rng, _index);
    if (!firstDna) firstDna = dna;
    return dna;
  };
  const result = generatePlans(
    snapshot,
    { ...settings, seed: baseSeed },
    {
      count,
      grammarIds: grammarPool,
      salt: `cross:${parentA.frameId}:${parentB.frameId}:${inheritance}`,
      dnaForVariation,
    },
  );
  return {
    ...result,
    settings,
    dna: firstDna ?? mixDna(parentA.dna, parentB.dna, inheritance, createRng(baseSeed)),
    grammarPool,
  };
}

export function hybridGrammarPool(
  a: CrossbreedParent,
  b: CrossbreedParent,
  t: number,
): string[] {
  const aPool = grammarsForPreset(a.preset);
  const bPool = grammarsForPreset(b.preset);
  const aGrammar = aPool.includes(a.grammar) ? a.grammar : aPool[0];
  const bGrammar = bPool.includes(b.grammar) ? b.grammar : bPool[0];
  const pool: string[] = [];
  const push = (id: string) => {
    if (id && !pool.includes(id)) pool.push(id);
  };
  if (t <= 0.5) {
    push(aGrammar);
    push(bGrammar);
  } else {
    push(bGrammar);
    push(aGrammar);
  }
  for (let index = 1; index < Math.max(aPool.length, bPool.length); index += 1) {
    if (t <= 0.5) {
      push(aPool[index % aPool.length]);
      push(bPool[index % bPool.length]);
    } else {
      push(bPool[index % bPool.length]);
      push(aPool[index % aPool.length]);
    }
  }
  return pool.slice(0, 6);
}

export function crossbreedName(a: CrossbreedParent, b: CrossbreedParent): string {
  return `${PRESETS[a.preset]?.name ?? a.preset} × ${PRESETS[b.preset]?.name ?? b.preset}`;
}

export function inheritanceLabel(inheritance: number, a: CrossbreedParent, b: CrossbreedParent): string {
  if (inheritance <= 12) return `${PRESETS[a.preset]?.name ?? a.preset} dominant`;
  if (inheritance >= 88) return `${PRESETS[b.preset]?.name ?? b.preset} dominant`;
  if (inheritance < 40) return `Leaning ${PRESETS[a.preset]?.name ?? a.preset}`;
  if (inheritance > 60) return `Leaning ${PRESETS[b.preset]?.name ?? b.preset}`;
  return "Equal inheritance";
}
