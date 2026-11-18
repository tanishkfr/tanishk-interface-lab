import type {
  BlockSnapshot,
  CompositionSnapshot,
  Role,
  TextMeta,
} from "../src/shared/types.ts";
import { emptyRoleCounts } from "../src/shared/settings.ts";

let counter = 0;

export function text(
  family = "Inter",
  style = "Regular",
  fontSize = 16,
  characters = "Body copy",
): TextMeta {
  return {
    characters,
    sample: characters.slice(0, 64),
    length: characters.length,
    fontSize,
    lineHeight: null,
    letterSpacing: null,
    textCase: null,
    fonts: [{ family, style }],
    hasMissingFont: false,
    mixedFontSize: false,
  };
}

interface MakeOptions {
  role: Role;
  x: number;
  y: number;
  w: number;
  h: number;
  name?: string;
  type?: string;
  text?: TextMeta | null;
  hasImage?: boolean;
  hasVector?: boolean;
  fill?: string[];
  instance?: boolean;
  autoLayout?: boolean;
  children?: number;
  colorize?: boolean;
  rotate?: boolean;
}

export function block(id: string, options: MakeOptions): BlockSnapshot {
  counter += 1;
  return {
    id,
    name: options.name ?? `${options.role}-${id}`,
    sourceType: options.type ?? (options.text ? "TEXT" : "RECTANGLE"),
    role: options.role,
    bounds: { x: options.x, y: options.y, w: options.w, h: options.h },
    rotation: 0,
    areaShare: (options.w * options.h) / 1_000_000,
    text: options.text ?? undefined,
    hasImage: options.hasImage ?? false,
    hasVector: options.hasVector ?? false,
    hasSolidFill: (options.fill?.length ?? 0) > 0,
    fillColors: options.fill ?? [],
    isInstance: options.instance ?? false,
    isAutoLayout: options.autoLayout ?? false,
    childCount: options.children ?? 0,
    resizeMode: options.text ? "text" : options.instance ? "rescale" : "frame",
    canColorize: options.colorize ?? !options.hasImage,
    canRotate: options.rotate ?? true,
  };
}

function snapshot(
  name: string,
  width: number,
  height: number,
  blocks: BlockSnapshot[],
  background = "#f3f1e8",
  palette: string[] = ["#e5e94b", "#ff795b", "#5834d7"],
): CompositionSnapshot {
  const roleCounts = emptyRoleCounts();
  for (const b of blocks) roleCounts[b.role] += 1;
  return {
    version: 1,
    selectionKind: "frame",
    name,
    sourceIds: blocks.map((b) => b.id),
    width,
    height,
    background,
    palette,
    blocks,
    fonts: [{ family: "Inter", style: "Regular" }],
    warnings: [],
    roleCounts,
    fingerprint: `fixture-${name}`,
    analyzedAt: 0,
  };
}

export const posterFixture = snapshot("Launch poster", 1200, 1600, [
  block("p-head", {
    role: "headline",
    x: 96,
    y: 128,
    w: 1008,
    h: 360,
    name: "Headline",
    text: text("Inter", "Black", 112, "A NEW KIND OF QUIET"),
  }),
  block("p-visual", {
    role: "visual",
    x: 96,
    y: 560,
    w: 1008,
    h: 620,
    name: "Hero image",
    hasImage: true,
    fill: ["#ff795b"],
  }),
  block("p-caption", {
    role: "label",
    x: 96,
    y: 1230,
    w: 500,
    h: 40,
    name: "Caption",
    text: text("Inter", "Regular", 14, "EDITION 004 / LAB PRESS"),
  }),
  block("p-body", {
    role: "body",
    x: 96,
    y: 1330,
    w: 620,
    h: 150,
    name: "Body copy",
    text: text(
      "Inter",
      "Regular",
      18,
      "A composition can hold a page together without holding it still. This is a study in tension, scale and the space between.",
    ),
  }),
]);

