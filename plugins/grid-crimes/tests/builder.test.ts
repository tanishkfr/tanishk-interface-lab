import test from "node:test";
import assert from "node:assert/strict";
import { heroFixture } from "./fixtures.ts";
import { generatePlans } from "../src/engine/planner.ts";
import { buildVariationFrame, type FontAvailability } from "../src/main/builder.ts";
import { DEFAULT_SETTINGS } from "../src/shared/presets.ts";
import { decodeMeta } from "../src/shared/meta.ts";
import { META_KEY } from "../src/shared/types.ts";

let idCounter = 0;

class MockNode {
  id = `mock_${++idCounter}`;
  type: string;
  name: string;
  parent: MockNode | null = null;
  children: MockNode[] = [];
  visible = true;
  removed = false;
  locked = false;
  x = 0;
  y = 0;
  width = 100;
  height = 100;
  rotation = 0;
  opacity = 1;
  fills: unknown[] = [];
  strokes: unknown[] = [];
  strokeWeight = 1;
  clipsContent = false;
  cornerRadius = 0;
  layoutMode = "NONE";
  characters = "";
  fontSize = 16;
  fontName = { family: "Inter", style: "Regular" };
  lineHeight: unknown = { unit: "PIXELS", value: 20 };
  letterSpacing: unknown = { unit: "PIXELS", value: 0 };
  textCase: string | null = null;
  hasMissingFont = false;
  textAutoResize = "NONE";
  textAlignHorizontal = "LEFT";
  fillStyleId = "";
  cloneCount = 0;
  private pluginData = new Map<string, string>();

  constructor(type: string, name = type) {
    this.type = type;
    this.name = name;
  }

  get absoluteBoundingBox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  clone(): MockNode {
    const copy = new MockNode(this.type, this.name);
    copy.width = this.width;
    copy.height = this.height;
    copy.characters = this.characters;
    copy.fontSize = this.fontSize;
    copy.fills = [...this.fills];
    copy.strokes = [...this.strokes];
    copy.hasMissingFont = this.hasMissingFont;
    copy.cloneCount = ++this.cloneCount;
    return copy;
  }

  appendChild<T extends MockNode>(child: T): T {
    if (child.parent) {
      child.parent.children = child.parent.children.filter(
        (candidate) => candidate !== child,
      );
    }
    child.parent = this;
    this.children.push(child);
    return child;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  resizeWithoutConstraints(width: number, height: number): void {
    this.resize(width, height);
  }

  rescale(scale: number): void {
    this.width *= scale;
    this.height *= scale;
    this.fontSize *= scale;
    for (const child of this.children) child.rescale(scale);
  }

  remove(): void {
    this.removed = true;
    if (this.parent) {
      this.parent.children = this.parent.children.filter(
        (candidate) => candidate !== this,
      );
      this.parent = null;
    }
  }

  setPluginData(key: string, value: string): void {
    this.pluginData.set(key, value);
  }

  getPluginData(key: string): string {
    return this.pluginData.get(key) ?? "";
  }

  getRangeAllFontNames() {
    return [this.fontName];
  }

  getStyledTextSegments() {
    return [{ fills: this.fills }];
  }
}

function installMockFigma(): void {
  (globalThis as unknown as { figma: unknown }).figma = {
    createFrame: () => new MockNode("FRAME"),
    createRectangle: () => new MockNode("RECTANGLE"),
    createEllipse: () => new MockNode("ELLIPSE"),
    createText: () => {
      const node = new MockNode("TEXT");
      node.characters = "text";
      return node;
    },
    createLine: () => new MockNode("LINE"),
    loadFontAsync: async () => undefined,
    base64Encode: () => "",
  };
}

function sourceFor(blockId: string, type: string): MockNode {
  const node = new MockNode(type, blockId);
  node.width = 200;
  node.height = 100;
  node.x = 10;
  node.y = 20;
  if (type === "TEXT") {
    node.characters = "MAKE THE GRID MISBEHAVE";
    node.fontSize = 64;
    node.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
  }
  return node;
}

function fontsFor(): FontAvailability {
  return {
    available: new Set([
      "Inter::Regular",
      "Inter::Medium",
      "Inter::Bold",
      "Inter::Semi Bold",
      "Instrument Serif::Regular",
      "Gulax::Regular",
      "Apfel Grotezk::Fett",
      "Apfel Grotezk::Mittel",
    ]),
    unavailable: new Set(),
    warnings: [],
    decorationFont: true,
  };
}

test("builder clones content into a native frame and stores metadata", () => {
  installMockFigma();
  const plan = generatePlans(heroFixture, DEFAULT_SETTINGS, { count: 1 }).plans[0];
  const sources = new Map<string, MockNode>();
  for (const block of heroFixture.blocks) {
    const node = sourceFor(block.id, block.text ? "TEXT" : block.isInstance ? "INSTANCE" : "FRAME");
    if (block.text) {
      node.fontName = { family: "Inter", style: "Bold" };
      node.characters = block.text.characters;
      node.fontSize = block.text.fontSize;
    }
    sources.set(block.id, node);
  }
  const container = new MockNode("FRAME");
  const before = [...sources.entries()].map(([id, node]) => ({
    id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    fills: JSON.stringify(node.fills),
  }));

  const built = buildVariationFrame({
    plan,
    snapshot: heroFixture,
    container: container as unknown as FrameNode,
    x: 48,
    y: 88,
    index: 0,
    batchId: "batch_test",
    frameName: "GRID CRIMES / TEST / 001",
    sources: sources as unknown as Map<string, SceneNode>,
    fonts: fontsFor(),
  });

  assert.equal(built.frame.type, "FRAME");
  assert.equal(built.frame.width, plan.width);
  assert.equal(built.frame.height, plan.height);
  assert.equal(built.frame.parent, container);
  assert.ok(built.frame.children.length > 0);
  const meta = decodeMeta(built.frame.getPluginData(META_KEY));
  assert.equal(meta?.batchId, "batch_test");
  assert.equal(meta?.grammar, plan.grammarId);
  assert.equal(meta?.sourceFingerprint, heroFixture.fingerprint);

  // The source nodes must be untouched: the builder clones, never mutates.
  for (const [id, node] of sources) {
    const snapshot = before.find((entry) => entry.id === id)!;
    assert.equal(node.x, snapshot.x);
    assert.equal(node.y, snapshot.y);
    assert.equal(node.width, snapshot.width);
    assert.equal(node.height, snapshot.height);
    assert.equal(JSON.stringify(node.fills), snapshot.fills);
    assert.equal(node.cloneCount, 1);
  }
});

test("builder fails clearly when a source layer disappears", () => {
  installMockFigma();
  const plan = generatePlans(heroFixture, DEFAULT_SETTINGS, { count: 1 }).plans[0];
  const sources = new Map<string, MockNode>();
  for (const block of heroFixture.blocks.slice(0, -1)) {
    sources.set(block.id, sourceFor(block.id, "FRAME"));
  }
  assert.throws(
    () =>
      buildVariationFrame({
        plan,
        snapshot: heroFixture,
        container: new MockNode("FRAME") as unknown as FrameNode,
        x: 0,
        y: 0,
        index: 0,
        batchId: "batch_test",
        frameName: "GRID CRIMES / TEST / 001",
        sources: sources as unknown as Map<string, SceneNode>,
        fonts: fontsFor(),
      }),
    /no longer available|missing/i,
  );
});
