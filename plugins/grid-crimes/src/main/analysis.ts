import type {
  CompositionSnapshot,
  CrossbreedMeta,
  Rect,
  Role,
  SelectionKind,
  TextMeta,
} from "../shared/types.ts";
import { ROLE_KEY } from "../shared/types.ts";
import {
  buildSnapshot,
  inspectSnapshot,
  type RawBlock,
  type RawComposition,
} from "../engine/analyze.ts";
import {
  figmaColorToHex,
  isNearBlack,
  isNearWhite,
  normalizeHex,
  uniquePalette,
} from "../shared/color.ts";
import { LAB } from "../shared/presets.ts";
import { roleFromMeta } from "../shared/meta.ts";

const MAX_BLOCKS = 30;
const MAX_SCAN_NODES = 90;
const FRAME_TYPES = new Set(["FRAME", "GROUP", "SECTION", "COMPONENT"]);
const SUPPORTED_BLOCK_TYPES = new Set([
  "TEXT",
  "FRAME",
  "GROUP",
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "RECTANGLE",
  "ELLIPSE",
  "POLYGON",
  "VECTOR",
  "STAR",
  "LINE",
  "BOOLEAN_OPERATION",
  "SECTION",
]);

export interface AnalysisResult {
  snapshot: CompositionSnapshot | null;
  problem: string | null;
  sourceNodes: SceneNode[];
}

function isVisible(node: SceneNode): boolean {
  return !node.removed && node.visible;
}

function absoluteBounds(node: SceneNode): Rect | null {
  try {
    const box = node.absoluteBoundingBox;
    if (!box) return null;
    return { x: box.x, y: box.y, w: box.width, h: box.height };
  } catch {
    return null;
  }
}

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return "children" in node;
}

function paintsOf(node: SceneNode): readonly Paint[] {
  try {
    const fills = (node as SceneNode & { fills?: readonly Paint[] | PluginAPI["mixed"] })
      .fills;
    return Array.isArray(fills) ? fills : [];
  } catch {
    return [];
  }
}

function colorFromPaint(paint: Paint): string | null {
  if (paint.type === "SOLID" && paint.visible !== false) {
    const opacity = paint.opacity ?? 1;
    if (opacity < 0.18) return null;
    return figmaColorToHex(paint.color);
  }
  if (paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL" || paint.type === "GRADIENT_ANGULAR" || paint.type === "GRADIENT_DIAMOND") {
    const stop = paint.gradientStops?.[0];
    if (stop) return figmaColorToHex(stop.color);
  }
  return null;
}

function collectFills(
  node: SceneNode,
  depth = 0,
  visited = { count: 0 },
): string[] {
  if (depth > 3 || visited.count > MAX_SCAN_NODES) return [];
  visited.count += 1;
  const colors: string[] = [];
  for (const paint of paintsOf(node)) {
    const color = colorFromPaint(paint);
    if (color) colors.push(color);
  }
  if (hasChildren(node) && node.type !== "INSTANCE") {
    for (const child of node.children) {
      if (!isVisible(child)) continue;
      colors.push(...collectFills(child, depth + 1, visited));
    }
  }
  return colors;
}

function deepFlags(
  node: SceneNode,
  depth = 0,
  visited = { count: 0 },
): {
  hasImage: boolean;
  hasVector: boolean;
  hasSolid: boolean;
  hasText: boolean;
  hasMissingFont: boolean;
} {
  if (depth > 3 || visited.count > MAX_SCAN_NODES) {
    return {
      hasImage: false,
      hasVector: false,
      hasSolid: false,
      hasText: false,
      hasMissingFont: false,
    };
  }
  visited.count += 1;
  let hasImage = false;
  let hasVector = false;
  let hasSolid = false;
  let hasText = node.type === "TEXT";
  let hasMissingFont = node.type === "TEXT" && node.hasMissingFont;
  for (const paint of paintsOf(node)) {
    if (paint.type === "IMAGE" && paint.visible !== false) hasImage = true;
    if (paint.type === "SOLID" && (paint.opacity ?? 1) > 0.2) hasSolid = true;
  }
  if (
    node.type === "VECTOR" ||
    node.type === "BOOLEAN_OPERATION" ||
    node.type === "STAR" ||
    node.type === "POLYGON" ||
    node.type === "LINE" ||
    node.type === "TEXT_PATH"
  ) {
    hasVector = true;
  }
  if (hasChildren(node) && node.type !== "INSTANCE") {
    for (const child of node.children) {
      if (!isVisible(child)) continue;
      const flags = deepFlags(child, depth + 1, visited);
      hasImage ||= flags.hasImage;
      hasVector ||= flags.hasVector;
      hasSolid ||= flags.hasSolid;
      hasText ||= flags.hasText;
      hasMissingFont ||= flags.hasMissingFont;
    }
  }
  return { hasImage, hasVector, hasSolid, hasText, hasMissingFont };
}

function numericOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readTextMeta(node: TextNode): TextMeta {
  const characters = node.characters ?? "";
  let fonts: TextMeta["fonts"] = [];
  try {
    fonts = node
      .getRangeAllFontNames(0, Math.max(1, characters.length))
      .map((font) => ({ family: font.family, style: font.style }));
  } catch {
    const font = node.fontName;
    if (font && font !== figma.mixed) {
      fonts = [{ family: font.family, style: font.style }];
    }
  }
  let fontSize = 16;
  let mixedFontSize = false;
  if (node.fontSize === figma.mixed) {
    mixedFontSize = true;
    try {
      const segments = node.getStyledTextSegments(["fontSize"]);
      fontSize = segments.reduce(
        (max, segment) => Math.max(max, numericOr(segment.fontSize, 0)),
        16,
      );
    } catch {
      fontSize = 16;
    }
  } else {
    fontSize = numericOr(node.fontSize, 16);
  }
  const lineHeight = node.lineHeight === figma.mixed ? null : node.lineHeight;
  const letterSpacing =
    node.letterSpacing === figma.mixed ? null : node.letterSpacing;
  return {
    characters,
    sample: characters.replace(/\s+/g, " ").slice(0, 80),
    length: characters.length,
    fontSize,
    lineHeight:
      lineHeight && lineHeight.unit === "PIXELS"
        ? lineHeight.value
        : lineHeight && lineHeight.unit === "PERCENT"
          ? (fontSize * lineHeight.value) / 100
          : null,
    letterSpacing: letterSpacing?.unit === "PIXELS" ? letterSpacing.value : null,
    textCase: typeof node.textCase === "string" ? node.textCase : null,
    fonts,
    hasMissingFont: node.hasMissingFont,
    mixedFontSize,
  };
}

function resizeModeFor(node: SceneNode): RawBlock["resizeMode"] {
  if (node.type === "TEXT") return "text";
  if (node.type === "INSTANCE") return "rescale";
  if (
    node.type === "VECTOR" ||
    node.type === "BOOLEAN_OPERATION" ||
    node.type === "STAR" ||
    node.type === "POLYGON" ||
    node.type === "LINE" ||
    node.type === "TEXT_PATH"
  ) {
    return "rescale";
  }
  if (hasChildren(node) && node.children.length > 0) return "rescale";
  return "frame";
}

function isInsideInstance(node: SceneNode): boolean {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "INSTANCE") return true;
    parent = parent.parent;
  }
  return false;
}

export function rawBlockFromNode(
  node: SceneNode,
  origin: { x: number; y: number },
  forcedRole?: Role,
): RawBlock | null {
  if (
    node.type === "SLICE" ||
    node.type === "CONNECTOR" ||
    node.removed ||
    !SUPPORTED_BLOCK_TYPES.has(node.type) ||
    isInsideInstance(node)
  ) {
    return null;
  }
  const bounds = absoluteBounds(node);
  if (!bounds || bounds.w < 1 || bounds.h < 1) return null;
  const text = node.type === "TEXT" ? readTextMeta(node) : null;
  const flags = deepFlags(node);
  const fills = collectFills(node);
  const children = hasChildren(node) ? node.children.length : 0;
  const hasTextDescendant = flags.hasText;
  const isInstance = node.type === "INSTANCE";
  const isAutoLayout =
    hasChildren(node) &&
    "layoutMode" in node &&
    (node as FrameNode).layoutMode !== "NONE";
  return {
    id: node.id,
    name: node.name,
    sourceType: node.type,
    role: forcedRole,
    bounds: {
      x: bounds.x - origin.x,
      y: bounds.y - origin.y,
      w: bounds.w,
      h: bounds.h,
    },
    rotation: "rotation" in node ? node.rotation : 0,
    text,
    hasImage: flags.hasImage,
    hasVector: flags.hasVector,
    hasSolidFill: flags.hasSolid || fills.length > 0,
    fillColors: uniquePalette(fills, 6),
    isInstance,
    isAutoLayout,
    childCount: children,
    resizeMode: resizeModeFor(node),
    canColorize:
      node.type === "TEXT" ||
      (!isInstance &&
        !flags.hasImage &&
        !flags.hasVector &&
        !hasTextDescendant &&
        fills.length > 0),
    canRotate: true,
    hasMissingFont: flags.hasMissingFont,
  };
}

