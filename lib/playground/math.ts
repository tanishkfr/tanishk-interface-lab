export type Datum = {
  label: string;
  value: number;
};
export const SAMPLE_DATA: Datum[] = [
  { label: "Mon", value: 24 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 38 },
  { label: "Thu", value: 86 },
  { label: "Fri", value: 65 },
  { label: "Sat", value: 110 },
  { label: "Sun", value: 46 },
];
// A deliberately narrow CSV contract: two unquoted columns, optional header.
export function parseData(input: string): Datum[] {
  const lines = input
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim());
  if (lines.length > 65)
    throw new Error("Use up to 64 values so every ridge stays readable.");
  const result: Datum[] = [];
  for (const [i, line] of lines.entries()) {
    const cols = line.split(/[,;\t]/).map((s) => s.trim());
    if (cols.length !== 2 || !cols[0])
      throw new Error(`Line ${i + 1}: use label,value, with no quoted commas.`);
    if (i === 0 && /^(value|amount|count)$/i.test(cols[1])) continue;
    if (!cols[1] || !Number.isFinite(Number(cols[1])) || Number(cols[1]) < 0)
      throw new Error(
        `Line ${i + 1}: values must be finite, non-negative numbers.`,
      );
    result.push({ label: cols[0].slice(0, 60), value: Number(cols[1]) });
  }
  if (result.length < 2) throw new Error("Add at least two label,value rows.");
  if (result.length > 64)
    throw new Error("Use up to 64 values so every ridge stays readable.");
  if (!result.some((d) => d.value > 0))
    throw new Error("At least one value must be greater than zero.");
  return result;
}
export type Recipe = {
  count: number;
  twist: number;
  petals: number;
  radius: number;
  seed: number;
  ink: string;
  paper: string;
  kind: "orbit" | "ribbon" | "petal";
};
export const DEFAULT_RECIPE: Recipe = {
  count: 42,
  twist: 137.5,
  petals: 5,
  radius: 160,
  seed: 1,
  ink: "#d9f66f",
  paper: "#252737",
  kind: "orbit",
};
export function recipeShapes(r: Recipe) {
  return Array.from({ length: r.count }, (_, i) => {
    const a = ((i * r.twist + r.seed * 13) * Math.PI) / 180;
    const orbit = Math.sqrt(i / Math.max(1, r.count - 1)) * r.radius;
    return {
      x: 300 + Math.cos(a) * orbit,
      y: 300 + Math.sin(a) * orbit,
      rotation: i * r.twist,
      size: 12 + 26 * (1 - i / r.count),
      d: `M 0 -30 C ${r.petals * 8} -25 ${r.petals * 8} 25 0 30 C ${-r.petals * 8} 25 ${-r.petals * 8} -25 0 -30 Z`,
    };
  });
}
export function vectorSvg(r: Recipe) {
  const shapes = recipeShapes(r)
    .map(
      (s) =>
        `<g transform="translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.rotation.toFixed(2)})">${r.kind === "orbit" ? `<circle r="${s.size.toFixed(2)}"/>` : r.kind === "ribbon" ? `<rect x="-${s.size}" y="-5" width="${s.size * 2}" height="10" rx="5"/>` : `<path d="${s.d}" transform="scale(${s.size / 30})"/>`}</g>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 600 600"><title>Vector Kitchen recipe ${r.seed}</title><rect width="600" height="600" fill="${r.paper}"/><g fill="none" stroke="${r.ink}" stroke-width="1.2">${shapes}</g></svg>`;
}
export function springSamples(
  stiffness: number,
  damping: number,
  mass: number,
  duration = 2,
) {
  // Semi-implicit Euler; a small fixed timestep keeps stiff springs stable.
  let x = 0,
    v = 0;
  const samples: number[] = [];
  const dt = 1 / 240;
  for (let i = 0; i <= duration * 240; i++) {
    v += ((stiffness * (1 - x) - damping * v) / mass) * dt;
    x += v * dt;
    if (i % 4 === 0) samples.push(x);
  }
  return samples;
}
export function springCss(
  stiffness: number,
  damping: number,
  mass: number,
  duration: number,
  stagger: number,
) {
  const samples = springSamples(stiffness, damping, mass, duration / 1000);
  const easing = `linear(${samples.map((n) => Number(n.toFixed(4))).join(", ")})`;
  return `/* Spring: stiffness ${stiffness}, damping ${damping}, mass ${mass}. */\n/* Sampled physical response; duration ${duration}ms. */\n.specimen {\n  transition: transform ${duration}ms ${easing};\n  transition-delay: calc(var(--i, 0) * ${stagger}ms);\n}\n.specimen[data-moved="true"] { transform: translateX(180px); }\n@media (prefers-reduced-motion: reduce) {\n  .specimen { transition: none; }\n}`;
}
