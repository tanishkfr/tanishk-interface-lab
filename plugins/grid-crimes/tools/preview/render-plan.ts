import type { BlockSnapshot, CompositionSnapshot, LayoutPlan } from "../../src/shared/types.ts";

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      if (!word) continue;
      if (!current) current = word;
      else if ((current + " " + word).length <= maxChars) current += " " + word;
      else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

function decorativeFill(block: BlockSnapshot): string {
  if (block.hasImage) return "#d9d5c7";
  return block.fillColors[0] ?? "transparent";
}

function textFill(block: BlockSnapshot, planColor: string | null): string {
  return planColor ?? "#23241f";
}

export function renderPlanSvg(
  plan: LayoutPlan,
  snapshot: CompositionSnapshot,
  label = "",
): string {
  const blocks = new Map(snapshot.blocks.map((block) => [block.id, block]));
  const layers: string[] = [];
  const sorted = [
    ...plan.decorations.map((decoration) => ({ type: "decor" as const, z: decoration.z, decoration })),
    ...plan.blocks.map((block) => ({ type: "block" as const, z: block.z, block })),
  ].sort((a, b) => a.z - b.z);

  for (const layer of sorted) {
    if (layer.type === "decor") {
      const d = layer.decoration;
      if (d.kind === "ring") {
        layers.push(
          `<ellipse cx="${d.rect.x + d.rect.w / 2}" cy="${d.rect.y + d.rect.h / 2}" rx="${d.rect.w / 2}" ry="${d.rect.h / 2}" fill="none" stroke="${d.color}" stroke-width="${Math.max(1, d.rect.w * 0.02)}" transform="rotate(${d.rotation} ${d.rect.x + d.rect.w / 2} ${d.rect.y + d.rect.h / 2})"/>`,
        );
      } else if (d.kind === "index" || d.kind === "stamp") {
        layers.push(
          `<g transform="rotate(${d.rotation} ${d.rect.x + d.rect.w / 2} ${d.rect.y + d.rect.h / 2})"><rect x="${d.rect.x}" y="${d.rect.y}" width="${d.rect.w}" height="${d.rect.h}" fill="${d.kind === "stamp" ? d.color : "transparent"}"/><text x="${d.rect.x + 3}" y="${d.rect.y + d.rect.h * 0.72}" font-family="Arial, sans-serif" font-size="${Math.max(5, d.rect.h * 0.5)}" fill="${d.kind === "stamp" ? "#23241f" : d.color}" letter-spacing=".8">${esc(d.label ?? "")}</text></g>`,
        );
      } else if (d.kind === "frame") {
        layers.push(
          `<rect x="${d.rect.x}" y="${d.rect.y}" width="${d.rect.w}" height="${d.rect.h}" fill="none" stroke="${d.color}" stroke-width="1.5" transform="rotate(${d.rotation} ${d.rect.x + d.rect.w / 2} ${d.rect.y + d.rect.h / 2})"/>`,
        );
      } else if (d.kind === "cross") {
        layers.push(
          `<g transform="rotate(${d.rotation} ${d.rect.x + d.rect.w / 2} ${d.rect.y + d.rect.h / 2})"><path d="M${d.rect.x} ${d.rect.y + d.rect.h / 2}H${d.rect.x + d.rect.w}M${d.rect.x + d.rect.w / 2} ${d.rect.y}V${d.rect.y + d.rect.h}" stroke="${d.color}" stroke-width="2"/></g>`,
        );
      } else {
        layers.push(
          `<rect x="${d.rect.x}" y="${d.rect.y}" width="${d.rect.w}" height="${d.rect.h}" fill="${d.color}" opacity="${d.opacity}" transform="rotate(${d.rotation} ${d.rect.x + d.rect.w / 2} ${d.rect.y + d.rect.h / 2})"/>`,
        );
      }
      continue;
    }
    const p = layer.block;
    const source = blocks.get(p.sourceId);
    if (!source) continue;
    const rotate = p.rotation
      ? ` transform="rotate(${p.rotation} ${p.rect.x + p.rect.w / 2} ${p.rect.y + p.rect.h / 2})"`
      : "";
    if (p.text && source.text) {
      const font = p.text.fontSize;
      const maxChars = Math.max(4, Math.floor(p.rect.w / (font * 0.52)));
      const lines = wrap(source.text.characters, maxChars).slice(0, 12);
      const lineHeight = font * (p.text.lineHeight ?? 1.25);
      layers.push(
        `<g${rotate}><clipPath id="clip-${esc(p.sourceId)}"><rect x="${p.rect.x}" y="${p.rect.y}" width="${p.rect.w}" height="${p.rect.h}"/></clipPath><g clip-path="url(#clip-${esc(p.sourceId)})"><text x="${p.rect.x}" y="${p.rect.y + font * 0.82}" font-family="Arial, Helvetica, sans-serif" font-size="${font}" font-weight="${p.role === "headline" || p.role === "subhead" ? 700 : 400}" fill="${textFill(source, p.color)}" letter-spacing="${(p.text.letterSpacing ?? 0) * font}">${lines
          .map((line, index) => `<tspan x="${p.rect.x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`)
          .join("")}</text></g></g>`,
      );
      continue;
    }
    layers.push(
      `<g${rotate}><rect x="${p.rect.x}" y="${p.rect.y}" width="${p.rect.w}" height="${p.rect.h}" fill="${p.color ?? decorativeFill(source)}"/>${
        source.hasImage
          ? `<g opacity=".35"><path d="M${p.rect.x} ${p.rect.y + p.rect.h}L${p.rect.x + p.rect.w} ${p.rect.y}" stroke="#23241f" stroke-width="1"/><path d="M${p.rect.x} ${p.rect.y}L${p.rect.x + p.rect.w} ${p.rect.y + p.rect.h}" stroke="#23241f" stroke-width="1"/></g><text x="${p.rect.x + 8}" y="${p.rect.y + 18}" font-family="Arial, sans-serif" font-size="9" letter-spacing="1" fill="#23241f">IMAGE</text>`
          : ""
      }${
        source.text
          ? ""
          : `<text x="${p.rect.x + 8}" y="${p.rect.y + 18}" font-family="Arial, sans-serif" font-size="9" letter-spacing=".8" fill="${source.fillColors[0] === "#23241f" ? "#f3f1e8" : "#23241f"}" opacity=".7">${esc(
              source.name.slice(0, 24).toUpperCase(),
            )}</text>`
      }</g>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${plan.width} ${plan.height}" width="${plan.width}" height="${plan.height}">
    <rect width="${plan.width}" height="${plan.height}" fill="${plan.background}"/>
    ${layers.join("")}
    ${label ? `<text x="12" y="${plan.height - 12}" font-family="monospace" font-size="10" fill="${plan.ink}" opacity=".55">${esc(label)}</text>` : ""}
  </svg>`;
}

export function renderSnapshotSvg(snapshot: CompositionSnapshot): string {
  const layers = snapshot.blocks
    .map((block) => {
      if (block.text) {
        const font = block.text.fontSize;
        const maxChars = Math.max(4, Math.floor(block.bounds.w / (font * 0.52)));
        const lines = wrap(block.text.characters, maxChars).slice(0, 10);
        return `<g><text x="${block.bounds.x}" y="${block.bounds.y + font * 0.82}" font-family="Arial, sans-serif" font-size="${font}" font-weight="${block.role === "headline" || block.role === "subhead" ? 700 : 400}" fill="#23241f">${lines
          .map(
            (line, index) =>
              `<tspan x="${block.bounds.x}" dy="${index === 0 ? 0 : font * 1.18}">${esc(line)}</tspan>`,
          )
          .join("")}</text></g>`;
      }
      return `<g><rect x="${block.bounds.x}" y="${block.bounds.y}" width="${block.bounds.w}" height="${block.bounds.h}" fill="${block.hasImage ? "#d8d2c2" : block.fillColors[0] ?? "#d8d2c2"}"/>${
        block.hasImage
          ? `<path d="M${block.bounds.x} ${block.bounds.y + block.bounds.h}L${block.bounds.x + block.bounds.w} ${block.bounds.y}" stroke="#23241f" stroke-width="1" opacity=".3"/><text x="${block.bounds.x + 10}" y="${block.bounds.y + 20}" font-family="Arial" font-size="10" letter-spacing="1" fill="#23241f">IMAGE</text>`
          : ""
      }</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${snapshot.width} ${snapshot.height}" width="${snapshot.width}" height="${snapshot.height}"><rect width="${snapshot.width}" height="${snapshot.height}" fill="${snapshot.background}"/>${layers}</svg>`;
}

export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
