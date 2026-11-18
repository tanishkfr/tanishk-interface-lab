import type { Rect } from "../shared/types.ts";
import { clamp } from "../shared/random.ts";

export const round = (value: number, places = 2): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function rect(x: number, y: number, w: number, h: number): Rect {
  return { x, y, w, h };
}

export function area(r: Rect): number {
  return Math.max(0, r.w) * Math.max(0, r.h);
}

export function right(r: Rect): number {
  return r.x + r.w;
}

export function bottom(r: Rect): number {
  return r.y + r.h;
}

export function center(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

export function inset(r: Rect, amount: number): Rect {
  const dx = Math.min(amount, r.w / 2);
  const dy = Math.min(amount, r.h / 2);
  return { x: r.x + dx, y: r.y + dy, w: r.w - dx * 2, h: r.h - dy * 2 };
}

export function insetXY(r: Rect, x: number, y = x): Rect {
  return {
    x: r.x + x,
    y: r.y + y,
    w: Math.max(1, r.w - x * 2),
    h: Math.max(1, r.h - y * 2),
  };
}

export function intersection(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(right(a), right(b)) - x;
  const h = Math.min(bottom(a), bottom(b)) - y;
  return { x, y, w: Math.max(0, w), h: Math.max(0, h) };
}

export function overlapArea(a: Rect, b: Rect): number {
  return area(intersection(a, b));
}

export function overlapRatio(a: Rect, b: Rect): number {
  const minArea = Math.max(1, Math.min(area(a), area(b)));
  return overlapArea(a, b) / minArea;
}

export function containsPoint(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x <= right(r) && y >= r.y && y <= bottom(r);
}

/** Split a rect into rows with weights. */
export function splitRows(r: Rect, weights: number[], gap = 0): Rect[] {
  const total = weights.reduce((sum, n) => sum + Math.max(0, n), 0) || 1;
  const available = Math.max(0, r.h - gap * Math.max(0, weights.length - 1));
  let y = r.y;
  return weights.map((weight) => {
    const h = (available * Math.max(0, weight)) / total;
    const result = { x: r.x, y, w: r.w, h };
    y += h + gap;
    return result;
  });
}

/** Split a rect into columns with weights. */
export function splitColumns(r: Rect, weights: number[], gap = 0): Rect[] {
  const total = weights.reduce((sum, n) => sum + Math.max(0, n), 0) || 1;
  const available = Math.max(0, r.w - gap * Math.max(0, weights.length - 1));
  let x = r.x;
  return weights.map((weight) => {
    const w = (available * Math.max(0, weight)) / total;
    const result = { x, y: r.y, w, h: r.h };
    x += w + gap;
    return result;
  });
}

export interface FitResult {
  rect: Rect;
  scale: number;
  mode: "fill" | "contain";
}

/** Fit a block of source proportions into a slot. */
export function fitRect(
  slot: Rect,
  aspect: number,
  mode: "fill" | "contain" = "contain",
  align: "left" | "center" | "right" = "left",
  vertical: "top" | "center" | "bottom" = "top",
): FitResult {
  const safeAspect = Math.max(0.02, aspect || 1);
  const slotAspect = slot.w / Math.max(1, slot.h);
  let w = slot.w;
  let h = slot.h;
  if (mode === "contain") {
    if (slotAspect > safeAspect) w = slot.h * safeAspect;
    else h = slot.w / safeAspect;
  } else if (slotAspect > safeAspect) h = slot.w / safeAspect;
  else w = slot.h * safeAspect;
  const x =
    align === "left"
      ? slot.x
      : align === "right"
        ? slot.x + slot.w - w
        : slot.x + (slot.w - w) / 2;
  const y =
    vertical === "top"
      ? slot.y
      : vertical === "bottom"
        ? slot.y + slot.h - h
        : slot.y + (slot.h - h) / 2;
  return {
    rect: { x, y, w, h },
    scale: Math.max(0.01, Math.min(w / Math.max(1, slot.w), h / Math.max(1, slot.h))),
    mode,
  };
}

export function clampRectToFrame(r: Rect, frame: Rect, bleed = 0): Rect {
  const minX = frame.x - bleed;
  const minY = frame.y - bleed;
  const maxX = frame.x + frame.w + bleed;
  const maxY = frame.y + frame.h + bleed;
  const w = Math.min(r.w, maxX - minX);
  const h = Math.min(r.h, maxY - minY);
  const x = clamp(r.x, minX, maxX - w);
  const y = clamp(r.y, minY, maxY - h);
  return { x, y, w, h };
}

export function expand(r: Rect, amount: number): Rect {
  return {
    x: r.x - amount,
    y: r.y - amount,
    w: r.w + amount * 2,
    h: r.h + amount * 2,
  };
}

export function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(right(a), right(b)) - x,
    h: Math.max(bottom(a), bottom(b)) - y,
  };
}

export function isInside(inner: Rect, outer: Rect, tolerance = 0.5): boolean {
  return (
    inner.x >= outer.x - tolerance &&
    inner.y >= outer.y - tolerance &&
    right(inner) <= right(outer) + tolerance &&
    bottom(inner) <= bottom(outer) + tolerance
  );
}

export function distance(a: Rect, b: Rect): number {
  const ca = center(a);
  const cb = center(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

export function rectFromEdges(
  left: number,
  top: number,
  rightEdge: number,
  bottomEdge: number,
): Rect {
  return {
    x: left,
    y: top,
    w: Math.max(1, rightEdge - left),
    h: Math.max(1, bottomEdge - top),
  };
}

/** Deterministic rotation of a rect around its centre, returning a containing bbox. */
export function rotatedBounds(r: Rect, degrees: number): Rect {
  const radians = (Math.abs(degrees) * Math.PI) / 180;
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const w = r.w * c + r.h * s;
  const h = r.w * s + r.h * c;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
