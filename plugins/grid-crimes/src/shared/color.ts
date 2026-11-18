export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function normalizeHex(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return null;
}

export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex) ?? "#000000";
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Figma plugin colours use 0..1 channels. */
export function figmaColorToHex(color: {
  r: number;
  g: number;
  b: number;
}): string {
  return rgbToHex({ r: color.r * 255, g: color.g * 255, b: color.b * 255 });
}

export function hexToFigmaColor(hex: string): RGB {
  const { r, g, b } = hexToRgb(hex);
  return { r: r / 255, g: g / 255, b: b / 255 };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

export function readableOn(background: string, candidates: string[]): string {
  let best = candidates[0] ?? "#23241f";
  let bestRatio = -1;
  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, background);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }
  return best;
}

export function mixHex(a: string, b: string, t: number): string {
  const amount = Math.max(0, Math.min(1, t));
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * amount,
    g: ca.g + (cb.g - ca.g) * amount,
    b: ca.b + (cb.b - ca.b) * amount,
  });
}

export function isNearWhite(hex: string): boolean {
  return relativeLuminance(hex) > 0.82;
}

export function isNearBlack(hex: string): boolean {
  return relativeLuminance(hex) < 0.035;
}

export function saturatedEnough(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min > 36;
}

/** Remove duplicate and near-duplicate colours, preserving order. */
export function uniquePalette(colors: string[], limit = 8): string[] {
  const result: string[] = [];
  for (const color of colors) {
    const normalized = normalizeHex(color);
    if (!normalized) continue;
    if (
      result.some((existing) => {
        const a = hexToRgb(existing);
        const b = hexToRgb(normalized);
        return (
          Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < 18
        );
      })
    ) {
      continue;
    }
    result.push(normalized);
    if (result.length >= limit) break;
  }
  return result;
}
