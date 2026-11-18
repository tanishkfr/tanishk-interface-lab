import type {
  BlockSnapshot,
  CompositionSnapshot,
  CrossbreedMeta,
  GridCrimesMeta,
  LayoutPlan,
  PlannedBlock,
  PlannedDecoration,
  Rect,
  TextPlan,
} from "../shared/types.ts";
import { META_KEY, ROLE_KEY, GENERATOR_VERSION } from "../shared/types.ts";
import { PRESETS } from "../shared/presets.ts";
import {
  contrastRatio,
  hexToFigmaColor,
  readableOn,
} from "../shared/color.ts";
import { encodeMeta, makeVariationMeta } from "../shared/meta.ts";
import { LAB } from "../shared/presets.ts";

export interface FontAvailability {
  available: Set<string>;
  unavailable: Set<string>;
  warnings: string[];
  decorationFont: boolean;
}

export interface BuildVariationInput {
  plan: LayoutPlan;
  snapshot: CompositionSnapshot;
  container: FrameNode;
  x: number;
  y: number;
  index: number;
  batchId: string;
  frameName: string;
  sources: Map<string, SceneNode>;
  fonts: FontAvailability;
  crossbreed?: CrossbreedMeta;
}

type EditableNode = SceneNode & {
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  resize: (width: number, height: number) => void;
  rescale: (scale: number) => void;
  clone: () => SceneNode;
  absoluteBoundingBox: Rect | null;
};

function editable(node: SceneNode): EditableNode {
  return node as unknown as EditableNode;
}

function fontKey(family: string, style: string): string {
  return `${family}::${style}`;
}

export async function loadFonts(snapshot: CompositionSnapshot): Promise<FontAvailability> {
  const available = new Set<string>();
  const unavailable = new Set<string>();
  const warnings: string[] = [];
  const fonts = new Map<string, { family: string; style: string }>();
  for (const font of snapshot.fonts) {
    fonts.set(fontKey(font.family, font.style), font);
  }
  for (const [key, font] of fonts) {
    try {
      await figma.loadFontAsync({ family: font.family, style: font.style });
      available.add(key);
    } catch {
      unavailable.add(key);
    }
  }
  if (unavailable.size) {
    warnings.push(
      `${unavailable.size} font${unavailable.size === 1 ? " is" : "s are"} unavailable. Affected text keeps its original formatting and only moves with the composition.`,
    );
  }
  let decorationFont = false;
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    decorationFont = true;
  } catch {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      decorationFont = true;
    } catch {
      decorationFont = false;
    }
  }
  return { available, unavailable, warnings, decorationFont };
}

function splitFontKey(key: string): { family: string; style: string } {
  const [family, style] = key.split("::");
  return { family: family ?? "Inter", style: style ?? "Regular" };
}

function canEditText(
  node: TextNode,
  fonts: FontAvailability,
): { ok: boolean; reason?: string } {
  if (node.hasMissingFont) return { ok: false, reason: "missing font" };
  let names: FontName[] = [];
  try {
    names = node.getRangeAllFontNames(0, Math.max(1, node.characters.length));
  } catch {
    return { ok: false, reason: "unreadable font list" };
  }
  for (const font of names) {
    if (fonts.unavailable.has(fontKey(font.family, font.style))) {
      return { ok: false, reason: "unavailable font" };
    }
    if (!fonts.available.has(fontKey(font.family, font.style))) {
      return { ok: false, reason: "unloaded font" };
    }
  }
  return { ok: true };
}

