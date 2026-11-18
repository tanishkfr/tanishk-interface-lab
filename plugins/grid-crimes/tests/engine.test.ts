import test from "node:test";
import assert from "node:assert/strict";
import {
  allFixtures,
  allPresets,
  heroFixture,
  posterFixture,
  denseFixture,
} from "./fixtures.ts";
import { generatePlans } from "../src/engine/planner.ts";
import { scorePlan, layoutDistance } from "../src/engine/scoring/score.ts";
import { DEFAULT_SETTINGS } from "../src/shared/presets.ts";
import {
  sanitizeSettings,
  outputDimensions,
  applyRoleOverrides,
} from "../src/shared/settings.ts";
import type { CompositionSnapshot, LayoutPlan, MutationSettings } from "../src/shared/types.ts";

function settings(overrides: Partial<MutationSettings> = {}): MutationSettings {
  return {
    ...DEFAULT_SETTINGS,
    preset: "brutalist",
    seed: 2718,
    ...overrides,
  };
}

function stripped(plan: LayoutPlan) {
  return {
    grammar: plan.grammarId,
    seed: plan.seed,
    score: plan.score,
    width: plan.width,
    height: plan.height,
    blocks: plan.blocks,
    decorations: plan.decorations,
    dna: plan.dna,
    background: plan.background,
  };
}

test("all six presets generate four complete plans for every fixture", () => {
  for (const fixture of allFixtures) {
    for (const preset of allPresets) {
      const result = generatePlans(fixture, settings({ preset }), { count: 4 });
      assert.equal(result.plans.length, 4, `${fixture.name} / ${preset}`);
      const grammars = new Set(result.plans.map((plan) => plan.grammarId));
      assert.equal(grammars.size, 4, `${fixture.name} / ${preset} should use four grammars`);
      for (const plan of result.plans) {
        assert.equal(
          plan.blocks.length,
          fixture.blocks.length,
          `${fixture.name} / ${preset} / ${plan.grammarId} must place every block`,
        );
        const scored = scorePlan(plan, fixture);
        assert.equal(scored.valid, true, `${fixture.name} / ${preset} / ${plan.grammarId}: ${scored.hard.join("; ")}`);
        assert.ok(plan.score >= 55, `${fixture.name} / ${preset} score ${plan.score}`);
        for (const block of plan.blocks) {
          assert.ok(Number.isFinite(block.rect.x + block.rect.y));
          assert.ok(block.rect.w > 0 && block.rect.h > 0);
        }
      }
    }
  }
});

test("same source, settings and seed are byte-for-byte deterministic", () => {
  for (const preset of allPresets) {
    const a = generatePlans(posterFixture, settings({ preset }), { count: 4 });
    const b = generatePlans(posterFixture, settings({ preset }), { count: 4 });
    assert.deepEqual(a.plans.map(stripped), b.plans.map(stripped));
  }
});

test("variations are geometrically distinct", () => {
  for (const preset of allPresets) {
    const result = generatePlans(heroFixture, settings({ preset }), { count: 4 });
    let minimum = Infinity;
    for (let i = 0; i < result.plans.length; i += 1) {
      for (let j = i + 1; j < result.plans.length; j += 1) {
        minimum = Math.min(minimum, layoutDistance(result.plans[i], result.plans[j]));
      }
    }
    assert.ok(minimum > 0.02, `${preset} minimum variation distance ${minimum}`);
  }
});

test("chaos, density and hierarchy materially change a composition", () => {
  const low = generatePlans(heroFixture, settings({ preset: "brutalist", chaos: 4, density: 12, hierarchy: 12 }), { count: 1 }).plans[0];
  const high = generatePlans(heroFixture, settings({ preset: "brutalist", chaos: 96, density: 92, hierarchy: 96 }), { count: 1 }).plans[0];
  assert.notEqual(low.score, high.score);
  assert.notDeepEqual(low.blocks.map((block) => block.rect), high.blocks.map((block) => block.rect));
  const headlineLow = low.blocks.find((block) => block.role === "headline")?.text?.fontSize ?? 0;
  const headlineHigh = high.blocks.find((block) => block.role === "headline")?.text?.fontSize ?? 0;
  assert.ok(headlineHigh > headlineLow, "hierarchy must enlarge the focal type");
  assert.ok(high.dna.decorative >= low.dna.decorative);
  assert.ok(high.dna.margin <= low.dna.margin, "density must reduce margins");
});

test("preset controls produce different composition languages", () => {
  const plans = allPresets.map((preset) =>
    generatePlans(heroFixture, settings({ preset }), { count: 1 }).plans[0],
  );
  for (let i = 0; i < plans.length; i += 1) {
    for (let j = i + 1; j < plans.length; j += 1) {
      assert.notEqual(plans[i].grammarId, plans[j].grammarId);
      assert.ok(layoutDistance(plans[i], plans[j]) > 0.01);
    }
  }
});