function backgroundFor(node: SceneNode, blocks: RawBlock[]): string {
  let explicit: string | null = null;
  for (const paint of paintsOf(node)) {
    explicit = colorFromPaint(paint);
    if (explicit) break;
  }
  if (explicit) {
    if (isNearWhite(explicit) || isNearBlack(explicit)) return explicit;
    return explicit;
  }
  const candidates = blocks
    .flatMap((block) => block.fillColors)
    .filter((color) => !isNearBlack(color));
  if (candidates.length) {
    const counts = new Map<string, number>();
    for (const color of candidates) {
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? LAB.paper;
  }
  return LAB.paper;
}

function unionBounds(nodes: SceneNode[]): Rect | null {
  const boxes = nodes
    .map((node) => absoluteBounds(node))
    .filter((box): box is Rect => Boolean(box));
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.w));
  const bottom = Math.max(...boxes.map((box) => box.y + box.h));
  return { x: left, y: top, w: right - left, h: bottom - top };
}

function meaningfulChildren(node: SceneNode): SceneNode[] {
  if (!hasChildren(node)) return [];
  return node.children.filter((child) => isVisible(child));
}

function exceedsLimit(blocks: RawBlock[]): {
  blocks: RawBlock[];
  dropped: number;
} {
  if (blocks.length <= MAX_BLOCKS) return { blocks, dropped: 0 };
  const kept = [...blocks]
    .sort((a, b) => b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h)
    .slice(0, MAX_BLOCKS)
    .sort((a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x);
  return { blocks: kept, dropped: blocks.length - kept.length };
}

function selectionKindFor(node: SceneNode): SelectionKind {
  if (node.type === "GROUP") return "group";
  if (FRAME_TYPES.has(node.type)) return "frame";
  return "single";
}

export async function analyzeSelection(
  selection: readonly SceneNode[],
): Promise<AnalysisResult> {
  const hidden = selection.length === 0;
  if (hidden) {
    return {
      snapshot: null,
      problem: "Select a frame, group, or a few sibling layers to begin.",
      sourceNodes: [],
    };
  }
  const roots = selection.filter(
    (node) =>
      isVisible(node) &&
      !selection.some(
        (other) => other.id !== node.id && isAncestor(other, node),
      ),
  );
  if (!roots.length) {
    return {
      snapshot: null,
      problem:
        "The selected layers are hidden or empty. Make a frame visible and try again.",
      sourceNodes: [],
    };
  }

  // A single root with underlying structure is the main path. A single leaf
  // layer is accepted as a one-element composition rather than refused.
  let sourceNodes: SceneNode[] = roots;
  let selectionKind: SelectionKind =
    roots.length > 1 ? "multiple" : selectionKindFor(roots[0]);
  let origin: Rect | null = null;
  let width = 0;
  let height = 0;
  let background: string = LAB.paper;
  const warnings: string[] = [];

  if (roots.length === 1) {
    const root = roots[0];
    if (
      FRAME_TYPES.has(root.type) ||
      root.type === "INSTANCE"
    ) {
      let inner = meaningfulChildren(root);
      if (root.type === "INSTANCE") {
        // Instance internals must not be cloned individually; the instance is
        // the atomic composition unit.
        inner = [];
      } else if (inner.length === 1 && inner[0].type !== "INSTANCE") {
        const nested = meaningfulChildren(inner[0]);
        if (nested.length >= 2) {
          inner = nested;
        }
      }
      const rootBox = absoluteBounds(root);
      if (inner.length && rootBox) {
        sourceNodes = inner;
        origin = rootBox;
        width = rootBox.w;
        height = rootBox.h;
        selectionKind = selectionKindFor(root);
        if (inner.length === 1) {
          warnings.push(
            "The frame resolves to a single layer. The result will be a one-focal composition.",
          );
        }
      } else if (rootBox) {
        sourceNodes = [root];
        origin = rootBox;
        width = rootBox.w;
        height = rootBox.h;
        selectionKind = "single";
        warnings.push(
          root.type === "INSTANCE"
            ? "The selected instance is treated as one atomic module. Select its parent frame for a richer composition."
            : "The selected layer is treated as one atomic block.",
        );
      }
    }
    if (!origin) {
      const box = absoluteBounds(root);
      if (box) {
        origin = box;
        width = box.w;
        height = box.h;
        sourceNodes = [root];
        selectionKind = "single";
        warnings.push(
          "Only one layer is selected. The result will be a single-focal composition.",
        );
      }
    }
  }

  if (!origin) {
    origin = unionBounds(sourceNodes);
    if (origin) {
      width = origin.w;
      height = origin.h;
    }
  }
  if (!origin || width < 8 || height < 8) {
    return {
      snapshot: null,
      problem:
        "This selection has no usable size. Select a visible frame or group with real content.",
      sourceNodes: [],
    };
  }

  const blocks: RawBlock[] = [];
  let hiddenCount = 0;
  for (const node of sourceNodes) {
    if (!isVisible(node)) {
      hiddenCount += 1;
      continue;
    }
    if (node.type === "INSTANCE" && node !== sourceNodes[0] && roots.length === 1) {
      continue;
    }
    const block = rawBlockFromNode(node, origin);
    if (block) blocks.push(block);
    else warnings.push(`${node.name} has no renderable bounds and was skipped.`);
  }
  if (hiddenCount) {
    warnings.push(`${hiddenCount} hidden layer${hiddenCount === 1 ? " was" : "s were"} skipped.`);
  }
  if (!blocks.length) {
    return {
      snapshot: null,
      problem:
        "No visible, renderable layers were found. Ungroup the selection or select the contents directly.",
      sourceNodes: [],
    };
  }

  const limited = exceedsLimit(blocks);
  if (limited.dropped) {
    warnings.push(
      `${limited.dropped} small layer${limited.dropped === 1 ? " was" : "s were"} left out to keep the composition below 30 blocks.`,
    );
  }
  background = backgroundFor(sourceNodes[0], limited.blocks);
  const palette = uniquePalette(
    [
      ...limited.blocks.flatMap((block) => block.fillColors),
      background,
      LAB.acid,
      LAB.coral,
      LAB.violet,
    ].filter((color) => !isNearWhite(color) || color === background),
    10,
  );

  const raw: RawComposition = {
    selectionKind,
    name:
      roots.length === 1
        ? roots[0].name
        : `${roots.length} selected layers`,
    sourceIds: roots.map((node) => node.id),
    width: Math.round(width),
    height: Math.round(height),
    background,
    palette,
    blocks: limited.blocks,
    warnings,
  };

  const snapshot = buildSnapshot(raw);
  return {
    snapshot: { ...snapshot, warnings: inspectSnapshot(snapshot) },
    problem: null,
    sourceNodes: roots,
  };
}

function isAncestor(possibleAncestor: SceneNode, node: SceneNode): boolean {
  let parent = node.parent;
  while (parent) {
    if (parent.id === possibleAncestor.id) return true;
    parent = parent.parent;
  }
  return false;
}

/**
 * Rebuild a content snapshot from a generated frame. Roles come from plugin
 * data, so Crossbreed can work after the plugin is reopened without the
 * original source selection.
 */
export async function snapshotFromGeneratedFrame(
  frame: FrameNode,
  sourceFingerprint?: string,
): Promise<CompositionSnapshot | null> {
  const origin = absoluteBounds(frame);
  if (!origin) return null;
  const blocks: RawBlock[] = [];
  const hiddenCount = 0;
  for (const child of frame.children) {
    if (!isVisible(child)) continue;
    const role = roleFromMeta(child.getPluginData(ROLE_KEY));
    if (!role || role === "decoration") continue;
    const block = rawBlockFromNode(child, origin, role);
    if (block) blocks.push(block);
  }
  if (!blocks.length) return null;
  const background = backgroundFor(frame, blocks);
  const raw: RawComposition = {
    selectionKind: "generated",
    name: frame.name,
    sourceIds: [frame.id],
    width: Math.round(frame.width),
    height: Math.round(frame.height),
    background,
    palette: uniquePalette(
      [...blocks.flatMap((block) => block.fillColors), background, LAB.acid, LAB.coral, LAB.violet],
      10,
    ),
    blocks,
    warnings: hiddenCount ? [`${hiddenCount} hidden layers skipped.`] : [],
  };
  const snapshot = buildSnapshot(raw, { preserveRoles: true });
  if (sourceFingerprint) {
    snapshot.fingerprint = sourceFingerprint;
  }
  return snapshot;
}

/* ------------------------------------------------------------------ */
/* Sample composition                                                  */
/* ------------------------------------------------------------------ */

async function loadInter(): Promise<boolean> {
  try {
    await Promise.all([
      figma.loadFontAsync({ family: "Inter", style: "Regular" }),
      figma.loadFontAsync({ family: "Inter", style: "Medium" }),
      figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    ]);
    return true;
  } catch {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      return true;
    } catch {
      return false;
    }
  }
}

