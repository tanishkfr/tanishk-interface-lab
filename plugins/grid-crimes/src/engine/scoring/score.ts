import type {
  BlockSnapshot,
  CompositionSnapshot,
  LayoutPlan,
  PlannedBlock,
  Rect,
} from "../../shared/types.ts";
import {
  contrastRatio,
  relativeLuminance,
} from "../../shared/color.ts";
import {
  bottom,
  isInside,
  overlapRatio,
  right,
  rotatedBounds,
  area,
  center,
} from "../geometry.ts";
import { clamp } from "../../shared/random.ts";

export interface ScoreResult {
  total: number;
  parts: Record<string, number>;
  issues: string[];
  hard: string[];
  valid: boolean;
}

const TEXT_ROLES = new Set(["headline", "subhead", "body", "action", "label"]);

function blockBounds(block: PlannedBlock): Rect {
  return block.rotation
    ? rotatedBounds(block.rect, block.rotation)
    : block.rect;
}

function textCoverage(block: PlannedBlock): number {
  return block.text ? 1 : 0;
}

function countCharsPerLine(block: PlannedBlock): number | null {
  if (!block.text) return null;
  const snapText = block.text;
  // Approximate average glyph width for a grotesk at this size.
  return block.rect.w / Math.max(1, snapText.fontSize * 0.52);
}

function weightOf(block: PlannedBlock): number {
  switch (block.role) {
    case "headline":
      return 5;
    case "visual":
      return 3.5;
    case "subhead":
      return 2.5;
    case "action":
      return 2;
    case "body":
      return 1.5;
    case "module":
      return 1.4;
    case "label":
      return 1;
    default:
      return 0.5;
  }
}

function backedBy(plan: LayoutPlan, rect: Rect): boolean {
  const textArea = Math.max(1, area(rect));
  return plan.decorations.some((decoration) => {
    if (!decoration.backing) return false;
    const overlap =
      Math.max(0, Math.min(right(rect), right(decoration.rect)) - Math.max(rect.x, decoration.rect.x)) *
      Math.max(0, Math.min(bottom(rect), bottom(decoration.rect)) - Math.max(rect.y, decoration.rect.y));
    return overlap / textArea >= 0.88;
  });
}

function backingColor(plan: LayoutPlan, rect: Rect): string | null {
  const found = plan.decorations.find((decoration) => {
    if (!decoration.backing) return false;
    return (
      decoration.rect.x <= rect.x + 2 &&
      decoration.rect.y <= rect.y + 2 &&
      right(decoration.rect) >= right(rect) - 2 &&
      bottom(decoration.rect) >= bottom(rect) - 2
    );
  });
  return found?.color ?? null;
}