export const heroFixture = snapshot("Website hero", 1440, 900, [
  block("h-head", {
    role: "headline",
    x: 88,
    y: 120,
    w: 700,
    h: 240,
    name: "Hero headline",
    text: text("Inter", "Bold", 84, "MAKE THE GRID\nMISBEHAVE."),
  }),
  block("h-sub", {
    role: "subhead",
    x: 88,
    y: 390,
    w: 560,
    h: 80,
    name: "Subhead",
    text: text("Inter", "Medium", 28, "A composition engine for design directions."),
  }),
  block("h-body", {
    role: "body",
    x: 88,
    y: 510,
    w: 520,
    h: 110,
    name: "Body",
    text: text(
      "Inter",
      "Regular",
      18,
      "Select a frame. Choose a direction. Generate four editable compositions without losing the content that matters.",
    ),
  }),
  block("h-cta", {
    role: "action",
    x: 88,
    y: 670,
    w: 240,
    h: 62,
    name: "Get started button",
    text: text("Inter", "Semi Bold", 18, "EXPLORE DIRECTIONS"),
    fill: ["#e5e94b"],
    instance: true,
  }),
  block("h-visual", {
    role: "visual",
    x: 780,
    y: 96,
    w: 570,
    h: 708,
    name: "Interface preview",
    hasImage: true,
    fill: ["#5834d7"],
  }),
  block("h-label", {
    role: "label",
    x: 88,
    y: 760,
    w: 300,
    h: 32,
    name: "Eyebrow",
    text: text("Inter", "Medium", 12, "EXPERIMENTAL SOFTWARE / 2026"),
  }),
]);

export const editorialFixture = snapshot("Editorial spread", 1600, 1000, [
  block("e-head", {
    role: "headline",
    x: 100,
    y: 100,
    w: 900,
    h: 260,
    name: "Headline",
    text: text("Instrument Serif", "Regular", 94, "The quiet radical"),
  }),
  block("e-sub", {
    role: "subhead",
    x: 100,
    y: 390,
    w: 700,
    h: 70,
    name: "Deck",
    text: text("Instrument Serif", "Regular", 26, "Notes on restraint, rhythm and the space between things."),
  }),
  block("e-body1", {
    role: "body",
    x: 100,
    y: 510,
    w: 380,
    h: 250,
    name: "Column one",
    text: text(
      "Instrument Serif",
      "Regular",
      17,
      "Minimalism is not absence. It is a decision about what earns the space. Every margin is a sentence.",
    ),
  }),
  block("e-body2", {
    role: "body",
    x: 520,
    y: 510,
    w: 380,
    h: 250,
    name: "Column two",
    text: text(
      "Instrument Serif",
      "Regular",
      17,
      "The page begins with a single gesture and ends with the confidence to stop. White space does the rest.",
    ),
  }),
  block("e-visual", {
    role: "visual",
    x: 1010,
    y: 100,
    w: 490,
    h: 720,
    name: "Editorial image",
    hasImage: true,
    fill: ["#23241f"],
  }),
  block("e-label", {
    role: "label",
    x: 100,
    y: 900,
    w: 420,
    h: 30,
    name: "Issue label",
    text: text("Inter", "Regular", 11, "ISSUE 09 / ON SUBTRACTION"),
  }),
]);

export const imageHeavyFixture = snapshot("Gallery", 1200, 1200, [
  block("i-head", {
    role: "headline",
    x: 80,
    y: 80,
    w: 700,
    h: 160,
    name: "Title",
    text: text("Inter", "Bold", 64, "THREE WAYS OF SEEING"),
  }),
  block("i-v1", {
    role: "visual",
    x: 80,
    y: 280,
    w: 620,
    h: 520,
    name: "Image 01",
    hasImage: true,
    fill: ["#5834d7"],
  }),
  block("i-v2", {
    role: "visual",
    x: 740,
    y: 280,
    w: 380,
    h: 250,
    name: "Image 02",
    hasImage: true,
    fill: ["#ff795b"],
  }),
  block("i-v3", {
    role: "visual",
    x: 740,
    y: 560,
    w: 380,
    h: 240,
    name: "Image 03",
    hasImage: true,
    fill: ["#e5e94b"],
  }),
  block("i-cap", {
    role: "label",
    x: 80,
    y: 880,
    w: 650,
    h: 40,
    name: "Caption",
    text: text("Inter", "Regular", 13, "CAMERA STUDIES / LIGHT AS STRUCTURE"),
  }),
  block("i-body", {
    role: "body",
    x: 80,
    y: 970,
    w: 500,
    h: 120,
    name: "Body",
    text: text("Inter", "Regular", 18, "A study of framing, edges and the points where an image stops being a picture and becomes a structure."),
  }),
]);