function addText(
  parent: FrameNode,
  name: string,
  characters: string,
  font: { family: string; style: string },
  size: number,
  x: number,
  y: number,
  width: number,
  color: string,
): TextNode {
  const node = figma.createText();
  node.name = name;
  node.fontName = font;
  node.characters = characters;
  node.fontSize = size;
  node.textAutoResize = "HEIGHT";
  node.resizeWithoutConstraints(width, Math.max(size, node.height));
  node.x = x;
  node.y = y;
  node.fills = [{ type: "SOLID", color: hexToFigma(color) }];
  parent.appendChild(node);
  return node;
}

function hexToFigma(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

export async function createSampleComposition(): Promise<FrameNode | null> {
  const fonts = await loadInter();
  if (!fonts) return null;
  const viewport = figma.viewport.center;
  const frame = figma.createFrame();
  frame.name = "GRID CRIMES / SAMPLE";
  frame.resizeWithoutConstraints(1200, 800);
  frame.x = Math.round(viewport.x - 600);
  frame.y = Math.round(viewport.y - 400);
  frame.fills = [{ type: "SOLID", color: hexToFigma(LAB.paper) }];
  frame.clipsContent = true;

  const eyebrow = addText(
    frame,
    "Eyebrow",
    "LAB/ EXPERIMENT 019 — COMPOSITION INSTRUMENT",
    { family: "Inter", style: "Medium" },
    12,
    72,
    62,
    620,
    LAB.ink,
  );
  eyebrow.letterSpacing = { unit: "PIXELS", value: 1.2 };

  const headline = addText(
    frame,
    "Headline",
    "BREAK THE GRID.\nKEEP THE CRAFT.",
    { family: "Inter", style: "Bold" },
    88,
    72,
    120,
    690,
    LAB.ink,
  );
  headline.lineHeight = { unit: "PERCENT", value: 88 };
  headline.letterSpacing = { unit: "PERCENT", value: -3 };

  const body = addText(
    frame,
    "Body copy",
    "A composition engine for exploring alternate directions without losing the content that made the page worth designing.",
    { family: "Inter", style: "Regular" },
    18,
    72,
    420,
    520,
    LAB.ink,
  );
  body.lineHeight = { unit: "PERCENT", value: 150 };

  const cta = figma.createFrame();
  cta.name = "Get started button";
  cta.resizeWithoutConstraints(250, 58);
  cta.x = 72;
  cta.y = 620;
  cta.fills = [{ type: "SOLID", color: hexToFigma(LAB.ink) }];
  cta.cornerRadius = 0;
  frame.appendChild(cta);
  addText(
    cta,
    "Button label",
    "GENERATE DIRECTIONS",
    { family: "Inter", style: "Medium" },
    13,
    22,
    20,
    210,
    LAB.acid,
  );

  const visual = figma.createFrame();
  visual.name = "Hero visual";
  visual.resizeWithoutConstraints(360, 620);
  visual.x = 760;
  visual.y = 90;
  visual.fills = [{ type: "SOLID", color: hexToFigma(LAB.violet) }];
  visual.clipsContent = true;
  frame.appendChild(visual);

  const circle = figma.createEllipse();
  circle.name = "Coral field";
  circle.resizeWithoutConstraints(280, 280);
  circle.x = 36;
  circle.y = 70;
  circle.fills = [{ type: "SOLID", color: hexToFigma(LAB.coral) }];
  visual.appendChild(circle);

  const square = figma.createRectangle();
  square.name = "Acid block";
  square.resizeWithoutConstraints(150, 150);
  square.x = 178;
  square.y = 374;
  square.rotation = -8;
  square.fills = [{ type: "SOLID", color: hexToFigma(LAB.acid) }];
  visual.appendChild(square);

  const hairline = figma.createRectangle();
  hairline.name = "Divider";
  hairline.resizeWithoutConstraints(250, 2);
  hairline.x = 56;
  hairline.y = 520;
  hairline.fills = [{ type: "SOLID", color: hexToFigma(LAB.paper) }];
  visual.appendChild(hairline);

  const caption = addText(
    frame,
    "Caption",
    "EDITION 001 / GOOD THINGS HAPPEN OFF-GRID.",
    { family: "Inter", style: "Regular" },
    11,
    72,
    716,
    620,
    LAB.ink,
  );
  caption.letterSpacing = { unit: "PIXELS", value: 0.8 };

  figma.currentPage.selection = [frame];
  return frame;
}
