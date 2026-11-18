import type {
  BlockSnapshot,
  CompositionSnapshot,
  DesignDNA,
  LayoutPlan,
  MutationSettings,
  PlannedBlock,
  PlannedDecoration,
  Rect,
  Role,
  TextPlan,
} from "../shared/types.ts";
import { PRESET_GRAMMAR_NAMES, PRESETS, presetName } from "../shared/presets.ts";
import type { Rng } from "../shared/random.ts";
import { clamp } from "../shared/random.ts";
import {
  area,
  bottom,
  clampRectToFrame,
  fitRect,
  inset,
  right,
  round,
  splitColumns,
  splitRows,
} from "./geometry.ts";
import type { PalettePlan } from "./style.ts";
import { textColorFor } from "./style.ts";

export interface PlacedOptions {
  z?: number;
  rotation?: number;
  align?: "LEFT" | "CENTER" | "RIGHT";
  backdrop?: string;
  color?: string | null;
  fit?: "fill" | "contain";
  emphasis?: number;
  label?: boolean;
}

export interface SupportOptions {
  columns?: number;
  direction?: "grid" | "row" | "column";
  gap?: number;
  align?: "LEFT" | "CENTER" | "RIGHT";
  emphasis?: number;
  z?: number;
  fill?: boolean;
}

interface Inventory {
  all: BlockSnapshot[];
  reading: BlockSnapshot[];
  byRole: Record<Role, BlockSnapshot[]>;
  focal: BlockSnapshot | null;
  visuals: BlockSnapshot[];
  bodies: BlockSnapshot[];
  actions: BlockSnapshot[];
  labels: BlockSnapshot[];
  modules: BlockSnapshot[];
  decorations: BlockSnapshot[];
}

function buildInventory(blocks: BlockSnapshot[]): Inventory {
  const reading = [...blocks].sort(
    (a, b) =>
      a.bounds.y - b.bounds.y ||
      a.bounds.x - b.bounds.x ||
      a.name.localeCompare(b.name),
  );
  const byRole: Record<Role, BlockSnapshot[]> = {
    headline: [],
    subhead: [],
    body: [],
    visual: [],
    action: [],
    label: [],
    decoration: [],
    module: [],
  };
  for (const block of blocks) byRole[block.role].push(block);
  const focal =
    [...byRole.headline].sort((a, b) => area(b.bounds) - area(a.bounds))[0] ??
    [...byRole.visual].sort((a, b) => area(b.bounds) - area(a.bounds))[0] ??
    [...byRole.subhead].sort((a, b) => area(b.bounds) - area(a.bounds))[0] ??
    [...blocks].sort((a, b) => area(b.bounds) - area(a.bounds))[0] ??
    null;
  return {
    all: blocks,
    reading,
    byRole,
    focal,
    visuals: byRole.visual,
    bodies: byRole.body,
    actions: byRole.action,
    labels: byRole.label,
    modules: byRole.module,
    decorations: byRole.decoration,
  };
}

export interface PlanMetadata {
  grammarId: string;
  grammarName: string;
  seed: number;
}

/**
 * Stateful composer for one candidate layout. It owns placement, typographic
 * estimation, and the guarantee that every content block is placed exactly once.
 */
export class Composer {
  readonly frame: Rect;
  readonly content: Rect;
  readonly marginPx: number;
  readonly gutterPx: number;
  readonly scale: number;
  readonly inventory: Inventory;
  readonly placed: PlannedBlock[] = [];
  readonly decorations: PlannedDecoration[] = [];
  readonly warnings: string[] = [];
  private placedIds = new Set<string>();
  private decorationCount = 0;

  readonly snapshot: CompositionSnapshot;
  readonly settings: MutationSettings;
  readonly dna: DesignDNA;
  readonly palette: PalettePlan;
  readonly rng: Rng;
  readonly width: number;
  readonly height: number;

