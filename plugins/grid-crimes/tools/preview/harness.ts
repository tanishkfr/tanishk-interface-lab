import { generatePlans } from "../../src/engine/planner.ts";
import { heroFixture } from "../../tests/fixtures.ts";
import {
  renderPlanSvg,
  renderSnapshotSvg,
  svgDataUrl,
} from "./render-plan.ts";
import type {
  BatchInfo,
  BatchVariation,
  MutationSettings,
  PresetId,
} from "../../src/shared/types.ts";
import { DEFAULT_SETTINGS } from "../../src/shared/presets.ts";

const params = new URLSearchParams(location.search);
const screen = params.get("screen") ?? "results";
const preset = (params.get("preset") ?? "brutalist") as PresetId;
const width = Number(params.get("w") ?? 440);
const height = Number(params.get("h") ?? 780);

const frame = document.querySelector<HTMLIFrameElement>("#plugin")!;
frame.style.width = `${width}px`;
frame.style.height = `${height}px`;

const fixture = heroFixture;
const settings: MutationSettings = {
  ...DEFAULT_SETTINGS,
  preset,
  seed: 2718,
};
const plans = generatePlans(fixture, settings, { count: 4 }).plans;

const variations: BatchVariation[] = plans.map((plan, index) => ({
  id: `preview_v${index + 1}`,
  frameId: `preview_frame_${index + 1}`,
  name: `GRID CRIMES / ${plan.presetName} / ${String(index + 1).padStart(3, "0")}`,
  seed: plan.seed,
  preset: plan.preset,
  presetName: plan.presetName,
  grammar: plan.grammarId,
  grammarName: plan.grammarName,
  score: plan.score,
  width: plan.width,
  height: plan.height,
  kept: index === 1,
  locked: index === 1,
  thumbnail: svgDataUrl(
    renderPlanSvg(plan, fixture, `${plan.grammarId} / seed ${plan.seed}`),
  ),
  dna: plan.dna,
}));

const crossPlans = ["swiss", "maximal"].map((presetId, index) => {
  const crossSettings: MutationSettings = {
    ...DEFAULT_SETTINGS,
    preset: presetId as PresetId,
    seed: 4800 + index,
  };
  return generatePlans(fixture, crossSettings, { count: 1 }).plans[0];
});

const selectedGenerated = screen === "crossbreed"
  ? crossPlans.map((plan, index) => ({
      v: 1 as const,
      generator: "0.1.0",
      kind: "variation" as const,
      batchId: `preview_cross_batch_${index}`,
      containerId: `preview_cross_container_${index}`,
      variationId: `preview_cross_${index}`,
      index,
      preset: plan.preset,
      presetName: plan.presetName,
      seed: plan.seed,
      settings: plan.settings,
      grammar: plan.grammarId,
      grammarName: plan.grammarName,
      score: plan.score,
      sourceFingerprint: fixture.fingerprint,
      sourceName: fixture.name,
      sourceIds: ["preview_source"],
      dna: plan.dna,
      createdAt: Date.now(),
      kept: false,
      locked: false,
      revision: 0,
    }))
  : [];

const batch: BatchInfo = {
  id: "preview_batch",
  containerId: "preview_container",
  sourceName: fixture.name,
  sourceFingerprint: fixture.fingerprint,
  createdAt: Date.now(),
  variations,
  preset,
  settings,
  parentMeta: null,
  auxNodeIds: [],
  sourceThumbnail: svgDataUrl(renderSnapshotSvg(fixture)),
};

const state = {
  selection: fixture,
  selectionProblem: null,
  batch: screen === "configure" ? null : batch,
  canCrossbreed: selectedGenerated.length === 2,
  selectedGenerated,
  selectedThumbnails: Object.fromEntries(
    crossPlans.map((plan, index) => [
      `preview_cross_${index}`,
      svgDataUrl(renderPlanSvg(plan, fixture, plan.grammarId)),
    ]),
  ),
  lastSettings: settings,
  version: "0.1.0",
  pending: false,
};

let sent = false;
(window as unknown as { __previewReady: boolean }).__previewReady = false;

function sendState(): void {
  frame.contentWindow?.postMessage({ type: "state", payload: state }, "*");
}

function afterState(): void {
  if (screen === "crossbreed") {
    window.setTimeout(() => {
      frame.contentDocument
        ?.querySelector<HTMLElement>('[data-action="open-crossbreed"]')
        ?.click();
      window.setTimeout(() => {
        (window as unknown as { __previewReady: boolean }).__previewReady = true;
      }, 220);
    }, 260);
  } else if (screen === "help") {
    window.setTimeout(() => {
      frame.contentDocument
        ?.querySelector<HTMLElement>('[data-action="help"]')
        ?.click();
      window.setTimeout(() => {
        (window as unknown as { __previewReady: boolean }).__previewReady = true;
      }, 220);
    }, 260);
  } else {
    window.setTimeout(() => {
      (window as unknown as { __previewReady: boolean }).__previewReady = true;
    }, 220);
  }
}

// Retry until the plugin document has actually mounted. This is more reliable
// than assuming the first `ready` message wins a load-event race.
let attempts = 0;
const retry = window.setInterval(() => {
  attempts += 1;
  if (frame.contentDocument?.querySelector(".topbar")) {
    window.clearInterval(retry);
    if (!sent) {
      sent = true;
      afterState();
    }
    return;
  }
  sendState();
  if (attempts > 24) {
    window.clearInterval(retry);
    sent = true;
    afterState();
  }
}, 260);

window.addEventListener("message", (event) => {
  if (event.source !== frame.contentWindow) return;
  const message = event.data;
  if (!message || message.type !== "ready") return;
  if (!sent) {
    sent = true;
    sendState();
    afterState();
  }
});

frame.addEventListener("load", () => {
  window.setTimeout(() => {
    if (!sent) sendState();
  }, 350);
});