function applyTextLayout(
  node: TextNode,
  plan: TextPlan,
  block: BlockSnapshot,
  fonts: FontAvailability,
  warnings: string[],
  targetWidth: number,
  targetHeight: number,
): boolean {
  const editable = canEditText(node, fonts);
  if (!editable.ok) {
    warnings.push(
      `${block.name} keeps its original type because ${editable.reason}.`,
    );
    return false;
  }
  try {
    node.textAutoResize = "HEIGHT";
    node.fontSize = Math.max(4, Math.min(600, plan.fontSize));
    node.textAlignHorizontal = plan.align;
    if (plan.lineHeight !== null) {
      node.lineHeight = { unit: "PERCENT", value: Math.max(50, plan.lineHeight * 100) };
    }
    if (plan.letterSpacing !== null) {
      node.letterSpacing = {
        unit: "PERCENT",
        value: plan.letterSpacing * 100,
      };
    }
    node.textAutoResize = "HEIGHT";
    const width = Math.max(8, targetWidth);
    node.resizeWithoutConstraints(width, Math.max(8, node.height));
    let guard = 0;
    while (
      node.height > Math.max(12, targetHeight) * 1.08 &&
      node.fontSize > 7 &&
      guard < 14
    ) {
      node.fontSize = Math.max(7, node.fontSize * 0.94);
      try {
        node.resizeWithoutConstraints(width, Math.max(8, node.height));
      } catch {
        break;
      }
      guard += 1;
    }
  } catch (error) {
    warnings.push(
      `${block.name} could not be fully re-set: ${
        error instanceof Error ? error.message : "text layout unavailable"
      }`,
    );
    return false;
  }
  return true;
}

function setTextWidth(node: TextNode, plan: PlannedBlock): void {
  try {
    node.textAutoResize = "HEIGHT";
    node.resizeWithoutConstraints(
      Math.max(8, plan.rect.w),
      Math.max(8, node.height),
    );
  } catch {
    // Font loading or a fixed text mode can prevent resizing. Position still
    // applies; the caller records the warning.
  }
}

function applyFillColor(node: SceneNode, color: string): void {
  try {
    if (node.type === "TEXT") {
      const style = node.fillStyleId;
      if (typeof style === "string" && style.length > 0) return;
      try {
        const segments = node.getStyledTextSegments(["fills"]);
        if (segments.length > 1) return;
      } catch {
        // Fall through to the normal single-fill path.
      }
      node.fills = [{ type: "SOLID", color: hexToFigmaColor(color) }];
      return;
    }
    if ("fills" in node) {
      const style = (node as SceneNode & { fillStyleId?: string }).fillStyleId;
      if (typeof style === "string" && style.length > 0) return;
      (node as SceneNode & { fills: Paint[] }).fills = [
        { type: "SOLID", color: hexToFigmaColor(color) },
      ];
    }
  } catch {
    // Preserve the source if the fill is locked or uses a complex style.
  }
}

function sizeAndPosition(
  node: SceneNode,
  block: BlockSnapshot,
  plan: PlannedBlock,
  fonts: FontAvailability,
  warnings: string[],
): void {
  if (node.type === "TEXT") {
    const edited = applyTextLayout(node, plan.text ?? {
      fontSize: Math.max(10, (block.text?.fontSize ?? 16) * 0.9),
      lineHeight: null,
      letterSpacing: null,
      align: "LEFT",
      emphasis: 1,
    }, block, fonts, warnings, plan.rect.w, plan.rect.h);
    if (edited) setTextWidth(node, plan);
    node.x = plan.rect.x;
    node.y = plan.rect.y;
    return;
  }

  if (block.hasMissingFont) {
    node.x = plan.rect.x;
    node.y = plan.rect.y;
    warnings.push(
      `${block.name} contains an unavailable font. It was repositioned without resizing.`,
    );
    return;
  }

  const isRescale =
    block.isInstance ||
    block.isAutoLayout ||
    block.resizeMode === "rescale" ||
    block.childCount > 1;
  const currentW = Math.max(1, node.width);
  const currentH = Math.max(1, node.height);
  if (isRescale) {
    const scale = Math.min(
      plan.rect.w / currentW,
      plan.rect.h / currentH,
    );
    if (Number.isFinite(scale) && Math.abs(scale - 1) > 0.006) {
      try {
        editable(node).rescale(Math.max(0.02, Math.min(12, scale)));
      } catch {
        try {
          editable(node).resize(Math.max(2, plan.rect.w), Math.max(2, plan.rect.h));
        } catch {
          warnings.push(`${block.name} kept its original size.`);
        }
      }
    }
  } else {
    try {
      editable(node).resize(Math.max(2, plan.rect.w), Math.max(2, plan.rect.h));
    } catch {
      warnings.push(`${block.name} kept its original size.`);
    }
  }
  const width = node.width;
  const height = node.height;
  node.x = plan.rect.x + Math.max(0, (plan.rect.w - width) / 2);
  node.y = plan.rect.y + Math.max(0, (plan.rect.h - height) / 2);
}