  constructor(
    snapshot: CompositionSnapshot,
    settings: MutationSettings,
    dna: DesignDNA,
    palette: PalettePlan,
    rng: Rng,
    width: number,
    height: number,
  ) {
    this.snapshot = snapshot;
    this.settings = settings;
    this.dna = dna;
    this.palette = palette;
    this.rng = rng;
    this.width = width;
    this.height = height;
    this.frame = { x: 0, y: 0, w: width, h: height };
    this.marginPx = Math.round(dna.margin * Math.min(width, height));
    this.gutterPx = Math.round(dna.gutter * Math.min(width, height));
    this.scale = Math.min(
      width / Math.max(1, snapshot.width),
      height / Math.max(1, snapshot.height),
    );
    this.content = inset(this.frame, this.marginPx);
    this.inventory = buildInventory(snapshot.blocks);
  }

  get focal(): BlockSnapshot | null {
    return this.inventory.focal;
  }

  get remaining(): BlockSnapshot[] {
    return this.inventory.reading.filter((block) => !this.placedIds.has(block.id));
  }

  get hasHeadline(): boolean {
    return Boolean(this.inventory.byRole.headline[0]);
  }

  primary(limit = 3): BlockSnapshot[] {
    const inv = this.inventory;
    const result: BlockSnapshot[] = [];
    const push = (block?: BlockSnapshot) => {
      if (block && !result.includes(block)) result.push(block);
    };
    push(inv.focal ?? undefined);
    push(inv.byRole.headline[1]);
    push(inv.visuals[0]);
    push(inv.byRole.subhead[0]);
    push(inv.actions[0]);
    push(inv.bodies[0]);
    return result.slice(0, limit);
  }

  mark(block: BlockSnapshot): void {
    this.placedIds.add(block.id);
  }

  isPlaced(block: BlockSnapshot): boolean {
    return this.placedIds.has(block.id);
  }

  place(
    block: BlockSnapshot,
    slot: Rect,
    options: PlacedOptions = {},
  ): PlannedBlock {
    const role = block.role;
    const requestedFit =
      options.fit ??
      (role === "visual" && (this.dna.colorStrategy === "layered" || this.dna.occupancy > 0.82)
        ? "fill"
        : "contain");
    // When controlled overlap is off, image/visual layers are contained rather
    // than covering a slot. This prevents bleed and keeps a calmer composition.
    const fitMode = this.settings.allowOverlap ? requestedFit : "contain";
    let target: Rect;
    if (block.text) {
      target = {
        x: slot.x,
        y: slot.y,
        w: Math.max(8, slot.w),
        h: Math.max(8, slot.h),
      };
    } else if (role === "visual" && fitMode === "fill" && block.hasImage) {
      // Cover the slot exactly. Image fills crop, so this does not distort the
      // asset and — unlike scaling beyond the slot — cannot unexpectedly run
      // into neighbouring text.
      target = {
        x: slot.x,
        y: slot.y,
        w: Math.max(8, slot.w),
        h: Math.max(8, slot.h),
      };
    } else {
      const aspect = block.bounds.w / Math.max(1, block.bounds.h);
      const fitted = fitRect(
        slot,
        aspect,
        "contain",
        options.align === "RIGHT"
          ? "right"
          : options.align === "CENTER"
            ? "center"
            : "left",
        role === "visual" ? "center" : "top",
      );
      target = fitted.rect;
    }
    const rotation = this.safeRotation(block, options.rotation ?? 0);
    const text = block.text
      ? this.makeTextPlan(block, target, options)
      : null;
    const backdrop = options.backdrop ?? this.palette.background;
    const color =
      options.color !== undefined
        ? options.color
        : block.text
          ? this.settings.preserveColors
            ? null
            : textColorFor(backdrop, this.palette, "ink")
          : this.colorForShape(block, backdrop);
    const z =
      options.z ??
      (role === "visual"
        ? 8
        : role === "module"
          ? 20
          : block.text
            ? 30
            : 24);
    const planned: PlannedBlock = {
      sourceId: block.id,
      role,
      name: block.name,
      rect: {
        x: round(target.x),
        y: round(target.y),
        w: round(target.w),
        h: round(target.h),
      },
      rotation: round(rotation, 1),
      z,
      opacity: 1,
      color,
      text,
      underlay: role === "visual",
    };
    this.placedIds.add(block.id);
    this.placed.push(planned);
    return planned;
  }