export const cardGridFixture = snapshot("Feature cards", 1440, 900, [
  block("c-head", {
    role: "headline",
    x: 80,
    y: 80,
    w: 760,
    h: 130,
    name: "Heading",
    text: text("Inter", "Bold", 58, "BUILT FOR THE WORK"),
  }),
  ...Array.from({ length: 6 }, (_, index) =>
    block(`c-card-${index}`, {
      role: "module",
      x: 80 + (index % 3) * 440,
      y: 280 + Math.floor(index / 3) * 260,
      w: 380,
      h: 210,
      name: `Feature card ${index + 1}`,
      text: text("Inter", "Regular", 16, `Feature ${index + 1}: a composable module.`),
      instance: true,
      autoLayout: true,
      children: 3,
      fill: ["#ffffff"],
    }),
  ),
  block("c-body", {
    role: "body",
    x: 80,
    y: 790,
    w: 600,
    h: 70,
    name: "Description",
    text: text("Inter", "Regular", 17, "Every card stays editable. Grouping follows meaning, not randomness."),
  }),
]);

export const mixedFontFixture = snapshot("Mixed type poster", 1000, 1400, [
  block("m-head", {
    role: "headline",
    x: 70,
    y: 110,
    w: 860,
    h: 300,
    name: "Headline mixed",
    text: {
      characters: "HARD EDGES SOFT LANDINGS",
      sample: "HARD EDGES SOFT LANDINGS",
      length: 24,
      fontSize: 88,
      lineHeight: null,
      letterSpacing: null,
      textCase: null,
      fonts: [
        { family: "Gulax", style: "Regular" },
        { family: "Apfel Grotezk", style: "Fett" },
      ],
      hasMissingFont: false,
      mixedFontSize: true,
    },
  }),
  block("m-sub", {
    role: "subhead",
    x: 70,
    y: 460,
    w: 620,
    h: 90,
    name: "Deck",
    text: text("Apfel Grotezk", "Mittel", 26, "A poster about the friction between systems."),
  }),
  block("m-body", {
    role: "body",
    x: 70,
    y: 620,
    w: 500,
    h: 200,
    name: "Body",
    text: text("Apfel Grotezk", "Regular", 17, "The work is a negotiation between the grid and the gesture. Nothing is accidental, even when it looks that way."),
  }),
  block("m-visual", {
    role: "visual",
    x: 640,
    y: 620,
    w: 290,
    h: 420,
    name: "Abstract shape",
    hasVector: true,
    fill: ["#ff795b"],
  }),
]);

export const nestedFixture = snapshot("Nested modules", 1200, 800, [
  block("n-head", {
    role: "headline",
    x: 60,
    y: 60,
    w: 650,
    h: 130,
    name: "Heading",
    text: text("Inter", "Bold", 56, "THE WHOLE SYSTEM"),
  }),
  ...Array.from({ length: 5 }, (_, index) =>
    block(`n-module-${index}`, {
      role: index === 0 ? "visual" : "module",
      x: 60 + (index % 2) * 620,
      y: 240 + Math.floor(index / 2) * 150,
      w: 520,
      h: 130,
      name: `Section ${index + 1}`,
      instance: index > 1,
      autoLayout: index > 1,
      children: index === 0 ? 4 : 3,
      hasImage: index === 0,
      text: index === 0 ? null : text("Inter", "Regular", 14, `Nested section ${index + 1}`),
      fill: ["#e5e94b"],
    }),
  ),
]);

export const denseFixture = snapshot(
  "Dense dashboard",
  1440,
  1000,
  Array.from({ length: 30 }, (_, index) => {
    const role: Role =
      index === 0
        ? "headline"
        : index === 1
          ? "visual"
          : index % 7 === 0
            ? "action"
            : index % 5 === 0
              ? "label"
              : index % 3 === 0
                ? "subhead"
                : index % 4 === 0
                  ? "module"
                  : "body";
    return block(`d-${index}`, {
      role,
      x: (index % 5) * 270 + 40,
      y: Math.floor(index / 5) * 160 + 40,
      w: 240,
      h: index === 0 ? 90 : 120,
      name: `Dashboard element ${index}`,
      text:
        role === "visual"
          ? null
          : text("Inter", index === 0 ? "Bold" : "Regular", index === 0 ? 36 : 14, `Data point ${index} lorem ipsum dolor`),
      hasImage: role === "visual",
      fill: ["#5834d7"],
      children: role === "module" ? 3 : 0,
    });
  }),
);

export const allFixtures = [
  posterFixture,
  heroFixture,
  editorialFixture,
  imageHeavyFixture,
  cardGridFixture,
  mixedFontFixture,
  nestedFixture,
  denseFixture,
];

export const allPresets = [
  "brutalist",
  "swiss",
  "minimal",
  "maximal",
  "antigrid",
  "chaos",
] as const;
