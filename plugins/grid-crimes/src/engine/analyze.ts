import type {
  BlockSnapshot,
  CompositionSnapshot,
  Rect,
  Role,
  SelectionKind,
  TextMeta,
} from "../shared/types.ts";
import { emptyRoleCounts } from "../shared/settings.ts";
import { fingerprint } from "../shared/random.ts";
import { round } from "./geometry.ts";

/** Raw, Figma-independent block information collected by the controller. */
export interface RawBlock {
  id: string;
  name: string;
  sourceType: string;
  bounds: Rect;
  rotation: number;
  text: TextMeta | null;
  hasImage: boolean;
  hasVector: boolean;
  hasSolidFill: boolean;
  fillColors: string[];
  isInstance: boolean;
  isAutoLayout: boolean;
  childCount: number;
  resizeMode: BlockSnapshot["resizeMode"];
  canColorize: boolean;
  canRotate: boolean;
  role?: Role;
  hasMissingFont?: boolean;
}

export type AnalyzedBlock = RawBlock & { role: Role };

export interface RawComposition {
  selectionKind: SelectionKind;
  name: string;
  sourceIds: string[];
  width: number;
  height: number;
  background: string;
  palette: string[];
  blocks: RawBlock[];
  warnings: string[];
}

const HEADLINE_NAME = /(headline|head\b|hero|title|display|h1\b|masthead)/i;
const SUBHEAD_NAME = /(subhead|subtitle|deck|standfirst|h2\b|intro)/i;
const BODY_NAME = /(body|copy|paragraph|description|text|story|article|blurb)/i;
const ACTION_NAME = /(button|cta|action|submit|sign\s?up|link)/i;
const LABEL_NAME = /(label|meta|caption|eyebrow|kicker|tag|date|credit|footnote|nav)/i;
const VISUAL_NAME = /(image|photo|visual|picture|img|media|thumbnail|cover|artwork)/i;
const DECOR_NAME = /(line|rule|divider|dot|stamp|badge|shape|decor|ornament|mark)/i;

function isThin(bounds: Rect): boolean {
  return bounds.w < 10 || bounds.h < 10 || bounds.w / Math.max(1, bounds.h) > 18 || bounds.h / Math.max(1, bounds.w) > 18;
}

function shortText(text: TextMeta | null): boolean {
  return Boolean(text && text.length > 0 && text.length <= 48);
}

/**
 * Heuristic role inference. These are intentionally conservative: a wrong
 * headline is worse than a useful "module", because modules are placed as
 * coherent groups rather than being dramatically re-scaled.
 */
export function inferRoles(blocks: RawBlock[]): AnalyzedBlock[] {
  const result: AnalyzedBlock[] = blocks.map((block) => ({
    ...block,
    role: block.role ?? "module",
  }));
  const textBlocks = result
    .filter((block) => block.text)
    .sort(
      (a, b) =>
        (b.text?.fontSize ?? 0) - (a.text?.fontSize ?? 0) ||
        b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h,
    );

  const namedHeadline = textBlocks.find((block) => HEADLINE_NAME.test(block.name));
  const largest = textBlocks[0];
  const headline =
    namedHeadline ??
    (largest && (largest.text?.fontSize ?? 0) >= 20 ? largest : null);

  let subhead: RawBlock | null = null;
  const namedSubhead = textBlocks.find(
    (block) => block !== headline && SUBHEAD_NAME.test(block.name),
  );
  if (namedSubhead) subhead = namedSubhead;
  else {
    const candidates = textBlocks.filter(
      (block) =>
        block !== headline &&
        (block.text?.fontSize ?? 0) >= Math.max(15, (headline?.text?.fontSize ?? 28) * 0.38),
    );
    if (candidates.length && (candidates[0].text?.length ?? 0) < 180) {
      subhead = candidates[0];
    }
  }

  for (const block of result) {
    const area = block.bounds.w * block.bounds.h;
    if (block === headline) {
      block.role = "headline";
      continue;
    }
    if (block === subhead) {
      block.role = "subhead";
      continue;
    }
    if (ACTION_NAME.test(block.name) && (shortText(block.text) || block.childCount > 0)) {
      block.role = "action";
      continue;
    }
    if (block.text) {
      const size = block.text.fontSize;
      const length = block.text.length;
      if (LABEL_NAME.test(block.name) || (size <= 13 && length <= 120)) {
        block.role = "label";
      } else if (
        BODY_NAME.test(block.name) ||
        length > 90 ||
        size <= 19
      ) {
        block.role = "body";
      } else if (length <= 70 && size >= 18) {
        block.role = "subhead";
      } else {
        block.role = "body";
      }
      continue;
    }
    if (
      (VISUAL_NAME.test(block.name) || block.hasImage) &&
      !isThin(block.bounds)
    ) {
      block.role = "visual";
      continue;
    }
    if (DECOR_NAME.test(block.name) && area < 0.02 * 1_000_000) {
      block.role = "decoration";
      continue;
    }
    if (isThin(block.bounds) || area < result.reduce((sum, b) => sum + b.bounds.w * b.bounds.h, 0) * 0.003) {
      block.role = "decoration";
      continue;
    }
    if (
      (block.isInstance || block.isAutoLayout || block.childCount > 1) &&
      shortText(block.text)
    ) {
      block.role = "action";
      continue;
    }
    if (
      (block.sourceType === "RECTANGLE" ||
        block.sourceType === "ELLIPSE" ||
        block.sourceType === "VECTOR" ||
        block.sourceType === "POLYGON" ||
        block.sourceType === "STAR") &&
      !block.text
    ) {
      block.role = area > 0.025 * 1_000_000 ? "visual" : "decoration";
      continue;
    }
    if (block.childCount >= 1 || block.isInstance) {
      block.role = "module";
      continue;
    }
    block.role = "decoration";
  }

  // Action correction: a short-text frame with a solid fill reads as a CTA.
  for (const block of result) {
    if (
      block.role === "label" &&
      block.text &&
      block.text.length <= 28 &&
      block.hasSolidFill &&
      block.fillColors.length > 0 &&
      block.bounds.w >= 60 &&
      block.bounds.w <= 360 &&
      block.bounds.h >= 28 &&
      block.bounds.h <= 110
    ) {
      block.role = "action";
    }
  }

  // Prefer a visual role for the largest image-like block if none exists.
  if (!result.some((block) => block.role === "visual")) {
    const candidate = result
      .filter((block) => block.hasImage)
      .sort((a, b) => b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h)[0];
    if (candidate) candidate.role = "visual";
  }

  // Ensure there is always a focal point.
  if (!result.some((block) => block.role === "headline")) {
    const focal = [...result].sort(
      (a, b) => b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h,
    )[0];
    if (focal) focal.role = "subhead";
  }

  return result;
}

