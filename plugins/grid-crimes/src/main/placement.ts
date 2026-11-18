import type { Rect } from "../shared/types.ts";

export const BATCH_GAP = 56;
export const BATCH_PADDING = 48;
export const BATCH_TITLE_HEIGHT = 88;

export function batchDimensions(
  frameWidth: number,
  frameHeight: number,
  options: { gap?: number; padding?: number; titleHeight?: number } = {},
): { width: number; height: number } {
  const gap = options.gap ?? BATCH_GAP;
  const padding = options.padding ?? BATCH_PADDING;
  const titleHeight = options.titleHeight ?? BATCH_TITLE_HEIGHT;
  return {
    width: padding * 2 + frameWidth * 2 + gap,
    height: titleHeight + padding + frameHeight * 2 + gap,
  };
}

export function framePosition(
  index: number,
  frameWidth: number,
  frameHeight: number,
  options: { gap?: number; padding?: number; titleHeight?: number } = {},
): { x: number; y: number } {
  const gap = options.gap ?? BATCH_GAP;
  const padding = options.padding ?? BATCH_PADDING;
  const titleHeight = options.titleHeight ?? BATCH_TITLE_HEIGHT;
  return {
    x: padding + (index % 2) * (frameWidth + gap),
    y: titleHeight + Math.floor(index / 2) * (frameHeight + gap),
  };
}

function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Find a free area to the right of the source. Falls back below, then to a
 * further-right column rather than stacking generated frames on top of the
 * user's artboards.
 */
export function chooseBatchPlacement(
  source: Rect,
  batch: { width: number; height: number },
  occupied: Rect[],
  gap = 160,
): { x: number; y: number } {
  const candidates: Array<{ x: number; y: number }> = [];
  for (let column = 0; column < 4; column += 1) {
    const x = source.x + source.w + gap + column * (batch.width + gap);
    candidates.push({ x, y: source.y });
    for (let row = 1; row <= 5; row += 1) {
      candidates.push({ x, y: source.y + row * (batch.height * 0.55 + 48) });
    }
  }
  candidates.push({ x: source.x, y: source.y + source.h + gap });
  for (const candidate of candidates) {
    const rect = {
      x: candidate.x,
      y: candidate.y,
      w: batch.width,
      h: batch.height,
    };
    if (!occupied.some((other) => intersects(rect, other))) {
      return {
        x: Math.round(candidate.x),
        y: Math.round(candidate.y),
      };
    }
  }
  const farRight = occupied.reduce(
    (max, rect) => Math.max(max, rect.x + rect.w),
    source.x + source.w,
  );
  return {
    x: Math.round(farRight + gap),
    y: Math.round(source.y),
  };
}

export function formatBatchNumber(value: number): string {
  return String(Math.max(1, Math.floor(value))).padStart(3, "0");
}

export function variationFrameName(preset: string, index: number): string {
  return `GRID CRIMES / ${preset.toUpperCase()} / ${formatBatchNumber(index)}`;
}

export function batchFrameName(index: number): string {
  return `GRID CRIMES / BATCH ${formatBatchNumber(index)}`;
}

export function newBatchId(seed: number, now: number): string {
  return `gc_${now.toString(36)}_${(seed % 99991).toString(36)}`;
}