  colorForShape(block: BlockSnapshot, backdrop: string): string | null {
    if (this.settings.preserveColors) return null;
    if (!block.canColorize || block.hasImage || block.hasVector) return null;
    if (block.role === "action" || block.role === "module") return null;
    if (block.role === "visual") {
      return this.dna.colorStrategy === "restrained" ? this.palette.block : this.palette.accent;
    }
    if (block.role === "decoration") return this.palette.alt;
    if (this.dna.colorStrategy === "layered") {
      return this.rng() > 0.5 ? this.palette.accent : this.palette.block;
    }
    return this.palette.block;
  }

  safeRotation(block: BlockSnapshot, requested: number): number {
    if (!block.canRotate || Math.abs(requested) < 0.05) return 0;
    const limit = block.text
      ? block.role === "headline" || block.role === "label"
        ? 3.5
        : 0
      : 8;
    return clamp(requested, -limit, limit);
  }

  makeTextPlan(
    block: BlockSnapshot,
    target: Rect,
    options: PlacedOptions,
  ): TextPlan {
    const meta = block.text!;
    const hierarchy = this.settings.hierarchy / 100;
    const role = block.role;
    const roleFactor =
      role === "headline"
        ? 1.15 + hierarchy * 1.45
        : role === "subhead"
          ? 0.92 + hierarchy * 0.38
          : role === "body"
            ? 1 - hierarchy * 0.12
            : role === "action"
              ? 0.96 + hierarchy * 0.12
              : role === "label"
                ? 0.95 - hierarchy * 0.18
                : 1;
    const presetFactor =
      this.settings.preset === "brutalist"
        ? 1.18
        : this.settings.preset === "maximal"
          ? 1.14
          : this.settings.preset === "chaos"
            ? 1.16
            : this.settings.preset === "minimal"
              ? 0.96
              : 1;
    const jitter = 0.94 + this.rng() * 0.12;
    const base = Math.max(1, meta.fontSize || 16) * this.scale;
    const emphasis = roleFactor * presetFactor * jitter * (options.emphasis ?? 1);
    let desired = clamp(base * emphasis, 6, 420);

    const length = Math.max(1, meta.length || meta.characters.length || 1);
    const maxChars =
      role === "headline" ? 16 : role === "subhead" ? 26 : role === "body" ? 58 : role === "label" ? 34 : 30;
    const estimatedLines = clamp(Math.ceil(length / maxChars), 1, role === "headline" ? 4 : 7);
    const averageGlyph = role === "headline" ? 0.56 : 0.51;
    const widthCap = target.w / Math.max(1, Math.min(length, maxChars) * averageGlyph);
    const multiplier = role === "headline" ? 0.94 : role === "body" ? 1.46 : role === "label" ? 1.22 : 1.12;
    const heightCap = target.h / Math.max(1, estimatedLines * multiplier);
    const minimum =
      role === "headline" ? 26 : role === "body" ? 9 : role === "label" ? 8 : 10;
    desired = clamp(
      Math.min(desired, Math.max(minimum, widthCap), Math.max(minimum, heightCap)),
      minimum,
      420,
    );

    const align =
      options.align ??
      (this.dna.alignment === "right"
        ? "RIGHT"
        : this.dna.alignment === "center"
          ? "CENTER"
          : this.dna.alignment === "broken" && this.rng() > 0.72
            ? "RIGHT"
            : "LEFT");

    return {
      fontSize: Math.round(desired * 10) / 10,
      lineHeight:
        this.settings.preserveTypography
          ? null
          : role === "headline"
            ? 0.9
            : role === "subhead"
              ? 1.02
              : role === "label"
                ? 1.2
                : 1.42,
      letterSpacing:
        this.settings.preserveTypography
          ? null
          : role === "headline"
            ? -0.028
            : role === "label"
              ? 0.085
              : role === "body"
                ? 0
                : -0.01,
      align,
      emphasis: Math.round(emphasis * 100) / 100,
    };
  }