export function buildSnapshot(
  raw: RawComposition,
  options: { preserveRoles?: boolean } = {},
): CompositionSnapshot {
  const blocks = options.preserveRoles
    ? raw.blocks.map((block) => ({
        ...block,
        role: block.role ?? "module",
      }))
    : inferRoles(raw.blocks);
  const roleCounts = emptyRoleCounts();
  const totalArea = Math.max(1, raw.width * raw.height);
  const enriched: BlockSnapshot[] = blocks.map((block) => {
    roleCounts[block.role] += 1;
    return {
      id: block.id,
      name: block.name,
      sourceType: block.sourceType,
      role: block.role,
      bounds: {
        x: round(block.bounds.x),
        y: round(block.bounds.y),
        w: round(block.bounds.w),
        h: round(block.bounds.h),
      },
      rotation: round(block.rotation),
      areaShare: round((block.bounds.w * block.bounds.h) / totalArea, 4),
      text: block.text ?? undefined,
      hasImage: block.hasImage,
      hasVector: block.hasVector,
      hasSolidFill: block.hasSolidFill,
      fillColors: block.fillColors,
      isInstance: block.isInstance,
      isAutoLayout: block.isAutoLayout,
      childCount: block.childCount,
      resizeMode: block.resizeMode,
      canColorize: block.canColorize,
      canRotate: block.canRotate,
      hasMissingFont: block.hasMissingFont ?? false,
    };
  });

  const structure = enriched
    .map(
      (block) =>
        `${block.role}:${block.sourceType}:${Math.round(
          (block.bounds.w / Math.max(1, raw.width)) * 100,
        )}x${Math.round((block.bounds.h / Math.max(1, raw.height)) * 100)}`,
    )
    .join("|");

  return {
    version: 1,
    selectionKind: raw.selectionKind,
    name: raw.name,
    sourceIds: raw.sourceIds,
    width: raw.width,
    height: raw.height,
    background: raw.background,
    palette: raw.palette,
    blocks: enriched,
    fonts: collectFonts(enriched),
    warnings: raw.warnings,
    roleCounts,
    fingerprint: fingerprint(structure),
    analyzedAt: Date.now(),
  };
}

export function collectFonts(blocks: BlockSnapshot[]) {
  const fonts = new Map<string, { family: string; style: string }>();
  for (const block of blocks) {
    for (const font of block.text?.fonts ?? []) {
      fonts.set(`${font.family}::${font.style}`, font);
    }
  }
  return [...fonts.values()];
}

/** Human-readable warnings shown before generation. */
export function inspectSnapshot(snapshot: CompositionSnapshot): string[] {
  const warnings = [...snapshot.warnings];
  if (snapshot.blocks.length > 30) {
    warnings.push(
      `${snapshot.blocks.length} elements is beyond the comfortable v1 limit of 30. The composition will be simplified into supporting zones.`,
    );
  }
  if (snapshot.blocks.length === 1) {
    warnings.push(
      "Only one element was found. The result will be a single-focal composition rather than a full layout.",
    );
  }
  if (!snapshot.blocks.some((block) => block.role === "headline")) {
    warnings.push(
      "No clear headline was detected. Use the role controls to promote the strongest text layer.",
    );
  }
  const missing = snapshot.blocks.filter(
    (block) => block.text?.hasMissingFont || block.hasMissingFont,
  );
  if (missing.length) {
    warnings.push(
      `${missing.length} text layer${missing.length === 1 ? " uses" : "s use"} an unavailable font. Their formatting will be preserved without typographic changes.`,
    );
  }
  return [...new Set(warnings)];
}

export function primaryBlocks(snapshot: CompositionSnapshot, limit = 6) {
  const priority: Role[] = [
    "headline",
    "visual",
    "subhead",
    "action",
    "body",
    "module",
    "label",
    "decoration",
  ];
  return [...snapshot.blocks]
    .sort(
      (a, b) =>
        priority.indexOf(a.role) - priority.indexOf(b.role) ||
        b.areaShare - a.areaShare,
    )
    .slice(0, limit);
}
