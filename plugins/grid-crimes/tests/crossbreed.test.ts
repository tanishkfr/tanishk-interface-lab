import test from "node:test";
import assert from "node:assert/strict";
import { heroFixture, posterFixture } from "./fixtures.ts";
import { generatePlans } from "../src/engine/planner.ts";
import {
  canCrossbreed,
  crossbreedPlans,
  hybridGrammarPool,
  mixDna,
} from "../src/engine/crossbreed/crossbreed.ts";
import { DEFAULT_SETTINGS } from "../src/shared/presets.ts";
import type {
  CrossbreedParent,
  LayoutPlan,
  MutationSettings,
} from "../src/shared/types.ts";
import { scorePlan } from "../src/engine/scoring/score.ts";

function parentFrom(
  plan: LayoutPlan,
  frameId: string,
  settings: MutationSettings,
): CrossbreedParent {
  return {
    frameId,
    preset: plan.preset,
    presetName: plan.presetName,
    grammar: plan.grammarId,
    seed: plan.seed,
    score: plan.score,
    sourceFingerprint: heroFixture.fingerprint,
    batchId: "batch_1",
    settings,
    dna: plan.dna,
  };
}

function parents() {
  const aSettings: MutationSettings = {
    ...DEFAULT_SETTINGS,
    preset: "brutalist",
    seed: 100,
  };
  const bSettings: MutationSettings = {
    ...DEFAULT_SETTINGS,
    preset: "swiss",
    seed: 200,
  };
  const aPlan = generatePlans(heroFixture, aSettings, { count: 1 }).plans[0];
  const bPlan = generatePlans(heroFixture, bSettings, { count: 1 }).plans[0];
  return {
    a: parentFrom(aPlan, "frame-a", aSettings),
    b: parentFrom(bPlan, "frame-b", bSettings),
    aSettings,
    bSettings,
  };
}

test("crossbreed rejects different source structures and identical engines", () => {
  const { a, b } = parents();
  assert.equal(canCrossbreed(a, b).ok, true);
  const incompatible = { ...b, sourceFingerprint: "another-source" };
  assert.equal(canCrossbreed(a, incompatible).ok, false);
  const same = { ...b, preset: a.preset, grammar: a.grammar };
  assert.equal(canCrossbreed(a, same).ok, false);
});

test("crossbreed generates four valid, editable offspring", () => {
  const { a, b } = parents();
  const result = crossbreedPlans(heroFixture, a, b, {
    inheritance: 50,
    settings: DEFAULT_SETTINGS,
    count: 4,
  });
  assert.equal(result.plans.length, 4);
  assert.equal(result.grammarPool.length >= 4, true);
  for (const plan of result.plans) {
    assert.equal(plan.blocks.length, heroFixture.blocks.length);
    assert.equal(scorePlan(plan, heroFixture).valid, true);
    assert.ok(plan.score >= 50);
  }
  assert.equal(new Set(result.plans.map((plan) => plan.grammarId)).size, 4);
});

test("crossbreed is deterministic and inheritance changes the DNA", () => {
  const { a, b } = parents();
  const runA = crossbreedPlans(heroFixture, a, b, {
    inheritance: 24,
    settings: DEFAULT_SETTINGS,
    count: 4,
  });
  const runB = crossbreedPlans(heroFixture, a, b, {
    inheritance: 24,
    settings: DEFAULT_SETTINGS,
    count: 4,
  });
  assert.deepEqual(
    runA.plans.map((plan) => ({
      grammar: plan.grammarId,
      seed: plan.seed,
      blocks: plan.blocks,
    })),
    runB.plans.map((plan) => ({
      grammar: plan.grammarId,
      seed: plan.seed,
      blocks: plan.blocks,
    })),
  );
  const left = crossbreedPlans(heroFixture, a, b, {
    inheritance: 0,
    settings: DEFAULT_SETTINGS,
    count: 1,
  }).dna;
  const right = crossbreedPlans(heroFixture, a, b, {
    inheritance: 100,
    settings: DEFAULT_SETTINGS,
    count: 1,
  }).dna;
  assert.notDeepEqual(left, right);
  assert.equal(hybridGrammarPool(a, b, 0)[0], a.grammar);
  assert.equal(hybridGrammarPool(a, b, 100)[0], b.grammar);
});

test("crossbreed refuses a source that no longer matches the parents", () => {
  const { a, b } = parents();
  assert.throws(
    () =>
      crossbreedPlans(posterFixture, a, b, {
        inheritance: 50,
        settings: DEFAULT_SETTINGS,
        count: 4,
      }),
    /no longer matches|different source|source/i,
  );
});

test("DNA interpolation stays within declared bounds", () => {
  const { a, b } = parents();
  let seed = 1;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (const inheritance of [0, 10, 25, 50, 75, 90, 100]) {
    const dna = mixDna(a.dna, b.dna, inheritance, rng, inheritance);
    assert.ok(dna.margin >= 0.018 && dna.margin <= 0.25);
    assert.ok(dna.columns >= 3);
    assert.ok(dna.gutter >= 0.006 && dna.gutter <= 0.05);
    assert.ok(dna.asymmetry >= -0.8 && dna.asymmetry <= 0.9);
    assert.ok(dna.rotation >= 0 && dna.rotation <= 16);
    assert.ok(dna.scaleContrast >= 0.15 && dna.scaleContrast <= 1);
    assert.ok(dna.decorative >= 0.01 && dna.decorative <= 1);
    assert.ok(dna.occupancy >= 0.12 && dna.occupancy <= 0.96);
    assert.ok(dna.split >= 0.32 && dna.split <= 0.72);
  }
});