  placeSupport(slot: Rect, options: SupportOptions = {}): PlannedBlock[] {
    const blocks = this.remaining.filter(
      (block) => block.id !== this.focal?.id || !this.isPlaced(block),
    );
    if (!blocks.length) return [];
    const gap = options.gap ?? this.gutterPx;
    if (options.direction === "row") {
      const weights = blocks.map((block) => {
        const roleWeight =
          block.role === "action"
            ? 0.8
            : block.role === "body"
              ? 1.25
              : block.role === "module"
                ? 1.2
                : 0.9;
        return Math.max(0.35, block.areaShare * 9 + roleWeight);
      });
      const cells = splitColumns(slot, weights, gap);
      return blocks.map((block, index) =>
        this.place(block, cells[index], {
          z: options.z,
          align: options.align === "CENTER" ? "CENTER" : "LEFT",
          backdrop: this.palette.background,
          emphasis: options.emphasis,
          fit: options.fill === false ? "contain" : "contain",
        }),
      );
    }
    if (options.direction === "column") {
      const weights = blocks.map((block) => {
        const roleWeight =
          block.role === "body"
            ? 1.6
            : block.role === "action"
              ? 0.8
              : block.role === "label"
                ? 0.55
                : 1;
        return Math.max(0.4, roleWeight * (0.7 + block.areaShare * 3));
      });
      const cells = splitRows(slot, weights, gap);
      return blocks.map((block, index) =>
        this.place(block, cells[index], {
          z: options.z,
          align: options.align,
          backdrop: this.palette.background,
          emphasis: options.emphasis,
        }),
      );
    }
    const ratio = slot.w / Math.max(1, slot.h);
    const defaultCols = clamp(Math.round(Math.sqrt(blocks.length * ratio)), 1, 5);
    const cols = Math.max(1, Math.min(blocks.length, options.columns ?? defaultCols));
    const rows = Math.ceil(blocks.length / cols);
    const cellW = (slot.w - gap * (cols - 1)) / cols;
    const cellH = (slot.h - gap * (rows - 1)) / rows;
    const result: PlannedBlock[] = [];
    blocks.forEach((block, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cell: Rect = {
        x: slot.x + col * (cellW + gap),
        y: slot.y + row * (cellH + gap),
        w: cellW,
        h: cellH,
      };
      result.push(
        this.place(block, cell, {
          z: options.z,
          align: options.align,
          backdrop: this.palette.background,
          emphasis: options.emphasis,
        }),
      );
    });
    return result;
  }

  supportBlockCount(): number {
    return this.remaining.length;
  }

  decor(
    kind: PlannedDecoration["kind"],
    rect: Rect,
    color: string,
    options: Partial<Omit<PlannedDecoration, "id" | "kind" | "rect" | "color">> = {},
  ): PlannedDecoration {
    const decoration: PlannedDecoration = {
      id: `d${++this.decorationCount}_${kind}`,
      kind,
      rect: {
        x: round(rect.x),
        y: round(rect.y),
        w: round(rect.w),
        h: round(rect.h),
      },
      color,
      rotation: round(options.rotation ?? 0, 1),
      z: options.z ?? 4,
      opacity: options.opacity ?? 1,
      label: options.label,
      backing: options.backing ?? false,
    };
    this.decorations.push(decoration);
    return decoration;
  }

