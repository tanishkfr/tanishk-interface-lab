import test from "node:test";
import assert from "node:assert/strict";
import {
  PRESETS,
  dataMaximum,
  datumAngle,
  datumIndexFromAngle,
  datumIndexFromU,
  datumU,
  fossilEnvelope,
  formatValue,
  normalizeValue,
  sampleSeries,
  sampleSeriesCyclic,
  terrainEnvelope,
  withValue,
} from "../lib/playground/data-matter/model.ts";

test("terrain sampling preserves row order, endpoints and smooth interpolation", () => {
  const values = [10, 20, 40];
  assert.equal(sampleSeries(values, 0), 10);
  assert.equal(sampleSeries(values, 0.5), 20);
  assert.equal(sampleSeries(values, 1), 40);
  const q = sampleSeries(values, 0.25);
  assert.ok(q > 10 && q < 20, "interpolated value sits between neighbours");
  assert.ok(
    Math.abs(sampleSeries(values, 0.25) - sampleSeries(values, 0.25)) < 1e-12,
  );
  assert.equal(sampleSeries([12], 0.8), 12);
  assert.equal(sampleSeries([], 0.8), 0);
});

test("terrain data positions map back to the same datum", () => {
  assert.equal(datumIndexFromU(7, 0), 0);
  assert.equal(datumIndexFromU(7, 0.5), 3);
  assert.equal(datumIndexFromU(7, 1), 6);
  assert.equal(datumIndexFromU(2, 0.1), 0);
  assert.equal(datumIndexFromU(2, 0.9), 1);
  for (const count of [2, 7, 13, 64]) {
    for (let i = 0; i < count; i++) {
      assert.equal(datumIndexFromU(count, datumU(count, i)), i);
    }
  }
});

test("fossil row order wraps clockwise and keeps the original layer envelope", () => {
  const values = [10, 20, 30, 40];
  assert.equal(sampleSeriesCyclic(values, 0), 10);
  assert.ok(sampleSeriesCyclic(values, 0.9999) < 10.001);
  assert.ok(Math.abs(sampleSeriesCyclic(values, 0.25) - 20) < 1e-9);
  assert.equal(sampleSeriesCyclic(values, 1.25), sampleSeriesCyclic(values, 0.25));
  assert.ok(fossilEnvelope(0) > 0);
  assert.ok(fossilEnvelope(15) > fossilEnvelope(2));
  assert.ok(fossilEnvelope(15) > fossilEnvelope(32));
  for (const count of [2, 7, 32, 64]) {
    for (let i = 0; i < count; i++) {
      assert.equal(
        datumIndexFromAngle(count, datumAngle(count, i) / (Math.PI * 2)),
        i,
      );
    }
  }
});

test("normalisation floors the scale at one and handles zero values", () => {
  assert.equal(dataMaximum([]), 1);
  assert.equal(dataMaximum([{ label: "zero", value: 0 }]), 1);
  assert.equal(
    dataMaximum([
      { label: "a", value: 0 },
      { label: "b", value: 12.5 },
    ]),
    12.5,
  );
  assert.equal(normalizeValue(0, 10), 0);
  assert.equal(normalizeValue(5, 10), 0.5);
  assert.equal(normalizeValue(10, 10), 1);
  assert.equal(normalizeValue(20, 10), 2);
  assert.equal(normalizeValue(3, 0), 0);
});

test("terrain envelope rises from both edges to the middle", () => {
  assert.ok(Math.abs(terrainEnvelope(0) - 0.25) < 1e-12);
  assert.ok(Math.abs(terrainEnvelope(0.5) - 1) < 1e-12);
  assert.ok(Math.abs(terrainEnvelope(1) - 0.25) < 1e-12);
  assert.ok(terrainEnvelope(0.25) > terrainEnvelope(0));
  assert.ok(terrainEnvelope(0.75) > terrainEnvelope(1));
});

test("editing one value preserves order, clamps negatives and leaves neighbours", () => {
  const data = [
    { label: "a", value: 4 },
    { label: "b", value: 9 },
    { label: "c", value: 2 },
  ];
  const next = withValue(data, 1, -5);
  assert.equal(next[1].value, 0);
  assert.equal(next[0].value, 4);
  assert.equal(next[2].value, 2);
  assert.notEqual(next, data);
  assert.equal(withValue(data, 1, Number.POSITIVE_INFINITY)[1].value, 0);
  assert.equal(withValue(data, 1, 1_500_000)[1].value, 1_000_000);
});

test("every curated preset is a valid, explicitly illustrative dataset", () => {
  assert.equal(PRESETS.length, 5);
  for (const preset of PRESETS) {
    assert.ok(preset.title.length > 0);
    assert.match(preset.note, /illustrative/i);
    assert.ok(preset.data.length >= 2 && preset.data.length <= 64);
    assert.ok(preset.data.some((d) => d.value > 0));
    for (const datum of preset.data) {
      assert.ok(Number.isFinite(datum.value) && datum.value >= 0);
      assert.ok(datum.label.length > 0 && datum.label.length <= 60);
    }
  }
});

test("value formatting is readable and tabular", () => {
  assert.equal(formatValue(110), "110");
  assert.equal(formatValue(12.5), "12.5");
  assert.equal(formatValue(1200000), "1,200,000");
});