export function scorePlan(
  plan: LayoutPlan,
  snapshot: CompositionSnapshot,
): ScoreResult {
  const issues: string[] = [];
  const hard: string[] = [];
  const parts: Record<string, number> = {};
  const frame = { x: 0, y: 0, w: plan.width, h: plan.height };
  const texts = plan.blocks.filter((block) => TEXT_ROLES.has(block.role) && block.text);
  const visualBlocks = plan.blocks.filter((block) => block.role === "visual");
  const allContent = plan.blocks;

  // 1. Containment.
  let contained = 0;
  for (const block of allContent) {
    const bounds = blockBounds(block);
    if (block.text || block.role === "action" || block.role === "module") {
      const tolerance = block.text ? 3 : 10;
      if (isInside(bounds, frame, tolerance)) contained += 1;
      else {
        contained += 0.25;
        if (block.text) {
          hard.push(`${block.name} leaves the frame`);
        }
      }
    } else {
      // Visuals may bleed, but not escape the composition by a huge margin.
      const bleedW = Math.min(plan.width, plan.height) * 0.08;
      if (
        bounds.x >= -bleedW &&
        bounds.y >= -bleedW &&
        right(bounds) <= plan.width + bleedW &&
        bottom(bounds) <= plan.height + bleedW
      ) {
        contained += 1;
      } else {
        contained += 0.4;
      }
    }
  }
  parts.containment = allContent.length ? contained / allContent.length : 1;

  // 2. Collisions. Text-text is never allowed. Text over a visual or other
  // block is allowed only when an opaque backing panel covers the word box.
  let collisions = 0;
  let collisionChecks = 0;
  for (let i = 0; i < texts.length; i += 1) {
    const a = texts[i];
    const aRect = blockBounds(a);
    for (let j = i + 1; j < texts.length; j += 1) {
      const b = texts[j];
      collisionChecks += 1;
      const ratio = overlapRatio(aRect, blockBounds(b));
      if (ratio > 0.02) {
        collisions += 1;
        hard.push(`Text collision: ${a.name} × ${b.name}`);
      }
    }
    for (const other of allContent) {
      if (other.sourceId === a.sourceId || other.text) continue;
      collisionChecks += 1;
      const ratio = overlapRatio(aRect, blockBounds(other));
      if (ratio > 0.04 && !backedBy(plan, aRect)) {
        collisions += 1;
        if (a.role !== "label" || ratio > 0.2) {
          hard.push(`Unbacked text overlap: ${a.name} over ${other.name}`);
        }
      } else if (ratio > 0.04 && backedBy(plan, aRect)) {
        collisions += 0.15;
      }
    }
    for (const decoration of plan.decorations) {
      if (decoration.z > (a.z ?? 30) + 2 && decoration.opacity > 0.25 && !decoration.backing) {
        const ratio = overlapRatio(aRect, decoration.rect);
        if (ratio > 0.08) {
          collisions += 0.3;
          issues.push(`A foreground rule crosses ${a.name}`);
        }
      }
    }
  }
  parts.collisions = collisionChecks
    ? clamp(1 - collisions / Math.max(1, collisionChecks * 0.9), 0, 1)
    : 1;

  // 3. Minimum usable sizes and text legibility.
  let legible = 0;
  let legibleChecks = 0;
  for (const block of texts) {
    legibleChecks += 1;
    const size = block.text!.fontSize;
    const min = block.role === "headline" ? 18 : block.role === "body" ? 9 : 7.5;
    if (size >= min && block.rect.w >= 32 && block.rect.h >= 12) legible += 1;
    else {
      legible += 0.2;
      issues.push(`${block.name} is smaller than the readable minimum`);
      if (block.role === "body" || block.role === "action") {
        hard.push(`${block.name} is too small to read`);
      }
    }
    const lineHeight = block.text!.lineHeight ?? 1.25;
    if (block.rect.h < size * lineHeight * 0.82) {
      legible -= 0.25;
      issues.push(`${block.name} has more text than its box can hold`);
      if (block.role === "body" || block.role === "action") {
        hard.push(`${block.name} is squeezed into too little height`);
      }
    }
    const cpl = countCharsPerLine(block);
    if (cpl && cpl < 3 && (block.role === "body" || block.role === "headline")) {
      legible -= 0.2;
    }
  }
  parts.legibility = legibleChecks ? clamp(legible / legibleChecks, 0, 1) : 1;

  // 4. Contrast for planned text colours.
  let contrastScore = 1;
  let contrastChecks = 0;
  for (const block of texts) {
    if (!block.color) continue;
    contrastChecks += 1;
    const backdrop =
      backingColor(plan, blockBounds(block)) ??
      plan.background;
    const ratio = contrastRatio(block.color, backdrop);
    if (ratio >= 4.5) contrastScore += 0;
    else if (ratio >= 3) contrastScore -= 0.3;
    else {
      contrastScore -= 0.6;
      issues.push(`Low contrast on ${block.name}`);
      if (block.role === "body" || block.role === "action") {
        hard.push(`Unreadable contrast on ${block.name}`);
      }
    }
  }
  parts.contrast = clamp(contrastChecks ? contrastScore / contrastChecks : 1, 0, 1);

  // 5. Hierarchy.
  const headline = plan.blocks.find((block) => block.role === "headline" && block.text);
  const bodySizes = plan.blocks
    .filter((block) => block.role === "body" && block.text)
    .map((block) => block.text!.fontSize)
    .sort((a, b) => a - b);
  const medianBody = bodySizes.length
    ? bodySizes[Math.floor(bodySizes.length / 2)]
    : 14;
  const scaleRatio = headline?.text ? headline.text.fontSize / Math.max(1, medianBody) : 1;
  const targetRatio = 1.4 + (plan.settings.hierarchy / 100) * 3;
  parts.hierarchy = clamp(1 - Math.abs(scaleRatio - targetRatio) / (targetRatio + 1.6), 0, 1);

  // 6. Density / occupancy.
  const covered = allContent.reduce((sum, block) => sum + area(blockBounds(block)), 0);
  const normalizedCoverage = covered / Math.max(1, plan.width * plan.height);
  const target = plan.dna.occupancy;
  parts.density = clamp(1 - Math.abs(normalizedCoverage - target) * 1.7, 0, 1);
  if (normalizedCoverage > 1.25) issues.push("The composition is overfilled");

  // 7. Visual balance. Weighted centre should be near the frame centre or the
  // preset's intended asymmetry, not collapsed into a corner.
  let weight = 0;
  let cx = 0;
  let cy = 0;
  for (const block of allContent) {
    const w = weightOf(block);
    const c = center(blockBounds(block));
    weight += w;
    cx += c.x * w;
    cy += c.y * w;
  }
  if (weight > 0) {
    const nx = cx / weight / plan.width;
    const ny = cy / weight / plan.height;
    const desiredX = 0.5 + plan.dna.asymmetry * 0.1;
    const balance = 1 - (Math.abs(nx - desiredX) * 0.9 + Math.abs(ny - 0.5) * 0.8);
    parts.balance = clamp(balance, 0, 1);
  } else parts.balance = 0;

  // 8. Rhythm. Consistent gaps for the disciplined presets, tolerant for the
  // expressive ones.
  const sorted = [...allContent].sort((a, b) => blockBounds(a).y - blockBounds(b).y);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const previous = blockBounds(sorted[i - 1]);
    const current = blockBounds(sorted[i]);
    gaps.push(Math.max(0, current.y - bottom(previous)));
  }
  let rhythm = 1;
  if (gaps.length >= 3) {
    const mean = gaps.reduce((sum, n) => sum + n, 0) / gaps.length;
    const variance = gaps.reduce((sum, n) => sum + (n - mean) ** 2, 0) / gaps.length;
    const cv = Math.sqrt(variance) / Math.max(1, mean);
    const tolerance = plan.preset === "chaos" || plan.preset === "antigrid" ? 1.6 : 0.9;
    rhythm = clamp(1 - Math.max(0, cv - tolerance) * 0.5, 0, 1);
  }
  parts.rhythm = rhythm;

  // 9. Meaningful difference from the source structure.
  let displacement = 0;
  let displacementChecks = 0;
  for (const planned of allContent) {
    const source = snapshot.blocks.find((block) => block.id === planned.sourceId);
    if (!source) continue;
    displacementChecks += 1;
    const sourceCx = (source.bounds.x + source.bounds.w / 2) / Math.max(1, snapshot.width);
    const sourceCy = (source.bounds.y + source.bounds.h / 2) / Math.max(1, snapshot.height);
    const c = center(blockBounds(planned));
    displacement += Math.hypot(c.x / plan.width - sourceCx, c.y / plan.height - sourceCy);
  }
  const averageDisplacement = displacementChecks ? displacement / displacementChecks : 0;
  parts.difference = clamp(averageDisplacement / 0.22, 0, 1);

  // 10. Preset fit. Each art direction has a different idea of a good page.
  const rotations = allContent.filter((block) => Math.abs(block.rotation) > 1).length;
  const decorationCount = plan.decorations.length;
  const alignmentSpread = new Set(
    texts.map((block) => Math.round(block.rect.x / Math.max(1, plan.width * 0.02))),
  ).size;
  let fit = 0.5;
  switch (plan.preset) {
    case "brutalist":
      fit =
        0.3 * clamp((scaleRatio - 1) / 2.5, 0, 1) +
        0.25 * clamp(decorationCount / 8, 0, 1) +
        0.25 * clamp(normalizedCoverage / 0.7, 0, 1) +
        0.2 * clamp(rotations / 4, 0, 1);
      break;
    case "swiss":
      fit =
        0.3 * clamp(1 - alignmentSpread / 12, 0, 1) +
        0.25 * clamp((0.85 - normalizedCoverage) / 0.5, 0, 1) +
        0.2 * clamp(scaleRatio / 3, 0, 1) +
        0.25 * clamp(1 - rotations / 3, 0, 1);
      break;
    case "minimal":
      fit =
        0.45 * clamp((0.5 - normalizedCoverage) / 0.4, 0, 1) +
        0.25 * clamp(1 - decorationCount / 9, 0, 1) +
        0.2 * clamp((scaleRatio - 1) / 2, 0, 1) +
        0.1 * clamp(1 - rotations / 2, 0, 1);
      break;
    case "maximal":
      fit =
        0.35 * clamp(normalizedCoverage / 0.9, 0, 1) +
        0.3 * clamp(decorationCount / 10, 0, 1) +
        0.2 * clamp(rotations / 5, 0, 1) +
        0.15 * clamp(scaleRatio / 4, 0, 1);
      break;
    case "antigrid":
      fit =
        0.3 * clamp((alignmentSpread - 2) / 6, 0, 1) +
        0.25 * clamp(rotations / 4, 0, 1) +
        0.2 * clamp(1 - Math.abs(normalizedCoverage - 0.5) / 0.5, 0, 1) +
        0.25 * clamp(decorationCount / 9, 0, 1);
      break;
    case "chaos":
      fit =
        0.25 * clamp(decorationCount / 10, 0, 1) +
        0.2 * clamp(rotations / 5, 0, 1) +
        0.25 * clamp(normalizedCoverage / 0.8, 0, 1) +
        0.3 * clamp((alignmentSpread - 1) / 6, 0, 1);
      break;
  }
  parts.presetFit = clamp(fit, 0, 1);

  // 11. Reading-order coherence for content in the upper half. Not a hard rule;
  // expressive directions may deliberately place the headline low.
  const headlineBlock = plan.blocks.find((block) => block.role === "headline");
  const bodyBlocks = plan.blocks.filter((block) => block.role === "body");
  let reading = 1;
  if (headlineBlock && bodyBlocks.length && plan.preset !== "antigrid" && plan.preset !== "chaos") {
    const hY = center(blockBounds(headlineBlock)).y;
    const bodyAbove = bodyBlocks.filter((block) => center(blockBounds(block)).y < hY - plan.height * 0.08);
    reading = clamp(1 - bodyAbove.length / bodyBlocks.length, 0, 1);
  }
  parts.readingOrder = reading;

  const weights: Record<string, number> = {
    containment: 0.17,
    collisions: 0.19,
    legibility: 0.12,
    contrast: 0.1,
    hierarchy: 0.12,
    density: 0.08,
    balance: 0.06,
    rhythm: 0.04,
    difference: 0.05,
    presetFit: 0.04,
    readingOrder: 0.03,
  };
  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += (parts[key] ?? 0) * weight;
  }
  total = clamp(total * 100, 0, 100);
  // Hard constraints must dominate the score so a broken candidate can never
  // be selected over a boring but intact one.
  total = clamp(total - hard.length * 8, 0, 100);

  return {
    total: Math.round(total * 10) / 10,
    parts: Object.fromEntries(
      Object.entries(parts).map(([key, value]) => [key, Math.round(value * 100) / 100]),
    ),
    issues: [...new Set(issues)].slice(0, 12),
    hard: [...new Set(hard)].slice(0, 12),
    valid: hard.length === 0 && total >= 48,
  };
}

export function planSignature(plan: LayoutPlan): number[] {
  return plan.blocks
    .filter((block) => block.role !== "decoration")
    .sort((a, b) => a.sourceId.localeCompare(b.sourceId))
    .flatMap((block) => [
      block.rect.x / Math.max(1, plan.width),
      block.rect.y / Math.max(1, plan.height),
      block.rect.w / Math.max(1, plan.width),
      block.rect.h / Math.max(1, plan.height),
    ]);
}

export function layoutDistance(a: LayoutPlan, b: LayoutPlan): number {
  const aSig = planSignature(a);
  const bSig = planSignature(b);
  if (!aSig.length || aSig.length !== bSig.length) return 1;
  let total = 0;
  for (let i = 0; i < aSig.length; i += 1) total += Math.abs(aSig[i] - bSig[i]);
  return total / aSig.length;
}

export function containsUnreadableText(plan: LayoutPlan): boolean {
  return plan.blocks.some(
    (block) =>
      block.text &&
      (block.role === "body" || block.role === "action") &&
      block.text.fontSize < 8.5,
  );
}

export function sourceBackdropIsDark(plan: LayoutPlan): boolean {
  return relativeLuminance(plan.background) < 0.35;
}

export type { BlockSnapshot };
