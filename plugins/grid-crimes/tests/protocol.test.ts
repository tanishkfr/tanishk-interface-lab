import test from "node:test";
import assert from "node:assert/strict";
import { parseUIRequest } from "../src/shared/protocol.ts";
import { sanitizeSettings } from "../src/shared/settings.ts";
import { DEFAULT_SETTINGS } from "../src/shared/presets.ts";
import { decodeMeta, encodeMeta, makeVariationMeta } from "../src/shared/meta.ts";
import { posterFixture } from "./fixtures.ts";

test("UI request parser accepts valid messages and clamps settings", () => {
  const parsed = parseUIRequest({
    type: "generate",
    payload: {
      settings: { ...DEFAULT_SETTINGS, chaos: 900, seed: 0, preset: "bad" },
      roleOverrides: [{ id: "p-head", role: "headline" }],
    },
  });
  assert.ok(parsed);
  assert.equal(parsed.type, "generate");
  if (parsed.type === "generate") {
    assert.equal(parsed.payload.settings.chaos, 100);
    assert.equal(parsed.payload.settings.seed, 1);
    assert.equal(parsed.payload.settings.preset, "brutalist");
    assert.equal(parsed.payload.roleOverrides.length, 1);
  }
});

test("UI request parser rejects malformed and unknown messages", () => {
  assert.equal(parseUIRequest(null), null);
  assert.equal(parseUIRequest("hello"), null);
  assert.equal(parseUIRequest({ type: "rm -rf", payload: {} }), null);
  assert.equal(parseUIRequest({ type: "generate", payload: { settings: "no" } }), null);
  assert.equal(parseUIRequest({ type: "remove-batch", payload: {} }), null);
  assert.equal(parseUIRequest({ type: "set-role", payload: { id: "x", role: "king" } }), null);
  assert.equal(
    parseUIRequest({ type: "crossbreed", payload: { parentA: "a", parentB: "b", inheritance: 10 } })
      ?.type,
    "crossbreed",
  );
});

test("generate-again remains a real request after validation", () => {
  const parsed = parseUIRequest({
    type: "generate-again",
    payload: { settings: DEFAULT_SETTINGS, roleOverrides: [] },
  });
  assert.equal(parsed?.type, "generate-again");
});

test("metadata is versioned, round-trips, and rejects garbage", () => {
  const meta = makeVariationMeta({
    batchId: "batch_1",
    containerId: "container_1",
    variationId: "batch_1_v1",
    index: 0,
    preset: "brutalist",
    presetName: "BRUTALIST",
    seed: 2718,
    settings: sanitizeSettings(DEFAULT_SETTINGS),
    grammar: "monument",
    grammarName: "Monument",
    score: 88,
    sourceFingerprint: posterFixture.fingerprint,
    sourceName: posterFixture.name,
    sourceIds: posterFixture.sourceIds,
    dna: {
      margin: 0.05,
      columns: 6,
      gutter: 0.018,
      asymmetry: 0.3,
      rotation: 4,
      scaleContrast: 0.8,
      decorative: 0.5,
      occupancy: 0.7,
      alignment: "left",
      split: 0.55,
      backgroundMode: "paper",
      colorStrategy: "bold",
    },
    createdAt: 1,
    kept: false,
    locked: false,
    revision: 0,
  });
  const decoded = decodeMeta(encodeMeta(meta));
  assert.equal(decoded?.batchId, "batch_1");
  assert.equal(decoded?.grammar, "monument");
  assert.equal(decoded?.dna.margin, 0.05);
  assert.equal(decodeMeta("not json"), null);
  assert.equal(decodeMeta(JSON.stringify({ v: 99 })), null);
  assert.equal(decodeMeta(""), null);
});

test("settings sanitation is total and bounded", () => {
  const values = [
    undefined,
    null,
    {},
    { chaos: NaN, seed: Infinity, preset: 12 },
    { chaos: -100, density: 400, hierarchy: 1000, seed: -9 },
  ];
  for (const value of values) {
    const settings = sanitizeSettings(value);
    assert.ok(settings.chaos >= 0 && settings.chaos <= 100);
    assert.ok(settings.density >= 0 && settings.density <= 100);
    assert.ok(settings.hierarchy >= 0 && settings.hierarchy <= 100);
    assert.ok(settings.seed >= 1 && settings.seed <= 9_999_999);
  }
});
