import { generatePlans } from "../../src/engine/planner.ts";
import { heroFixture } from "../../tests/fixtures.ts";
import { DEFAULT_SETTINGS, PRESET_LIST } from "../../src/shared/presets.ts";
import { renderPlanSvg } from "./render-plan.ts";

const root = document.querySelector("#cover")!;

const plans = PRESET_LIST.map((preset) =>
  generatePlans(
    heroFixture,
    { ...DEFAULT_SETTINGS, preset: preset.id, seed: 2718 },
    { count: 1 },
  ).plans[0],
);

const strip = plans
  .map(
    (plan, index) => `<figure class="cell cell-${index + 1}">
      <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        renderPlanSvg(plan, heroFixture),
      )}" alt="" />
      <figcaption>${plan.presetName}</figcaption>
    </figure>`,
  )
  .join("");

root.innerHTML = `
  <div class="meta-top"><span>LAB/ — INDEPENDENT SOFTWARE</span><span>FIGMA PLUGIN · DEVELOPMENT BUILD · 2026</span></div>
  <div class="left">
    <h1><span>GRID</span><span>CRIMES</span><em>/</em></h1>
    <p class="tagline">BREAK THE GRID.<br/>KEEP THE CRAFT.</p>
    <p class="describe">Six composition engines. Three mutation controls. Four editable variations. Crossbreed two directions into a third that neither would have produced alone.</p>
    <div class="chips"><span>06 DIRECTIONS</span><span>NATIVE LAYERS</span><span>SEEDED</span><span>OFFLINE</span></div>
  </div>
  <div class="right">
    <div class="strip">${strip}</div>
  </div>
  <div class="slash" aria-hidden="true">/</div>
  <div class="meta-bottom"><span>v0.1.0 · NOT YET PUBLISHED</span><span>GRID CRIMES / BY LAB /</span></div>
`;