  rule(
    orientation: "h" | "v",
    position: number,
    options: { start?: number; end?: number; color?: string; thickness?: number; z?: number } = {},
  ): PlannedDecoration {
    const thickness = options.thickness ?? Math.max(2, Math.round(Math.min(this.width, this.height) * 0.003));
    const start = options.start ?? (orientation === "h" ? 0 : 0);
    const end =
      options.end ?? (orientation === "h" ? this.width : this.height);
    return this.decor(
      "rule",
      orientation === "h"
        ? { x: start, y: position - thickness / 2, w: end - start, h: thickness }
        : { x: position - thickness / 2, y: start, w: thickness, h: end - start },
      options.color ?? this.palette.ink,
      { z: options.z ?? 16 },
    );
  }

  indexLabel(text: string, x: number, y: number, color?: string): PlannedDecoration {
    return this.decor(
      "index",
      { x, y, w: Math.max(48, Math.round(this.width * 0.08)), h: Math.round(this.height * 0.024) },
      color ?? this.palette.ink,
      { label: text, z: 45, opacity: 0.82 },
    );
  }

  finish(meta: PlanMetadata, score = 0, scoreParts: Record<string, number> = {}): LayoutPlan {
    const missing = this.remaining;
    if (missing.length) {
      this.warnings.push(
        `${missing.length} supporting element${missing.length === 1 ? " was" : "s were"} folded into the composition edge.`,
      );
      const zone = {
        x: this.content.x,
        y: bottom(this.content) - Math.round(this.height * 0.09),
        w: this.content.w,
        h: Math.round(this.height * 0.09),
      };
      this.placeSupport(zone, { columns: Math.min(4, missing.length), z: 26, emphasis: 0.72 });
    }
    return {
      version: 1,
      preset: this.settings.preset,
      presetName: presetName(this.settings.preset),
      grammarId: meta.grammarId,
      grammarName: meta.grammarName || PRESET_GRAMMAR_NAMES[meta.grammarId] || meta.grammarId,
      seed: meta.seed,
      settings: { ...this.settings },
      width: this.width,
      height: this.height,
      background: this.palette.background,
      ink: this.palette.ink,
      accent: this.palette.accent,
      blocks: this.placed.sort((a, b) => a.z - b.z),
      decorations: this.decorations.sort((a, b) => a.z - b.z),
      dna: { ...this.dna },
      score,
      scoreParts,
      warnings: this.warnings,
      createdAt: 0,
    };
  }

  bleed(rect: Rect, amount = 0): Rect {
    return clampRectToFrame(rect, this.frame, amount);
  }
}

export function columnRect(
  content: Rect,
  columns: number,
  start: number,
  span: number,
  gutter: number,
  offset = 0,
): Rect {
  const totalGutter = gutter * Math.max(0, columns - 1);
  const colW = (content.w - totalGutter) / columns;
  return {
    x: content.x + start * (colW + gutter) + offset,
    y: content.y,
    w: colW * span + gutter * Math.max(0, span - 1),
    h: content.h,
  };
}

export function gridCell(
  content: Rect,
  columns: number,
  rows: number,
  col: number,
  row: number,
  colSpan = 1,
  rowSpan = 1,
  gutter = 0,
): Rect {
  const colW = (content.w - gutter * (columns - 1)) / columns;
  const rowH = (content.h - gutter * (rows - 1)) / rows;
  return {
    x: content.x + col * (colW + gutter),
    y: content.y + row * (rowH + gutter),
    w: colW * colSpan + gutter * Math.max(0, colSpan - 1),
    h: rowH * rowSpan + gutter * Math.max(0, rowSpan - 1),
  };
}

export function roleAccent(
  preset: MutationSettings["preset"],
  palette: PalettePlan,
  role: Role,
): string {
  if (preset === "minimal") {
    return role === "headline" ? palette.ink : palette.accent;
  }
  if (role === "action") return palette.accent;
  if (role === "headline") return palette.ink;
  return palette.block;
}

export { area, right, bottom, PRESETS };