function rotateAroundCentre(node: SceneNode, degrees: number): void {
  if (Math.abs(degrees) < 0.05) return;
  try {
    const target = editable(node);
    const before = target.absoluteBoundingBox;
    target.rotation = degrees;
    const after = target.absoluteBoundingBox;
    if (before && after) {
      target.x += before.x + before.width / 2 - (after.x + after.width / 2);
      target.y += before.y + before.height / 2 - (after.y + after.height / 2);
    }
  } catch {
    // Rotation is decorative; never fail a batch over it.
  }
}

function cloneBlock(
  frame: FrameNode,
  source: SceneNode,
  block: BlockSnapshot,
  plan: PlannedBlock,
  fonts: FontAvailability,
  warnings: string[],
): SceneNode {
  const clone = source.clone();
  clone.name = source.name;
  clone.locked = false;
  clone.visible = true;
  editable(clone).opacity = plan.opacity;
  frame.appendChild(clone);
  clone.setPluginData(ROLE_KEY, block.role);
  sizeAndPosition(clone, block, plan, fonts, warnings);
  if (plan.color && !block.isInstance) {
    applyFillColor(clone, plan.color);
  }
  rotateAroundCentre(clone, plan.rotation);
  return clone;
}

function decorationColorIcon(
  color: string,
  background: string,
): string {
  return contrastRatio(color, background) >= 3.2
    ? color
    : readableOn(background, [LAB.ink, LAB.paper]);
}