test("output ratios change the plan frame", () => {
  const square = generatePlans(heroFixture, settings({ outputSize: "square" }), { count: 1 }).plans[0];
  const portrait = generatePlans(heroFixture, settings({ outputSize: "portrait" }), { count: 1 }).plans[0];
  const landscape = generatePlans(heroFixture, settings({ outputSize: "landscape" }), { count: 1 }).plans[0];
  assert.ok(Math.abs(square.width - square.height) <= 1);
  assert.ok(portrait.height > portrait.width);
  assert.ok(landscape.width > landscape.height);
  assert.deepEqual(outputDimensions(1200, 800, "square"), { width: 980, height: 980 });
});

test("long headlines stay inside the frame and remain editable", () => {
  const long = structuredClone(posterFixture);
  const headline = long.blocks.find((block) => block.role === "headline")!;
  headline.text = {
    ...headline.text!,
    characters: "THIS IS AN EXTREMELY LONG HEADLINE ".repeat(8).trim(),
    sample: "THIS IS AN EXTREMELY LONG HEADLINE",
    length: "THIS IS AN EXTREMELY LONG HEADLINE ".repeat(8).trim().length,
  };
  for (const preset of allPresets) {
    const result = generatePlans(long, settings({ preset }), { count: 4 });
    for (const plan of result.plans) {
      const planned = plan.blocks.find((block) => block.sourceId === headline.id)!;
      assert.ok(planned.text!.fontSize >= 9);
      assert.ok(planned.rect.x >= -3 && planned.rect.y >= -3);
      assert.ok(planned.rect.x + planned.rect.w <= plan.width + 4);
      assert.equal(scorePlan(plan, long).valid, true);
    }
  }
});

test("dense sources use the legibility-first index layout", () => {
  const result = generatePlans(denseFixture, settings({ preset: "swiss" }), { count: 4 });
  assert.equal(result.plans.length, 4);
  for (const plan of result.plans) {
    assert.ok(plan.grammarId.startsWith("dense-index"));
    assert.equal(plan.blocks.length, denseFixture.blocks.length);
    assert.equal(scorePlan(plan, denseFixture).valid, true);
  }
});

test("role overrides change the generated hierarchy", () => {
  const changed: CompositionSnapshot = applyRoleOverrides(heroFixture, [
    { id: "h-visual", role: "headline" },
    { id: "h-head", role: "visual" },
  ]);
  const result = generatePlans(changed, settings({ preset: "swiss" }), { count: 4 });
  assert.equal(result.plans.length, 4);
  for (const plan of result.plans) {
    const visualNowHeadline = plan.blocks.find((block) => block.sourceId === "h-visual");
    assert.equal(visualNowHeadline?.role, "headline");
    assert.equal(scorePlan(plan, changed).valid, true);
  }
});

test("invalid settings are clamped instead of trusted", () => {
  const sanitized = sanitizeSettings({
    preset: "not-a-preset",
    chaos: 800,
    density: -20,
    hierarchy: 42.6,
    seed: 0,
    outputSize: "huge",
    preserveColors: "yes",
  });
  assert.equal(sanitized.chaos, 100);
  assert.equal(sanitized.density, 0);
  assert.equal(sanitized.hierarchy, 43);
  assert.equal(sanitized.seed, 1);
  assert.equal(sanitized.preset, "brutalist");
  assert.equal(sanitized.outputSize, "source");
  assert.equal(sanitized.preserveColors, false);
});

test("single-element compositions still produce four complete directions", () => {
  const single: CompositionSnapshot = {
    ...posterFixture,
    name: "Single text",
    sourceIds: ["only"],
    blocks: [
      {
        ...posterFixture.blocks[0],
        id: "only",
        name: "Solo headline",
        role: "headline",
        bounds: { x: 0, y: 0, w: 900, h: 500 },
        areaShare: 0.3,
        text: {
          ...posterFixture.blocks[0].text!,
          characters: "ONE LINE, NO SAFETY NET",
          sample: "ONE LINE, NO SAFETY NET",
          length: 23,
        },
      },
    ],
    roleCounts: {
      headline: 1,
      subhead: 0,
      body: 0,
      visual: 0,
      action: 0,
      label: 0,
      decoration: 0,
      module: 0,
    },
  };
  for (const preset of allPresets) {
    const result = generatePlans(single, settings({ preset }), { count: 4 });
    assert.equal(result.plans.length, 4);
    for (const plan of result.plans) {
      assert.equal(plan.blocks.length, 1);
      assert.equal(scorePlan(plan, single).valid, true);
    }
  }
});

test("plans never contain negative or zero dimensions", () => {
  for (const fixture of allFixtures) {
    for (const preset of allPresets) {
      const result = generatePlans(fixture, settings({ preset }), { count: 2 });
      for (const plan of result.plans) {
        for (const element of [...plan.blocks, ...plan.decorations]) {
          assert.ok(element.rect.w > 0, `${fixture.name} ${preset} width`);
          assert.ok(element.rect.h > 0, `${fixture.name} ${preset} height`);
        }
      }
    }
  }
});
