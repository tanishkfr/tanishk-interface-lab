import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSelection } from "../src/main/analysis.ts";
import { loadFonts, missingSourceIds, sourceNodeMap } from "../src/main/builder.ts";
import { posterFixture } from "./fixtures.ts";

type MockNode = Record<string, unknown>;

function installFigmaMock(options: { failFonts?: boolean } = {}) {
  const mock = {
    mixed: Symbol("mixed"),
    loadFontAsync: async () => {
      if (options.failFonts) throw new Error("font unavailable");
    },
  };
  (globalThis as unknown as { figma: unknown }).figma = mock;
}

function baseNode(overrides: MockNode): MockNode {
  return {
    id: "1:1",
    name: "Layer",
    type: "RECTANGLE",
    visible: true,
    removed: false,
    rotation: 0,
    width: 100,
    height: 100,
    absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 }, visible: true }],
    children: [],
    layoutMode: "NONE",
    parent: null,
    ...overrides,
  };
}

function mockText(overrides: MockNode = {}): MockNode {
  return baseNode({
    type: "TEXT",
    characters: "MAKE THE GRID MISBEHAVE",
    fontSize: 72,
    lineHeight: { unit: "PIXELS", value: 76 },
    letterSpacing: { unit: "PIXELS", value: 0 },
    textCase: null,
    hasMissingFont: false,
    fontName: { family: "Inter", style: "Bold" },
    getRangeAllFontNames: () => [{ family: "Inter", style: "Bold" }],
    ...overrides,
  });
}

test("selection analysis infers headline, visual and action roles", async () => {
  installFigmaMock();
  const heading = mockText({
    id: "head",
    name: "Hero headline",
    absoluteBoundingBox: { x: 40, y: 40, width: 600, height: 150 },
  });
  const visual = baseNode({
    id: "visual",
    name: "Hero image",
    type: "RECTANGLE",
    hasImage: true,
    fills: [{ type: "IMAGE", visible: true, imageHash: "abc" }],
    absoluteBoundingBox: { x: 680, y: 40, width: 300, height: 400 },
  });
  const ctaText = mockText({
    id: "cta-text",
    name: "Label",
    characters: "EXPLORE",
    fontSize: 16,
    absoluteBoundingBox: { x: 8, y: 8, width: 120, height: 20 },
  });
  const cta = baseNode({
    id: "cta",
    name: "Get started button",
    type: "FRAME",
    children: [ctaText],
    layoutMode: "NONE",
    absoluteBoundingBox: { x: 40, y: 220, width: 180, height: 48 },
  });
  ctaText.parent = cta;
  const root = baseNode({
    id: "root",
    name: "Website hero",
    type: "FRAME",
    width: 1040,
    height: 520,
    absoluteBoundingBox: { x: 100, y: 50, width: 1040, height: 520 },
    fills: [{ type: "SOLID", color: { r: 0.95, g: 0.94, b: 0.9 }, visible: true }],
    children: [heading, visual, cta, mockText({ id: "body", name: "Body", fontSize: 17, characters: "A sentence of supporting body copy for the composition.", absoluteBoundingBox: { x: 40, y: 300, width: 500, height: 100 } })],
  });
  heading.parent = root;
  visual.parent = root;
  cta.parent = root;

  const result = await analyzeSelection([root as never]);
  assert.ok(result.snapshot);
  const snapshot = result.snapshot!;
  assert.equal(snapshot.name, "Website hero");
  assert.equal(snapshot.selectionKind, "frame");
  assert.equal(snapshot.blocks.length, 4);
  assert.equal(snapshot.roleCounts.headline, 1);
  assert.equal(snapshot.roleCounts.visual, 1);
  assert.equal(snapshot.roleCounts.action, 1);
  assert.ok(snapshot.blocks.find((block) => block.role === "headline")?.text?.characters.includes("GRID"));
  assert.ok(snapshot.background.startsWith("#"));
});

test("hidden and unsupported selections fail with a real explanation", async () => {
  installFigmaMock();
  const hidden = baseNode({ id: "hidden", visible: false });
  const hiddenResult = await analyzeSelection([hidden as never]);
  assert.equal(hiddenResult.snapshot, null);
  assert.match(hiddenResult.problem ?? "", /hidden|empty/i);

  const slice = baseNode({ id: "slice", type: "SLICE" });
  const sliceResult = await analyzeSelection([slice as never]);
  assert.equal(sliceResult.snapshot, null);
  assert.match(sliceResult.problem ?? "", /renderable|visible|selected/i);
});

test("single text layers are accepted as a one-element composition", async () => {
  installFigmaMock();
  const text = mockText({
    id: "only-text",
    name: "Solo headline",
    absoluteBoundingBox: { x: 0, y: 0, width: 800, height: 200 },
  });
  const result = await analyzeSelection([text as never]);
  assert.ok(result.snapshot);
  assert.equal(result.snapshot!.blocks.length, 1);
  assert.equal(result.snapshot!.roleCounts.headline, 1);
  assert.ok(result.snapshot!.warnings.length > 0);
});

test("missing fonts degrade to a warning rather than a substitution", async () => {
  installFigmaMock({ failFonts: true });
  const fonts = await loadFonts(posterFixture);
  assert.equal(fonts.decorationFont, false);
  assert.ok(fonts.warnings.length > 0);
  assert.match(fonts.warnings.join(" "), /unavailable/i);
});

test("clone preconditions identify missing source blocks", () => {
  const missing = missingSourceIds(posterFixture, new Map());
  assert.equal(missing.length, posterFixture.blocks.length);
  const nodes = posterFixture.blocks.map((block) => ({ id: block.id, type: "FRAME" }));
  const map = sourceNodeMap(posterFixture, nodes as never);
  assert.equal(map.size, posterFixture.blocks.length);
  assert.equal(missingSourceIds(posterFixture, map).length, 0);
});