function addDecoration(
  frame: FrameNode,
  decoration: PlannedDecoration,
  fonts: FontAvailability,
  warnings: string[],
): SceneNode | null {
  const color = decoration.color;
  const fill = [{ type: "SOLID" as const, color: hexToFigmaColor(color) }];
  const setCommon = (node: SceneNode, name: string) => {
    node.name = `DECOR / ${name}`;
    node.setPluginData(ROLE_KEY, "decoration");
    editable(node).opacity = decoration.opacity;
    frame.appendChild(node);
    node.x = decoration.rect.x;
    node.y = decoration.rect.y;
  };

  try {
    if (decoration.kind === "index" || decoration.kind === "stamp") {
      if (!fonts.decorationFont || !decoration.label) {
        if (decoration.kind === "stamp") {
          const rectangle = figma.createRectangle();
          rectangle.resizeWithoutConstraints(decoration.rect.w, decoration.rect.h);
          rectangle.fills = fill;
          setCommon(rectangle, decoration.label ?? "stamp");
          rotateAroundCentre(rectangle, decoration.rotation);
          return rectangle;
        }
        return null;
      }
      if (decoration.kind === "stamp") {
        const stamp = figma.createFrame();
        stamp.resizeWithoutConstraints(decoration.rect.w, decoration.rect.h);
        stamp.fills = fill;
        stamp.clipsContent = true;
        setCommon(stamp, decoration.label ?? "stamp");
        const label = figma.createText();
        label.fontName = { family: "Inter", style: "Medium" };
        label.characters = decoration.label.toUpperCase();
        label.fills = [
          {
            type: "SOLID",
            color: hexToFigmaColor(decorationColorIcon(color, color)),
          },
        ];
        label.fontSize = Math.max(7, decoration.rect.h * 0.42);
        label.letterSpacing = { unit: "PERCENT", value: 8 };
        label.textAutoResize = "HEIGHT";
        label.resizeWithoutConstraints(
          Math.max(8, decoration.rect.w - 12),
          Math.max(8, decoration.rect.h - 8),
        );
        stamp.appendChild(label);
        label.x = 6;
        label.y = (decoration.rect.h - label.height) / 2;
        rotateAroundCentre(stamp, decoration.rotation);
        return stamp;
      }
      const text = figma.createText();
      text.name = `DECOR / ${decoration.label ?? "index"}`;
      text.setPluginData(ROLE_KEY, "decoration");
      text.fontName = { family: "Inter", style: "Medium" };
      text.characters = decoration.label;
      text.fontSize = Math.max(7, Math.round(decoration.rect.h * 0.58));
      text.letterSpacing = { unit: "PERCENT", value: 10 };
      text.textAutoResize = "HEIGHT";
      text.resizeWithoutConstraints(
        Math.max(24, decoration.rect.w),
        Math.max(8, decoration.rect.h),
      );
      text.fills = fill;
      text.opacity = decoration.opacity;
      frame.appendChild(text);
      text.x = decoration.rect.x;
      text.y = decoration.rect.y;
      rotateAroundCentre(text, decoration.rotation);
      return text;
    }

    if (decoration.kind === "ring") {
      const ellipse = figma.createEllipse();
      ellipse.resizeWithoutConstraints(
        Math.max(4, decoration.rect.w),
        Math.max(4, decoration.rect.h),
      );
      ellipse.fills = [];
      ellipse.strokes = fill;
      ellipse.strokeWeight = Math.max(1, Math.min(8, decoration.rect.w * 0.015));
      setCommon(ellipse, "ring");
      rotateAroundCentre(ellipse, decoration.rotation);
      return ellipse;
    }

    if (decoration.kind === "dot") {
      const ellipse = figma.createEllipse();
      ellipse.resizeWithoutConstraints(
        Math.max(3, decoration.rect.w),
        Math.max(3, decoration.rect.h),
      );
      ellipse.fills = fill;
      setCommon(ellipse, "dot");
      return ellipse;
    }

    if (decoration.kind === "cross") {
      const group = figma.createFrame();
      group.resizeWithoutConstraints(decoration.rect.w, decoration.rect.h);
      group.fills = [];
      group.clipsContent = false;
      setCommon(group, "cross");
      const thickness = Math.max(1, Math.min(decoration.rect.w, decoration.rect.h) * 0.12);
      const horizontal = figma.createRectangle();
      horizontal.resizeWithoutConstraints(decoration.rect.w, thickness);
      horizontal.x = 0;
      horizontal.y = (decoration.rect.h - thickness) / 2;
      horizontal.fills = fill;
      group.appendChild(horizontal);
      const vertical = figma.createRectangle();
      vertical.resizeWithoutConstraints(thickness, decoration.rect.h);
      vertical.x = (decoration.rect.w - thickness) / 2;
      vertical.y = 0;
      vertical.fills = fill;
      group.appendChild(vertical);
      rotateAroundCentre(group, decoration.rotation);
      return group;
    }

    if (decoration.kind === "frame") {
      const rectangle = figma.createRectangle();
      rectangle.resizeWithoutConstraints(
        Math.max(4, decoration.rect.w),
        Math.max(4, decoration.rect.h),
      );
      rectangle.fills = [];
      rectangle.strokes = fill;
      rectangle.strokeWeight = Math.max(1, Math.min(6, decoration.rect.w * 0.005));
      setCommon(rectangle, "frame");
      rotateAroundCentre(rectangle, decoration.rotation);
      return rectangle;
    }

    const rectangle = figma.createRectangle();
    rectangle.resizeWithoutConstraints(
      Math.max(1, decoration.rect.w),
      Math.max(1, decoration.rect.h),
    );
    rectangle.fills = fill;
    setCommon(rectangle, decoration.kind);
    rotateAroundCentre(rectangle, decoration.rotation);
    return rectangle;
  } catch (error) {
    warnings.push(
      `A ${decoration.kind} decoration could not be drawn: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return null;
  }
}

export function buildVariationFrame(input: BuildVariationInput): {
  frame: FrameNode;
  meta: GridCrimesMeta;
  warnings: string[];
} {
  const {
    plan,
    snapshot,
    container,
    x,
    y,
    index,
    batchId,
    frameName,
    sources,
    fonts,
    crossbreed,
  } = input;
  const warnings: string[] = [];
  const frame = figma.createFrame();
  frame.name = frameName;
  frame.resizeWithoutConstraints(plan.width, plan.height);
  frame.x = x;
  frame.y = y;
  frame.fills = [{ type: "SOLID", color: hexToFigmaColor(plan.background) }];
  frame.clipsContent = true;
  frame.cornerRadius = 0;
  container.appendChild(frame);

  const blockMap = new Map(snapshot.blocks.map((block) => [block.id, block]));
  const layers = [
    ...plan.decorations.map((decoration) => ({
      kind: "decoration" as const,
      z: decoration.z,
      decoration,
    })),
    ...plan.blocks.map((block) => ({
      kind: "block" as const,
      z: block.z,
      block,
    })),
  ].sort((a, b) => a.z - b.z || (a.kind === "decoration" ? -1 : 1));

  for (const layer of layers) {
    if (layer.kind === "decoration") {
      addDecoration(frame, layer.decoration, fonts, warnings);
      continue;
    }
    const block = blockMap.get(layer.block.sourceId);
    const source = sources.get(layer.block.sourceId);
    if (!block || !source) {
      throw new Error(
        `The source layer "${layer.block.name}" is no longer available.`,
      );
    }
    if (source.removed) {
      throw new Error(`"${layer.block.name}" was deleted during generation.`);
    }
    try {
      cloneBlock(frame, source, block, layer.block, fonts, warnings);
    } catch (error) {
      throw new Error(
        `Could not clone "${block.name}": ${
          error instanceof Error ? error.message : "unknown cloning error"
        }`,
      );
    }
  }

  const meta = makeVariationMeta({
    batchId,
    containerId: container.id,
    variationId: `${batchId}_v${index + 1}`,
    index,
    preset: plan.preset,
    presetName: PRESETS[plan.preset]?.name ?? plan.preset,
    seed: plan.seed,
    settings: plan.settings,
    grammar: plan.grammarId,
    grammarName: plan.grammarName,
    score: plan.score,
    sourceFingerprint: snapshot.fingerprint,
    sourceName: snapshot.name,
    sourceIds: snapshot.sourceIds,
    dna: plan.dna,
    createdAt: Date.now(),
    kept: false,
    locked: false,
    revision: 0,
    crossbreed,
  });
  frame.setPluginData(META_KEY, encodeMeta(meta));
  return { frame, meta, warnings: [...new Set(warnings)] };
}

export function refreshMetaOnFrame(frame: FrameNode, meta: GridCrimesMeta): void {
  frame.setPluginData(META_KEY, encodeMeta(meta));
}

export function frameMetaFor(
  plan: LayoutPlan,
  snapshot: CompositionSnapshot,
  batchId: string,
  containerId: string,
  index: number,
  crossbreed?: CrossbreedMeta,
): GridCrimesMeta {
  return makeVariationMeta({
    batchId,
    containerId,
    variationId: `${batchId}_v${index + 1}`,
    index,
    preset: plan.preset,
    presetName: PRESETS[plan.preset]?.name ?? plan.preset,
    seed: plan.seed,
    settings: plan.settings,
    grammar: plan.grammarId,
    grammarName: plan.grammarName,
    score: plan.score,
    sourceFingerprint: snapshot.fingerprint,
    sourceName: snapshot.name,
    sourceIds: snapshot.sourceIds,
    dna: plan.dna,
    createdAt: Date.now(),
    kept: false,
    locked: false,
    revision: 0,
    crossbreed,
  });
}

export function sourceNodeMap(
  snapshot: CompositionSnapshot,
  nodes: SceneNode[],
): Map<string, SceneNode> {
  const map = new Map<string, SceneNode>();
  for (const node of nodes) {
    if (snapshot.blocks.some((block) => block.id === node.id)) {
      map.set(node.id, node);
    }
  }
  return map;
}

export function missingSourceIds(
  snapshot: CompositionSnapshot,
  sources: Map<string, SceneNode>,
): string[] {
  return snapshot.blocks
    .filter((block) => !sources.has(block.id))
    .map((block) => block.name);
}

export { splitFontKey, fontKey, GENERATOR_VERSION };
