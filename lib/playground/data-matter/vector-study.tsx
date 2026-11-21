import type { Datum } from "@/lib/playground/math";
import {
  FOSSIL_LAYERS,
  TERRAIN_RIBS,
  dataMaximum,
  sampleSeries,
  sampleSeriesCyclic,
  type Formation,
  type Material,
} from "@/lib/playground/data-matter/model";

type StudyOptions = {
  data: Datum[];
  relief: number;
  formation: Formation;
  material: Material;
  angle?: number;
  caption?: boolean;
};

type Shape = {
  d?: string;
  points?: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillOpacity?: number;
  strokeOpacity?: number;
};

const STUDY_WIDTH = 900;
const STUDY_HEIGHT = 560;

const FILLS: Record<Material, { fills: string[]; stroke: string; width: number }> = {
  strata: {
    fills: ["#f1eada", "#e9dfcc", "#ede5d4", "#e6dcc8"],
    stroke: "#8f7b5c",
    width: 1,
  },
  porcelain: {
    fills: ["#f2eddf", "#eee8d8", "#ebe4d3", "#f0eade"],
    stroke: "#cdc4b1",
    width: 0.8,
  },
  blueprint: {
    fills: ["none"],
    stroke: "#2c2f27",
    width: 0.75,
  },
};

