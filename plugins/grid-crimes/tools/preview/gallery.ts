import { PRESET_LIST } from "../../src/shared/presets.ts";
import type { MutationSettings } from "../../src/shared/types.ts";
import { generatePlans } from "../../src/engine/planner.ts";
import { heroFixture } from "../../tests/fixtures.ts";
import { DEFAULT_SETTINGS } from "../../src/shared/presets.ts";
import { renderPlanSvg, renderSnapshotSvg } from "./render-plan.ts";

const root = document.querySelector("#gallery")!;
const cards: string[] = [];

cards.push(`<article class="card source">
  <div class="art"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    renderSnapshotSvg(heroFixture),
  )}" alt="Source composition preview" /></div>
  <div class="caption"><span class="tag">SOURCE</span><strong>Website hero</strong><span>6 real content blocks</span></div>
</article>`);

for (const preset of PRESET_LIST) {
  const settings: MutationSettings = {
    ...DEFAULT_SETTINGS,
    preset: preset.id,
    seed: 2718,
  };
  const plan = generatePlans(heroFixture, settings, { count: 1 }).plans[0];
  const svg = renderPlanSvg(plan, heroFixture);
  cards.push(`<article class="card">
    <div class="art"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" alt="${preset.name} engine preview" /></div>
    <div class="caption"><span class="tag">${preset.index}/</span><strong>${preset.name}</strong><span>${plan.grammarName} · ${Math.round(
      plan.score,
    )} pts</span></div>
  </article>`);
}

root.innerHTML = cards.join("");
