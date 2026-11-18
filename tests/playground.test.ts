import test from "node:test";
import assert from "node:assert/strict";
import {
  parseData,
  springSamples,
  springCss,
  vectorSvg,
  DEFAULT_RECIPE,
} from "../lib/playground/math.ts";
test("CSV preserves row order and finite values with optional header", () => {
  assert.deepEqual(parseData("label,value\nFirst,0\nSecond,12.5"), [
    { label: "First", value: 0 },
    { label: "Second", value: 12.5 },
  ]);
  assert.deepEqual(parseData("First\t1\nSecond\t2"), [
    { label: "First", value: 1 },
    { label: "Second", value: 2 },
  ]);
});
test("malformed, ambiguous, negative, unbounded and empty data are rejected", () => {
  for (const input of [
    "",
    "one,1",
    "a,-1\nb,2",
    "a,Infinity\nb,3",
    "a,0\nb,0",
    "a,\nb,2",
    "a,b,c\nd,3",
    "a,NaN\nb,2",
  ])
    assert.throws(() => parseData(input));
  assert.throws(() =>
    parseData(Array.from({ length: 66 }, (_, i) => `row${i},${i}`).join("\n")),
  );
  assert.throws(() =>
    parseData(Array.from({ length: 65 }, (_, i) => `row${i},${i}`).join("\n")),
  );
});
test("spring approaches equilibrium and damping changes overshoot", () => {
  const playful = springSamples(170, 10, 1, 3),
    precise = springSamples(170, 35, 1, 3);
  assert.ok(Math.abs(playful.at(-1)! - 1) < 0.001);
  assert.ok(Math.abs(precise.at(-1)! - 1) < 0.001);
  assert.ok(Math.max(...playful) > 1.1);
  assert.ok(Math.max(...precise) < 1.001);
  const css = springCss(170, 10, 1, 1600, 80);
  assert.ok(css.includes("1600ms linear("));
  assert.ok(css.includes("* 80ms"));
  assert.ok(css.includes("prefers-reduced-motion"));
});
test("vector exports match the selected primitive count and remain deterministic", () => {
  const svg = vectorSvg(DEFAULT_RECIPE);
  assert.equal((svg.match(/<circle /g) || []).length, DEFAULT_RECIPE.count);
  assert.equal(svg, vectorSvg(DEFAULT_RECIPE));
  const petal = vectorSvg({ ...DEFAULT_RECIPE, kind: "petal", count: 18 });
  assert.equal((petal.match(/<path /g) || []).length, 18);
  assert.ok(!svg.includes("NaN"));
  assert.ok(!svg.includes("undefined"));
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
});