function terrainShapes(
  data: Datum[],
  relief: number,
  material: Material,
): Shape[] {
  if (data.length === 0) return [];
  const max = dataMaximum(data);
  const palette = FILLS[material];
  const values = data.map((datum) => datum.value);
  const shapes: Shape[] = [];
  for (let row = TERRAIN_RIBS - 1; row >= 0; row--) {
    const t = 1 - row / (TERRAIN_RIBS - 1);
    const x0 = 145 + t * 345;
    const y0 = 398 - t * 158;
    const envelope = Math.sin(Math.PI * t) * 0.75 + 0.25;
    const points: string[] = [`${x0.toFixed(1)},${y0.toFixed(1)}`];
    const samples = 61;
    for (let i = 0; i < samples; i++) {
      const u = i / (samples - 1);
      const value = sampleSeries(values, u) / max;
      const x = x0 + u * 300;
      const y = y0 + u * 110 - value * relief * envelope;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    points.push(`${(x0 + 300).toFixed(1)},${(y0 + 110).toFixed(1)}`);
    shapes.push({
      points: points.join(" "),
      fill: palette.fills[row % palette.fills.length],
      stroke: palette.stroke,
      strokeWidth: palette.width,
      fillOpacity: material === "blueprint" ? 0 : 1,
      strokeOpacity: material === "blueprint" ? 0.76 : 0.55,
    });
  }

  if (material === "blueprint") {
    const crossSections = 9;
    for (let i = 0; i < crossSections; i++) {
      const u = i / (crossSections - 1);
      const points: string[] = [];
      for (let row = TERRAIN_RIBS - 1; row >= 0; row--) {
        const t = 1 - row / (TERRAIN_RIBS - 1);
        const x0 = 145 + t * 345;
        const y0 = 398 - t * 158;
        const envelope = Math.sin(Math.PI * t) * 0.75 + 0.25;
        const value = sampleSeries(values, u) / max;
        points.push(
          `${(x0 + u * 300).toFixed(2)},${(y0 + u * 110 - value * relief * envelope).toFixed(2)}`,
        );
      }
      shapes.push({
        points: points.join(" "),
        fill: "none",
        stroke: "#6c6f5e",
        strokeWidth: 0.55,
        strokeOpacity: 0.36,
      });
    }
  }
  return shapes;
}

function fossilShapes(
  data: Datum[],
  relief: number,
  material: Material,
): Shape[] {
  if (data.length === 0) return [];
  const max = dataMaximum(data);
  const palette = FILLS[material];
  const values = data.map((datum) => datum.value);
  const shapes: Shape[] = [];
  const samples = 161;
  for (let layer = FOSSIL_LAYERS - 1; layer >= 0; layer--) {
    const radius = 42 + layer * 5.5;
    const points: string[] = [];
    for (let i = 0; i < samples; i++) {
      const u = i / samples;
      const angle = u * Math.PI * 2;
      const value = sampleSeriesCyclic(values, u) / max;
      const r =
        radius +
        value * relief * 0.38 * Math.sin(((layer + 2) / 34) * Math.PI);
      points.push(
        `${(450 + Math.cos(angle) * r).toFixed(2)} ${(270 + Math.sin(angle) * r * 0.77).toFixed(2)}`,
      );
    }
    shapes.push({
      d: `M${points.join("L")}Z`,
      fill:
        material === "blueprint"
          ? "none"
          : palette.fills[layer % palette.fills.length],
      stroke: palette.stroke,
      strokeWidth: palette.width,
      fillOpacity: material === "blueprint" ? 0 : 0.92,
      strokeOpacity: material === "blueprint" ? 0.78 : 0.54,
    });
  }
  return shapes;
}

function studyShapes(options: StudyOptions): Shape[] {
  return options.formation === "terrain"
    ? terrainShapes(options.data, options.relief, options.material)
    : fossilShapes(options.data, options.relief, options.material);
}

function dataDescription(data: Datum[]): string {
  return data.map((datum) => `${datum.label}: ${datum.value}`).join(", ");
}

export function VectorStudy({
  data,
  relief,
  formation,
  material,
  angle = 0,
  caption = true,
  className = "",
  accessible = true,
}: StudyOptions & {
  className?: string;
  accessible?: boolean;
}) {
  const shapes = studyShapes({ data, relief, formation, material });
  const description = dataDescription(data);
  return (
    <svg
      className={`dm-vector-study ${className}`}
      viewBox={`0 0 ${STUDY_WIDTH} ${STUDY_HEIGHT}`}
      role={accessible ? "img" : undefined}
      aria-hidden={accessible ? undefined : true}
      aria-label={
        accessible
          ? `2D vector study of ${formation}, ${material}. ${data.length} values. ${description}`
          : undefined
      }
    >
      <title>Data Matter — 2D vector study</title>
      <desc>
        A two-dimensional orthographic study, not the interactive 3D camera.{" "}
        {description}
      </desc>
      <g transform={`rotate(${angle} 450 280)`}>
        {shapes.map((shape, index) =>
          shape.d ? (
            <path
              key={index}
              d={shape.d}
              fill={shape.fill}
              fillOpacity={shape.fillOpacity}
              stroke={shape.stroke}
              strokeOpacity={shape.strokeOpacity}
              strokeWidth={shape.strokeWidth}
            />
          ) : (
            <polyline
              key={index}
              points={shape.points}
              fill={shape.fill}
              fillOpacity={shape.fillOpacity}
              stroke={shape.stroke}
              strokeOpacity={shape.strokeOpacity}
              strokeWidth={shape.strokeWidth}
            />
          ),
        )}
        {formation === "fossil" && (
          <circle
            cx="450"
            cy="270"
            r="21"
            fill={material === "blueprint" ? "none" : "#f3eee1"}
            stroke={FILLS[material].stroke}
            strokeWidth="0.9"
          />
        )}
      </g>
      {caption && (
        <text
          x="48"
          y="530"
          fill="#6b675c"
          fontSize="10"
          letterSpacing="1.4"
          fontFamily="monospace"
        >
          2D VECTOR STUDY · {formation.toUpperCase()} /{" "}
          {material.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The SVG export is explicitly a two-dimensional orthographic study. It never
 * claims to reproduce the current 3D camera, material lighting or occlusion.
 */
export function vectorStudySvg(options: StudyOptions): string {
  const shapes = studyShapes(options);
  const description = dataDescription(options.data);
  const shapeMarkup = shapes
    .map((shape) => {
      const attributes = shape.d
        ? `d="${shape.d}"`
        : `points="${shape.points ?? ""}"`;
      const tag = shape.d ? "path" : "polyline";
      return `<${tag} ${attributes} fill="${shape.fill}" fill-opacity="${shape.fillOpacity ?? 1}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity ?? 1}" stroke-width="${shape.strokeWidth}"/>`;
    })
    .join("");
  const caption = options.caption === false
    ? ""
    : `<text x="48" y="530" fill="#6b675c" font-size="10" letter-spacing="1.4" font-family="monospace">2D VECTOR STUDY · ${options.formation?.toUpperCase()} / ${options.material?.toUpperCase()}</text>`;
  const fossilHub =
    options.formation === "fossil"
      ? `<circle cx="450" cy="270" r="21" fill="${options.material === "blueprint" ? "none" : "#f3eee1"}" stroke="${FILLS[options.material].stroke}" stroke-width="0.9"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="747" viewBox="0 0 ${STUDY_WIDTH} ${STUDY_HEIGHT}"><title>Data Matter — 2D vector study (not the interactive 3D view)</title><desc>${escapeXml(description)}</desc><rect width="${STUDY_WIDTH}" height="${STUDY_HEIGHT}" fill="#efece2"/><g transform="rotate(${options.angle ?? 0} 450 280)">${shapeMarkup}${fossilHub}</g>${caption}</svg>`;
}
