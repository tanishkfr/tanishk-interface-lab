import type { BlockSnapshot, Rect } from "../../shared/types.ts";
import { Composer } from "../compose.ts";
import { bottom, inset, right } from "../geometry.ts";

export interface GrammarDefinition {
  id: string;
  name: string;
  build: (c: Composer) => void;
}

export function rotation(c: Composer, factor = 1): number {
  return (c.rng() - 0.5) * 2 * c.dna.rotation * factor;
}

export function headline(c: Composer): BlockSnapshot | undefined {
  return c.inventory.byRole.headline[0];
}

export function subhead(c: Composer): BlockSnapshot | undefined {
  return c.inventory.byRole.subhead[0];
}

export function visual(c: Composer, index = 0): BlockSnapshot | undefined {
  return c.inventory.visuals[index];
}

export function action(c: Composer): BlockSnapshot | undefined {
  return c.inventory.actions[0];
}

export function focal(c: Composer): BlockSnapshot | undefined {
  return c.focal ?? undefined;
}

export function safeRect(rect: Rect, c: Composer, bleed = 0): Rect {
  return c.bleed(rect, bleed);
}

export function addIndex(
  c: Composer,
  corner: "tl" | "tr" | "bl" | "br",
  text: string,
): void {
  const pad = Math.round(c.marginPx * 0.55);
  const size = Math.max(9, Math.round(Math.min(c.width, c.height) * 0.014));
  const w = Math.max(60, Math.round(c.width * 0.16));
  const h = size * 2.2;
  const x = corner.endsWith("l") ? c.marginPx + pad : right(c.content) - w - pad;
  const y = corner.startsWith("t") ? c.marginPx - pad : bottom(c.content) - h;
  c.decor(
    "index",
    { x, y, w, h },
    c.palette.ink,
    { label: text, z: 46, opacity: 0.72 },
  );
}

export function addStamp(c: Composer, x: number, y: number, text: string, color?: string): void {
  const w = Math.max(58, Math.round(c.width * 0.13));
  const h = Math.max(24, Math.round(c.height * 0.045));
  const stamp = c.decor(
    "stamp",
    { x, y, w, h },
    color ?? c.palette.accent,
    { z: 42, rotation: rotation(c, 0.45), label: text },
  );
  c.decor("rule", { x: stamp.rect.x, y: stamp.rect.y, w: stamp.rect.w, h: 2 }, c.palette.ink, {
    z: 43,
  });
}

export function addRuleGrid(c: Composer, divisions = 2): void {
  for (let index = 1; index <= divisions; index += 1) {
    const x = c.width * (index / (divisions + 1));
    c.rule("v", x, {
      start: c.marginPx,
      end: c.height - c.marginPx,
      color: c.palette.ink,
      thickness: Math.max(1, Math.round(c.width * 0.0015)),
      z: 6,
    });
  }
}

export function addEdgeTicks(c: Composer): void {
  const tick = Math.max(14, Math.round(c.width * 0.022));
  const weight = Math.max(2, Math.round(c.width * 0.0025));
  const color = c.palette.ink;
  c.decor("rule", { x: c.marginPx, y: c.marginPx, w: tick, h: weight }, color, { z: 44 });
  c.decor(
    "rule",
    { x: right(c.content) - tick, y: c.marginPx, w: tick, h: weight },
    color,
    { z: 44 },
  );
  c.decor(
    "rule",
    { x: c.marginPx, y: bottom(c.content) - weight, w: tick, h: weight },
    color,
    { z: 44 },
  );
  c.decor(
    "rule",
    { x: right(c.content) - tick, y: bottom(c.content) - weight, w: tick, h: weight },
    color,
    { z: 44 },
  );
  c.decor("cross", { x: c.marginPx, y: c.marginPx, w: tick * 0.8, h: tick * 0.8 }, color, {
    z: 44,
  });
}

export function placeSupportBand(
  c: Composer,
  options: {
    height?: number;
    y?: number;
    direction?: "grid" | "row" | "column";
    columns?: number;
    emphasis?: number;
    z?: number;
  } = {},
): void {
  if (!c.supportBlockCount()) return;
  const height = options.height ?? Math.round(c.height * 0.14);
  const y = options.y ?? bottom(c.content) - height;
  c.placeSupport(
    {
      x: c.marginPx,
      y,
      w: c.content.w,
      h: height,
    },
    {
      direction: options.direction ?? "grid",
      columns: options.columns,
      emphasis: options.emphasis ?? 0.9,
      z: options.z ?? 26,
    },
  );
}

/** Recursive split used by the controlled-chaos grammars. */
export function bspLeaves(
  rect: Rect,
  depth: number,
  rng: () => number,
  gap: number,
): Rect[] {
  if (depth <= 0 || rect.w < 160 || rect.h < 140) {
    return [inset(rect, gap / 2)];
  }
  const horizontal = rect.w > rect.h ? rng() > 0.3 : rng() > 0.7;
  const ratio = 0.34 + rng() * 0.32;
  if (horizontal) {
    const split = rect.w * ratio;
    return [
      ...bspLeaves({ x: rect.x, y: rect.y, w: split - gap / 2, h: rect.h }, depth - 1, rng, gap),
      ...bspLeaves(
        { x: rect.x + split + gap / 2, y: rect.y, w: rect.w - split - gap / 2, h: rect.h },
        depth - 1,
        rng,
        gap,
      ),
    ];
  }
  const split = rect.h * ratio;
  return [
    ...bspLeaves({ x: rect.x, y: rect.y, w: rect.w, h: split - gap / 2 }, depth - 1, rng, gap),
    ...bspLeaves(
      { x: rect.x, y: rect.y + split + gap / 2, w: rect.w, h: rect.h - split - gap / 2 },
      depth - 1,
      rng,
      gap,
    ),
  ];
}

export function pickLargest(leaves: Rect[], count: number): Rect[] {
  return [...leaves]
    .sort((a, b) => b.w * b.h - a.w * a.h)
    .slice(0, count);
}

export function ensureCoveringBacking(
  c: Composer,
  rect: Rect,
  color: string,
  pad?: number,
): Rect {
  const padding = pad ?? Math.max(10, Math.round(Math.min(c.width, c.height) * 0.014));
  const backing = inset(
    { x: rect.x - padding, y: rect.y - padding, w: rect.w + padding * 2, h: rect.h + padding * 2 },
    0,
  );
  c.decor("block", backing, color, { z: 12, backing: true });
  return backing;
}

export function textLight(c: Composer): string {
  return c.palette.paper;
}
