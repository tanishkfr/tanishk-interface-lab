import type {
  BatchInfo,
  BatchVariation,
  CompositionSnapshot,
  DesignDNA,
  GridCrimesMeta,
  MutationSettings,
  PresetId,
  Role,
} from "../shared/types.ts";
import { ROLES } from "../shared/types.ts";
import {
  DEFAULT_SETTINGS,
  OUTPUT_SIZE_LABELS,
  PRESETS,
  PRESET_LIST,
} from "../shared/presets.ts";
import {
  describeRoles,
  presetDefaults,
  sanitizeSettings,
} from "../shared/settings.ts";
import { primaryBlocks } from "../engine/analyze.ts";
import { postToMain } from "../shared/protocol.ts";

type View = "configure" | "results" | "crossbreed";

interface MainState {
  selection: CompositionSnapshot | null;
  selectionProblem: string | null;
  batch: BatchInfo | null;
  canCrossbreed: boolean;
  selectedGenerated: GridCrimesMeta[];
  selectedThumbnails?: Record<string, string>;
  lastSettings: MutationSettings | null;
  version: string;
  pending: boolean;
}

interface Progress {
  operation: string;
  phase: string;
  message: string;
  percent: number;
}

const app = document.querySelector<HTMLDivElement>("#app")!;
const toastRoot = document.querySelector<HTMLDivElement>("#toast-root")!;
const modalRoot = document.querySelector<HTMLDivElement>("#modal-root")!;

let state: MainState | null = null;
let view: View = "configure";
let settings: MutationSettings = { ...DEFAULT_SETTINGS };
let selectedVariation: string | null = null;
let parentA: string | null = null;
let parentB: string | null = null;
let inheritance = 50;
let busy = false;
let advancedOpen = false;
let firstState = true;
let lastBatchId: string | null = null;
let progress: Progress | null = null;
let localError: string | null = null;
let noticeList: string[] = [];
let mysteryThumbnails = new Map<string, string>();
let modalOpen = false;
let lastFocused: HTMLElement | null = null;
let operationToast: HTMLDivElement | null = null;
let toastId = 0;
const activeToasts: Array<{ id: number; tone: string; message: string }> = [];

const SLIDERS: Array<{
  key: "chaos" | "density" | "hierarchy";
  label: string;
  note: string;
}> = [
  {
    key: "chaos",
    label: "Chaos",
    note: "How far the composition is willing to leave the safe alignment.",
  },
  {
    key: "density",
    label: "Density",
    note: "Space, compression, and how much of the frame the content occupies.",
  },
  {
    key: "hierarchy",
    label: "Hierarchy",
    note: "The distance between the focal point and everything supporting it.",
  },
];

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function post(type: string, payload: Record<string, unknown> = {}): void {
  postToMain(type, payload);
}

function roleOverrides(): Array<{ id: string; role: Role }> {
  return state?.selection?.blocks.map((block) => ({
    id: block.id,
    role: block.role,
  })) ?? [];
}

function currentVariations(): BatchVariation[] {
  const list = [...(state?.batch?.variations ?? [])];
  const seen = new Set(list.map((variation) => variation.id));
  for (const meta of state?.selectedGenerated ?? []) {
    if (seen.has(meta.variationId)) continue;
    list.push({
      id: meta.variationId,
      frameId: "",
      name: meta.presetName || "Selected variation",
      seed: meta.seed,
      preset: meta.preset,
      presetName: meta.presetName,
      grammar: meta.grammar,
      grammarName: meta.grammarName,
      score: meta.score,
      width: 0,
      height: 0,
      kept: meta.kept,
      locked: meta.locked,
      thumbnail: mysteryThumbnails.get(meta.variationId) ?? null,
      dna: meta.dna,
    });
    seen.add(meta.variationId);
  }
  return list;
}

function variationById(id: string | null): BatchVariation | null {
  if (!id) return null;
  return currentVariations().find((variation) => variation.id === id) ?? null;
}

function thumbnailFor(variation: BatchVariation): string | null {
  return mysteryThumbnails.get(variation.id) ?? variation.thumbnail ?? null;
}

function setPreset(preset: PresetId): void {
  const defaults = presetDefaults(preset);
  settings = {
    ...settings,
    preset,
    chaos: defaults.chaos,
    density: defaults.density,
    hierarchy: defaults.hierarchy,
  };
  selectedVariation = null;
  localError = null;
  render();
}

function updateFill(input: HTMLInputElement): void {
  const percent = ((Number(input.value) - Number(input.min || 0)) /
    (Number(input.max || 100) - Number(input.min || 0))) *
    100;
  input.style.setProperty("--fill", `${Math.max(0, Math.min(100, percent))}%`);
}

function syncSliderFills(): void {
  document.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(updateFill);
}

function nextSeed(): number {
  settings.seed = (settings.seed % 9_999_999) + 1;
  return settings.seed;
}

function pushToast(tone: string, message: string): void {
  const id = ++toastId;
  activeToasts.push({ id, tone, message });
  while (activeToasts.length > 2) activeToasts.shift();
  renderToasts();
  window.setTimeout(() => {
    const index = activeToasts.findIndex((toast) => toast.id === id);
    if (index >= 0) activeToasts.splice(index, 1);
    renderToasts();
  }, tone === "error" ? 7000 : 5200);
}

function renderToasts(): void {
  toastRoot.innerHTML = activeToasts
    .map(
      (toast) =>
        `<div class="toast" data-tone="${escapeHtml(toast.tone)}" role="status">${escapeHtml(
          toast.message,
        )}</div>`,
    )
    .join("");
}

/* ------------------------------------------------------------------ */
/* Icons and preset art                                               */
/* ------------------------------------------------------------------ */

function presetArt(id: PresetId): string {
  const paper = "#f3f1e8";
  const ink = "#23241f";
  const acid = "#e5e94b";
  const violet = "#5834d7";
  const coral = "#ff795b";
  switch (id) {
    case "brutalist":
      return `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect width="120" height="60" fill="${paper}"/>
        <rect x="6" y="7" width="55" height="23" fill="${ink}"/>
        <rect x="65" y="7" width="49" height="7" fill="${acid}"/>
        <rect x="65" y="18" width="34" height="4" fill="${ink}"/>
        <rect x="6" y="35" width="108" height="2" fill="${ink}"/>
        <rect x="6" y="42" width="53" height="11" fill="${coral}"/>
        <rect x="63" y="42" width="51" height="11" fill="none" stroke="${ink}"/>
        <rect x="6" y="7" width="5" height="46" fill="${acid}"/>
      </svg>`;
    case "swiss":
      return `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect width="120" height="60" fill="${paper}"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7]
          .map((i) => `<rect x="${8 + i * 13}" y="7" width="1" height="46" fill="${ink}" opacity=".18"/>`)
          .join("")}
        <rect x="8" y="10" width="49" height="5" fill="${ink}"/>
        <rect x="8" y="19" width="36" height="3" fill="${ink}"/>
        <rect x="70" y="10" width="42" height="27" fill="${violet}"/>
        <circle cx="21" cy="41" r="7" fill="${acid}"/>
        <rect x="70" y="42" width="26" height="2" fill="${ink}"/>
        <rect x="100" y="42" width="12" height="2" fill="${ink}"/>
      </svg>`;
    case "minimal":
      return `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect width="120" height="60" fill="#fbfaf4"/>
        <rect x="9" y="10" width="1" height="40" fill="${ink}" opacity=".3"/>
        <rect x="18" y="39" width="44" height="4" fill="${ink}"/>
        <rect x="18" y="46" width="17" height="1.5" fill="${ink}" opacity=".4"/>
        <rect x="92" y="12" width="15" height="15" fill="${violet}"/>
        <circle cx="72" cy="16" r="2.4" fill="${acid}"/>
      </svg>`;
    case "maximal":
      return `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect width="120" height="60" fill="${coral}"/>
        <rect x="0" y="0" width="42" height="60" fill="${violet}"/>
        <circle cx="35" cy="35" r="25" fill="${acid}"/>
        <rect x="38" y="7" width="76" height="19" fill="${ink}" transform="rotate(-3 76 16)"/>
        <rect x="44" y="31" width="58" height="6" fill="${paper}"/>
        <rect x="44" y="41" width="30" height="6" fill="${paper}"/>
        <rect x="83" y="41" width="29" height="12" fill="${ink}"/>
        <rect x="7" y="6" width="16" height="5" fill="${paper}"/>
        <rect x="94" y="0" width="5" height="60" fill="${paper}"/>
      </svg>`;
    case "antigrid":
      return `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect width="120" height="60" fill="${paper}"/>
        <rect x="9" y="8" width="43" height="15" fill="${ink}" transform="rotate(-3 30 15)"/>
        <rect x="59" y="14" width="38" height="3" fill="${ink}"/>
        <rect x="27" y="31" width="38" height="18" fill="${violet}" transform="rotate(4 46 40)"/>
        <rect x="74" y="27" width="29" height="8" fill="${acid}" transform="rotate(-5 88 31)"/>
        <rect x="70" y="43" width="2" height="12" fill="${ink}"/>
        <rect x="15" y="52" width="63" height="1.5" fill="${ink}"/>
        <circle cx="101" cy="8" r="3" fill="${coral}"/>
      </svg>`;
    case "chaos":
      return `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect width="120" height="60" fill="${ink}"/>
        <polygon points="0,0 46,0 26,60 0,60" fill="${violet}"/>
        <polygon points="40,0 95,9 68,31 36,24" fill="${acid}"/>
        <polygon points="63,26 120,15 120,44 74,38" fill="${coral}"/>
        <rect x="8" y="7" width="15" height="3" fill="${paper}"/>
        <circle cx="101" cy="48" r="7" fill="none" stroke="${paper}" stroke-width="1.4"/>
        <rect x="22" y="43" width="30" height="2" fill="${paper}" transform="rotate(-6 37 44)"/>
        <rect x="52" y="49" width="18" height="6" fill="${paper}"/>
      </svg>`;
  }
}

/* ------------------------------------------------------------------ */
/* Render                                                             */
/* ------------------------------------------------------------------ */

function render(): void {
  const scroll = document.querySelector<HTMLDivElement>(".main");
  const scrollTop = scroll?.scrollTop ?? 0;
  const hasBatch = Boolean(state?.batch);
  if (view === "results" && !hasBatch) view = "configure";
  if (view === "crossbreed" && !hasBatch) view = "configure";
  app.innerHTML = `${renderHeader()}${
    view === "crossbreed"
      ? `<div class="main">${renderCrossbreed()}</div>`
      : `<div class="main">${hasBatch ? renderTabs() : ""}${
          view === "results" ? renderResults() : renderConfigure()
        }</div>`
  }`;
  const nextScroll = document.querySelector<HTMLDivElement>(".main");
  if (nextScroll) nextScroll.scrollTop = scrollTop;
  syncSliderFills();
}

function renderHeader(): string {
  const hasBatch = Boolean(state?.batch);
  return `<header class="topbar">
    <div class="wordmark" aria-label="GRID CRIMES by LAB">
      <div class="wordmark-type"><span>GRID</span><span>CRIMES</span></div>
      <div class="wordmark-slash" aria-hidden="true">/</div>
      <div class="wordmark-sub">LAB/<br/>INSTRUMENT<br/>v${escapeHtml(state?.version ?? "0.1.0")}</div>
    </div>
    <div class="topbar-tools">
      ${hasBatch ? `<button type="button" class="icon-button" data-action="header-results" aria-label="Show results">4/</button>` : ""}
      <button type="button" class="icon-button" data-action="help" aria-label="Help and limitations">?</button>
    </div>
  </header>`;
}

function renderTabs(): string {
  return `<div class="view-tabs" role="tablist" aria-label="Workspace">
    <button type="button" role="tab" class="view-tab" aria-selected="${
      view === "configure" ? "true" : "false"
    }" data-action="view-configure">Configure</button>
    <button type="button" role="tab" class="view-tab" aria-selected="${
      view === "results" ? "true" : "false"
    }" data-action="view-results">Results / ${state?.batch?.variations.length ?? 0}</button>
  </div>`;
}

function renderConfigure(): string {
  return `${localError ? renderError(localError) : ""}
    <section class="panel">
      <div class="section-head"><h2>Selection</h2><span class="section-index">01 / SOURCE</span></div>
      ${renderSelection()}
    </section>
    <section class="panel" style="padding-bottom:18px">
      <div class="section-head"><h2>Art direction</h2><span class="section-index">02 / SIX SYSTEMS</span></div>
      ${renderPresetGrid()}
    </section>
    <section class="panel">
      <div class="section-head">
        <h2>Mutation</h2>
        <span class="section-index">03 / CONTROLS</span>
      </div>
      ${renderSliders()}
      <button type="button" class="text-button" data-action="reset-defaults" style="margin-top:10px">Reset to preset defaults</button>
      ${renderAdvanced()}
    </section>
    ${renderGenerate()}`;
}

function renderSelection(): string {
  const selection = state?.selection;
  const generated = state?.selectedGenerated ?? [];
  if (!selection && generated.length === 2) {
    return `<div class="selection-card">
      <h3 class="selection-title">Two variations selected.</h3>
      <div class="selection-meta">
        <span>${escapeHtml(generated[0].presetName)} × ${escapeHtml(
          generated[1].presetName,
        )}</span>
        <span>Generated frames</span>
      </div>
      <p class="role-summary">Crossbreed their grammars, spacing and hierarchy into a new family. Nothing is uploaded or overwritten.</p>
      <button type="button" class="action-button primary" data-action="open-crossbreed" style="width:100%;margin-top:12px">Crossbreed these two ↗</button>
    </div>`;
  }
  if (!selection) {
    return `<div class="empty-selection">
      <div class="empty-glyph" aria-hidden="true"></div>
      <div>
        <h3>Nothing on trial.</h3>
        <p>${escapeHtml(
          state?.selectionProblem ??
            "Select a frame, group, or a few sibling layers with 2–30 meaningful elements.",
        )}</p>
        <button type="button" class="action-button primary" data-action="try-sample">Try with sample</button>
      </div>
    </div>`;
  }
  const primary = primaryBlocks(selection, 6);
  const warnings = [
    ...selection.warnings,
    ...(selection.roleCounts.headline === 0
      ? ["No clear headline was detected. Promote a text layer below."]
      : []),
  ];
  return `<div class="selection-card">
    <h3 class="selection-title">${escapeHtml(selection.name)}</h3>
    <div class="selection-meta">
      <span>${selection.blocks.length} elements detected</span>
      <span>${Math.round(selection.width)} × ${Math.round(selection.height)}</span>
      <span>${escapeHtml(selection.selectionKind)}</span>
    </div>
    <p class="role-summary">${escapeHtml(describeRoles(selection))}.</p>
    <div class="chip-row">
      ${(["headline", "visual", "body", "action", "label"] as const)
        .filter((role) => selection.roleCounts[role])
        .map(
          (role) =>
            `<span class="chip"><b>${selection.roleCounts[role]}</b> ${role}</span>`,
        )
        .join("")}
    </div>
    ${
      warnings.length
        ? `<div class="warnings" role="status">${warnings
            .slice(0, 3)
            .map((warning) => `<p>${escapeHtml(warning)}</p>`)
            .join("")}</div>`
        : ""
    }
    <details class="role-editor" ${selection.roleCounts.headline === 0 ? "open" : ""}>
      <summary>Correct the roles</summary>
      ${primary
        .map(
          (block) => `<div class="role-row">
            <label for="role-${escapeHtml(block.id)}" title="${escapeHtml(block.name)}">${escapeHtml(
              block.name,
            )}</label>
            <select id="role-${escapeHtml(block.id)}" data-action="role" data-id="${escapeHtml(
              block.id,
            )}" aria-label="Role for ${escapeHtml(block.name)}">
              ${ROLES.map(
                (role) =>
                  `<option value="${role}" ${role === block.role ? "selected" : ""}>${role}</option>`,
              ).join("")}
            </select>
          </div>`,
        )
        .join("")}
      <p class="advanced-note">Heuristics are conservative. Correcting a role changes how it is scaled and placed; it does not edit the source.</p>
    </details>
    <div class="selection-actions">
      <button type="button" class="text-button" data-action="refresh-selection">Re-read selection</button>
      <button type="button" class="text-button" data-action="try-sample">New sample</button>
    </div>
  </div>`;
}

function renderPresetGrid(): string {
  return `<div class="preset-grid" role="group" aria-label="Art direction">
    ${PRESET_LIST.map(
      (preset) => `<button type="button" class="preset" data-action="preset" data-preset="${
        preset.id
      }" aria-pressed="${settings.preset === preset.id}" aria-label="${escapeHtml(
        `${preset.name}: ${preset.philosophy}`,
      )}">
        <span class="preset-art">${presetArt(preset.id)}</span>
        <span class="preset-caption">
          <span class="preset-index">${preset.index}/</span><span class="preset-name">${escapeHtml(
            preset.name,
          )}</span>
          <span class="preset-note">${escapeHtml(preset.philosophy)}</span>
        </span>
      </button>`,
    ).join("")}
  </div>`;
}

function renderSliders(): string {
  return SLIDERS.map(
    (slider) => `<label class="slider">
      <span class="slider-head">
        <span class="slider-name">${slider.label}</span>
        <output class="slider-value" for="slider-${slider.key}">${settings[slider.key]}</output>
      </span>
      <span class="slider-note">${slider.note}</span>
      <input id="slider-${slider.key}" type="range" min="0" max="100" step="1" value="${
        settings[slider.key]
      }" data-slider="${slider.key}" aria-label="${slider.label}" />
    </label>`,
  ).join("");
}

function renderAdvanced(): string {
  return `<details class="advanced" ${advancedOpen ? "open" : ""} data-details="advanced">
    <summary>Seed and advanced options</summary>
    <div class="advanced-body">
      <div class="field-grid">
        <label class="field">
          <span>Seed</span>
          <span class="seed-field">
            <input id="seed-input" type="number" min="1" max="9999999" value="${settings.seed}" data-seed aria-label="Seed" />
            <button type="button" data-action="shuffle-seed">Shuffle</button>
          </span>
        </label>
        <label class="field">
          <span>Output ratio</span>
          <select data-setting="outputSize" aria-label="Output size">
            ${Object.entries(OUTPUT_SIZE_LABELS)
              .map(
                ([value, label]) =>
                  `<option value="${value}" ${
                    settings.outputSize === value ? "selected" : ""
                  }>${escapeHtml(label)}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>
      <div class="toggle-list">
        <label class="toggle-row">
          <span>Preserve existing colors</span>
          <input type="checkbox" data-toggle="preserveColors" ${
            settings.preserveColors ? "checked" : ""
          } />
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
        <label class="toggle-row">
          <span>Preserve typography style</span>
          <input type="checkbox" data-toggle="preserveTypography" ${
            settings.preserveTypography ? "checked" : ""
          } />
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
        <label class="toggle-row">
          <span>Allow deliberate overlap</span>
          <input type="checkbox" data-toggle="allowOverlap" ${
            settings.allowOverlap ? "checked" : ""
          } />
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
      </div>
      <p class="advanced-note">Preserve typography keeps the typeface, weight, casing and tracking. Scale still adapts to the new composition. Missing fonts are never substituted.</p>
    </div>
  </details>`;
}

function renderGenerate(): string {
  const disabled = busy || !state?.selection;
  return `<div class="generate-panel">
    <button type="button" class="generate-button" data-action="generate" ${
      disabled ? "disabled" : ""
    }>
      <span>${busy ? "Generating…" : "Generate 4 variations"}</span>
      <span class="arrow" aria-hidden="true">${busy ? "◌" : "↗"}</span>
    </button>
    ${
      busy
        ? renderProgress()
        : `<p class="advanced-note" style="display:flex;justify-content:space-between;gap:8px;margin-top:9px">
            <span>Source stays untouched.</span><span>Native, editable layers.</span>
          </p>`
    }
  </div>`;
}

function renderProgress(): string {
  return `<div class="progress-wrap">
    <div class="progress-meta">
      <span>${escapeHtml(progress?.message ?? "Working")}</span>
      <span>${Math.round(progress?.percent ?? 0)}%</span>
    </div>
    <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(
      progress?.percent ?? 0,
    )}">
      <div class="progress-fill" style="width:${Math.round(progress?.percent ?? 0)}%"></div>
    </div>
  </div>`;
}

function renderError(message: string): string {
  return `<div class="error-box" role="alert">
    <strong>Generation stopped safely</strong>
    <p>${escapeHtml(message)}</p>
    <button type="button" class="text-button" data-action="dismiss-error" style="margin-top:7px">Dismiss</button>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Results                                                            */
/* ------------------------------------------------------------------ */

function renderResults(): string {
  const batch = state?.batch;
  if (!batch) {
    return `<div class="empty-batch">
      <h2>No batch yet.</h2>
      <p>Select a composition, choose a direction, and generate four editable variations.</p>
      <button type="button" class="action-button primary" data-action="view-configure">Configure a batch</button>
    </div>`;
  }
  const selected = selectedVariation ?? batch.variations[0]?.id ?? null;
  return `${renderBatchStrip(batch)}
    ${localError ? renderError(localError) : ""}
    <div class="results-grid">
      ${batch.variations
        .map((variation, index) => renderVariationCard(variation, index, selected))
        .join("")}
    </div>
    ${
      noticeList.length
        ? `<details class="advanced" style="margin:6px 18px 0">
            <summary>${noticeList.length} production note${noticeList.length === 1 ? "" : "s"}</summary>
            <div class="warnings" style="border-left-color:var(--line)">${noticeList
              .map((note) => `<p>${escapeHtml(note)}</p>`)
              .join("")}</div>
          </details>`
        : ""
    }
    <div class="result-actions">
      <button type="button" class="action-button primary" data-action="generate-again" ${
        busy || !state?.selection ? "disabled" : ""
      }>Generate another 4</button>
      <button type="button" class="action-button" data-action="open-crossbreed" ${
        busy || batch.variations.length < 2 ? "disabled" : ""
      }>Crossbreed ↗</button>
      <button type="button" class="action-button ghost" data-action="focus-source" ${
        !state?.selection ? "disabled" : ""
      }>View original</button>
      <button type="button" class="action-button danger" data-action="remove-batch">Remove batch</button>
    </div>`;
}

function renderBatchStrip(batch: BatchInfo): string {
  const first = batch.variations[0];
  return `<div class="batch-strip">
    <div class="batch-thumb">
      ${
        batch.sourceThumbnail
          ? `<img src="${batch.sourceThumbnail}" alt="Original source composition" />`
          : `<span>SOURCE<br/>NO PREVIEW</span>`
      }
    </div>
    <div class="batch-copy">
      <h2>${escapeHtml(batch.sourceName)}</h2>
      <p>${escapeHtml(PRESETS[batch.preset]?.name ?? batch.preset)} · SEED ${batch.settings.seed} · ${batch.variations.length} VARIATIONS</p>
      <p>CHAOS ${batch.settings.chaos} · DENSITY ${batch.settings.density} · HIERARCHY ${batch.settings.hierarchy}</p>
      <p>${first ? `Score ${first.score.toFixed(1)} · ${escapeHtml(first.grammarName)}` : "Awaiting frames"}</p>
    </div>
  </div>`;
}

function renderVariationCard(
  variation: BatchVariation,
  index: number,
  selected: string | null,
): string {
  const thumb = thumbnailFor(variation);
  return `<article class="variation-card" style="--i:${index}" data-selected="${
    selected === variation.id
  }" data-variation="${escapeHtml(variation.id)}">
    <div class="variation-thumb">
      ${
        thumb
          ? `<img src="${thumb}" alt="Generated ${escapeHtml(
              variation.presetName,
            )} variation ${index + 1}" loading="eager" />`
          : `<div class="thumb-skeleton"><span>RENDERING PREVIEW</span></div>`
      }
      <span class="score-stamp">${Math.round(variation.score)} PTS</span>
      ${variation.kept ? `<span class="kept-stamp">KEPT</span>` : ""}
    </div>
    <div class="variation-body">
      <div class="variation-index">
        <strong>${String(index + 1).padStart(2, "0")} / ${escapeHtml(
          variation.presetName,
        )}</strong>
        <span>${variation.seed}</span>
      </div>
      <p class="variation-grammar">${escapeHtml(variation.grammarName)}${
        variation.locked ? " · locked" : ""
      }</p>
      <div class="card-actions">
        <button type="button" class="card-action" data-action="focus-variation" data-id="${escapeHtml(
          variation.id,
        )}">View</button>
        <button type="button" class="card-action" data-parent="A" data-action="parent" data-id="${escapeHtml(
          variation.id,
        )}" aria-pressed="${parentA === variation.id}" aria-label="Use variation ${
          index + 1
        } as parent A">A</button>
        <button type="button" class="card-action" data-parent="B" data-action="parent" data-id="${escapeHtml(
          variation.id,
        )}" aria-pressed="${parentB === variation.id}" aria-label="Use variation ${
          index + 1
        } as parent B">B</button>
        <button type="button" class="card-action" data-action="regenerate" data-id="${escapeHtml(
          variation.id,
        )}" ${variation.locked || busy ? "disabled" : ""}>Regen</button>
        <button type="button" class="card-action" data-action="lock" data-id="${escapeHtml(
          variation.id,
        )}" aria-pressed="${variation.locked}" ${
          busy ? "disabled" : ""
        }>${variation.locked ? "Unlock" : "Keep"}</button>
      </div>
    </div>
  </article>`;
}

/* ------------------------------------------------------------------ */
/* Crossbreed                                                          */
/* ------------------------------------------------------------------ */

function dnaFor(variation: BatchVariation): DesignDNA {
  if (variation.dna) return variation.dna;
  const preset = PRESETS[variation.preset as PresetId] ?? PRESETS.brutalist;
  return {
    margin: preset.id === "minimal" ? 0.13 : 0.06,
    columns: preset.id === "swiss" ? 12 : 7,
    gutter: 0.016,
    asymmetry: preset.id === "minimal" ? -0.18 : 0.35,
    rotation: preset.id === "chaos" ? 10 : 3,
    scaleContrast: preset.defaults.hierarchy / 100,
    decorative: preset.defaults.density / 100,
    occupancy: preset.defaults.density / 100,
    alignment: preset.id === "antigrid" ? "broken" : preset.id === "minimal" ? "mixed" : "left",
    split: 0.5,
    backgroundMode: preset.id === "chaos" ? "ink" : "paper",
    colorStrategy: preset.id === "maximal" ? "layered" : "restrained",
  };
}

function mixValue(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function renderCrossbreed(): string {
  const variations = currentVariations();
  if (variations.length < 2) {
    return `<div class="empty-batch">
      <h2>Two parents required.</h2>
      <p>Generate a batch first, then choose two directions to cross.</p>
      <button type="button" class="action-button primary" data-action="view-configure">Configure a batch</button>
    </div>`;
  }
  if (!variationById(parentA) || !variationById(parentB)) {
    parentA = variations[0].id;
    parentB = variations[1].id;
  }
  const a = variationById(parentA)!;
  const b = variationById(parentB)!;
  const dnaA = dnaFor(a);
  const dnaB = dnaFor(b);
  const t = inheritance / 100;
  const dnaRows: Array<[string, number]> = [
    ["BREATH", mixValue(dnaA.margin / 0.25, dnaB.margin / 0.25, t) * 100],
    ["GRID", mixValue(dnaA.columns / 12, dnaB.columns / 12, t) * 100],
    ["SCALE", mixValue(dnaA.scaleContrast, dnaB.scaleContrast, t) * 100],
    ["DECOR", mixValue(dnaA.decorative, dnaB.decorative, t) * 100],
    ["OFFSET", mixValue((dnaA.asymmetry + 1) / 2, (dnaB.asymmetry + 1) / 2, t) * 100],
  ];
  return `<div class="crossbreed-hero">
    <h1>Cross<span>breed</span><br/>the DNA.</h1>
    <p>Two directions enter. Their grammars, spacing, scale and asymmetry combine into a new family — generated fresh, then scored like any other composition.</p>
  </div>
  <div class="parent-pair">
    ${renderParentCard("A", a)}
    <div class="mix-glyph" aria-hidden="true">×</div>
    ${renderParentCard("B", b)}
  </div>
  <div class="inheritance">
    <div class="inheritance-head">
      <strong>${inheritance <= 39 ? "Lean A" : inheritance >= 61 ? "Lean B" : "Equal inheritance"}</strong>
      <output>${inheritance}%</output>
    </div>
    <input id="inheritance" type="range" min="0" max="100" step="1" value="${inheritance}" aria-label="Inheritance from parent A to parent B" style="--fill:${inheritance}%" />
    <div class="mix-labels">
      <span>${escapeHtml(a.presetName)} 0</span>
      <span>100 ${escapeHtml(b.presetName)}</span>
    </div>
  </div>
  <div class="dna-panel">
    <div class="dna-title"><span>Inherited design parameters</span><span>A → B</span></div>
    ${dnaRows
      .map(
        ([label, value]) => `<div class="dna-row">
          <span>${label}</span>
          <span class="dna-track" aria-hidden="true"><b style="--v:${Math.max(
            2,
            Math.min(100, value),
          )}%"></b></span>
          <output>${Math.round(value)}</output>
        </div>`,
      )
      .join("")}
  </div>
  <div class="crossbreed-actions">
    <button type="button" class="crossbreed-button" data-action="generate-offspring" ${
      busy || a.id === b.id ? "disabled" : ""
    }>
      <span>Generate offspring</span><span aria-hidden="true">↗</span>
    </button>
    <p class="crossbreed-note">${escapeHtml(
      a.presetName,
    )} × ${escapeHtml(b.presetName)}. Continuous values interpolate; grammars inherit by direction, not by averaging coordinates.</p>
    <button type="button" class="action-button ghost" style="width:100%;margin-top:8px" data-action="view-results">Back to results</button>
  </div>`;
}

function renderParentCard(slot: "A" | "B", variation: BatchVariation): string {
  const thumb = thumbnailFor(variation);
  return `<div class="parent-card" data-parent="${slot}">
    <div class="parent-thumb">
      ${
        thumb
          ? `<img src="${thumb}" alt="${slot === "A" ? "Parent A" : "Parent B"}: ${escapeHtml(
              variation.presetName,
            )}" />`
          : `<div class="thumb-skeleton"><span>${slot} / SELECTED</span></div>`
      }
    </div>
    <div class="parent-copy">
      <div class="parent-label"><span>Parent ${slot}</span><b>${slot}</b></div>
      <p class="parent-preset">${escapeHtml(variation.presetName)}</p>
      <div class="parent-meta">${escapeHtml(variation.grammarName)}<br/>SEED ${variation.seed} · ${Math.round(
        variation.score,
      )} PTS</div>
      <select class="small" data-parent-select="${slot}" aria-label="Choose parent ${slot}">
        ${currentVariations()
          .map(
            (candidate, index) =>
              `<option value="${escapeHtml(candidate.id)}" ${
                candidate.id === variation.id ? "selected" : ""
              }>${String(index + 1).padStart(2, "0")} / ${escapeHtml(candidate.presetName)}</option>`,
          )
          .join("")}
      </select>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Events                                                             */
/* ------------------------------------------------------------------ */

function requestGenerate(again: boolean): void {
  if (busy || !state?.selection) return;
  if (again) nextSeed();
  settings = sanitizeSettings(settings);
  busy = true;
  localError = null;
  progress = { operation: "generate", phase: "analyze", message: "Reading the composition", percent: 4 };
  render();
  post(again ? "generate-again" : "generate", {
    settings,
    roleOverrides: roleOverrides(),
  });
}

function openHelp(): void {
  openModal(`<h2>Field notes.</h2>
    <p class="modal-sub">GRID CRIMES/ v${escapeHtml(state?.version ?? "0.1.0")} · development build</p>
    <p>An instrument for breaking visual conventions without breaking the content. It reads the roles in your selection, writes a layout plan, scores it, then builds native Figma layers.</p>
    <ul class="help-list">
      <li><strong>What it changes</strong>Scale, spacing, alignment, colour treatment, rotation, hierarchy and composition structure.</li>
      <li><strong>What it keeps</strong>Text content and formatting, image fills and crops, instances, vectors, effects and the original composition.</li>
      <li><strong>One undo</strong>The source is never edited. Generated frames can be removed as a batch or undone with Figma's normal undo.</li>
      <li><strong>Limits</strong>2–30 meaningful elements works best. Larger selections use an editorial index grid. Missing fonts preserve their original formatting. Instance children are treated as atomic modules.</li>
      <li><strong>Privacy</strong>No network access, no uploads, no analytics. Seeds and generation metadata are stored locally in the Figma document.</li>
    </ul>
    <p class="legal">This is an unpublished development build. It is not affiliated with Figma. Fonts: Gulax (Velvetyne) and Apfel Grotezk (Collletttivo), SIL OFL.</p>
    <div class="modal-actions"><button type="button" data-modal-close>Close</button></div>`);
}

function openRemoveModal(): void {
  const batch = state?.batch;
  if (!batch) return;
  openModal(`<h2>Remove batch?</h2>
    <p class="modal-sub">${escapeHtml(batch.sourceName)} · ${batch.variations.length} variations</p>
    <p>This removes the generated frames and batch label created by GRID CRIMES/. The original source is not touched. Any layers you added to the batch container are left in place.</p>
    <div class="modal-actions">
      <button type="button" data-modal-close>Keep batch</button>
      <button type="button" class="danger" data-modal-confirm="remove-batch">Remove 4 frames</button>
    </div>`);
}

function openModal(content: string): void {
  modalOpen = true;
  lastFocused = document.activeElement as HTMLElement | null;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-backdrop>
    <div class="modal" role="dialog" aria-modal="true" aria-label="GRID CRIMES dialog">
      ${content}
    </div>
  </div>`;
  modalRoot.querySelector<HTMLButtonElement>("button")?.focus();
}

function closeModal(): void {
  modalOpen = false;
  modalRoot.innerHTML = "";
  lastFocused?.focus();
}

function bindGlobalEvents(): void {
  app.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    switch (action) {
      case "preset":
        if (target.dataset.preset) setPreset(target.dataset.preset as PresetId);
        break;
      case "reset-defaults": {
        const defaults = presetDefaults(settings.preset);
        settings = { ...settings, ...defaults };
        render();
        break;
      }
      case "shuffle-seed":
        settings.seed = Math.floor(Math.random() * 9_999_999) + 1;
        render();
        break;
      case "generate":
        requestGenerate(false);
        break;
      case "generate-again":
        requestGenerate(true);
        break;
      case "try-sample":
        busy = true;
        localError = null;
        progress = { operation: "sample", phase: "sample", message: "Creating editable sample layers", percent: 20 };
        render();
        post("try-sample");
        break;
      case "refresh-selection":
        post("request-selection");
        break;
      case "view-configure":
        view = "configure";
        render();
        break;
      case "view-results":
        view = "results";
        render();
        break;
      case "header-results":
        view = "results";
        render();
        break;
      case "focus-variation": {
        if (target.dataset.id) {
          selectedVariation = target.dataset.id;
          post("focus-variation", { variationId: target.dataset.id });
          render();
        }
        break;
      }
      case "focus-source":
        post("focus-source");
        break;
      case "parent": {
        const id = target.dataset.id;
        if (!id) break;
        const slot = target.dataset.parent;
        if (slot === "A") {
          parentA = parentA === id ? null : id;
          if (parentB === parentA) parentB = null;
        } else {
          parentB = parentB === id ? null : id;
          if (parentA === parentB) parentA = null;
        }
        render();
        break;
      }
      case "open-crossbreed":
        if (!parentA || !parentB) {
          const variations = currentVariations();
          parentA = parentA ?? variations[0]?.id ?? null;
          parentB = parentB ?? variations[1]?.id ?? null;
        }
        view = "crossbreed";
        render();
        break;
      case "generate-offspring": {
        if (!parentA || !parentB) break;
        busy = true;
        localError = null;
        progress = { operation: "crossbreed", phase: "crossbreed", message: "Mixing design DNAs", percent: 8 };
        render();
        post("crossbreed", {
          parentA,
          parentB,
          inheritance,
          settings,
          roleOverrides: roleOverrides(),
        });
        break;
      }
      case "regenerate": {
        if (target.dataset.id) {
          busy = true;
          progress = { operation: "regenerate", phase: "plan", message: "Re-planning variation", percent: 15 };
          localError = null;
          render();
          post("regenerate", {
            variationId: target.dataset.id,
            settings,
            roleOverrides: roleOverrides(),
          });
        }
        break;
      }
      case "lock": {
        const variation = variationById(target.dataset.id ?? null);
        if (variation) {
          post("toggle-lock", {
            variationId: variation.id,
            locked: !variation.locked,
          });
        }
        break;
      }
      case "remove-batch":
        openRemoveModal();
        break;
      case "help":
        openHelp();
        break;
      case "dismiss-error":
        localError = null;
        render();
        break;
      default:
        break;
    }
  });

  app.addEventListener("input", (event) => {
    const input = event.target as HTMLInputElement;
    if (input.dataset.slider) {
      const key = input.dataset.slider as "chaos" | "density" | "hierarchy";
      settings[key] = Number(input.value);
      const output = input.closest(".slider")?.querySelector("output");
      if (output) output.textContent = input.value;
      updateFill(input);
    }
    if (input.id === "inheritance") {
      inheritance = Number(input.value);
      updateFill(input);
      const head = document.querySelector<HTMLElement>(".inheritance-head");
      if (head) {
        const strong = head.querySelector("strong");
        const output = head.querySelector("output");
        if (strong) {
          strong.textContent =
            inheritance <= 39 ? "Lean A" : inheritance >= 61 ? "Lean B" : "Equal inheritance";
        }
        if (output) output.textContent = `${inheritance}%`;
      }
      document.querySelectorAll<HTMLElement>(".dna-row").forEach((row, index) => {
        const a = variationById(parentA);
        const b = variationById(parentB);
        if (!a || !b) return;
        const dnaA = dnaFor(a);
        const dnaB = dnaFor(b);
        const t = inheritance / 100;
        const values = [
          (mixValue(dnaA.margin / 0.25, dnaB.margin / 0.25, t) * 100),
          (mixValue(dnaA.columns / 12, dnaB.columns / 12, t) * 100),
          (mixValue(dnaA.scaleContrast, dnaB.scaleContrast, t) * 100),
          (mixValue(dnaA.decorative, dnaB.decorative, t) * 100),
          (mixValue((dnaA.asymmetry + 1) / 2, (dnaB.asymmetry + 1) / 2, t) * 100),
        ];
        const value = values[index];
        if (value === undefined) return;
        const bar = row.querySelector<HTMLElement>(".dna-track b");
        const out = row.querySelector("output");
        if (bar) bar.style.setProperty("--v", `${Math.max(2, Math.min(100, value))}%`);
        if (out) out.textContent = String(Math.round(value));
      });
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (target instanceof HTMLSelectElement) {
      if (target.dataset.action === "role" && target.dataset.id) {
        const selection = state?.selection;
        if (!selection) return;
        const role = target.value as Role;
        state = {
          ...state!,
          selection: {
            ...selection,
            blocks: selection.blocks.map((block) =>
              block.id === target.dataset.id ? { ...block, role } : block,
            ),
          },
        };
        post("set-role", { id: target.dataset.id, role });
      }
      if (target.dataset.setting === "outputSize") {
        settings.outputSize = target.value as MutationSettings["outputSize"];
      }
      if (target.dataset.parentSelect) {
        const slot = target.dataset.parentSelect;
        if (slot === "A") {
          parentA = target.value;
          if (parentB === parentA) parentB = null;
        } else {
          parentB = target.value;
          if (parentA === parentB) parentA = null;
        }
        render();
      }
    }
    if (target instanceof HTMLInputElement) {
      if (target.dataset.toggle) {
        const key = target.dataset.toggle as
          | "preserveColors"
          | "preserveTypography"
          | "allowOverlap";
        settings[key] = target.checked;
      }
      if (target.hasAttribute("data-seed")) {
        settings.seed = Math.max(1, Math.min(9_999_999, Number(target.value) || 1));
        target.value = String(settings.seed);
      }
    }
  });

  app.addEventListener(
    "toggle",
    (event) => {
      const details = event.target as HTMLDetailsElement;
      if (details.dataset.details === "advanced") advancedOpen = details.open;
    },
    true,
  );

  app.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains("preset")) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const tiles = [...document.querySelectorAll<HTMLButtonElement>(".preset")];
    const index = tiles.indexOf(target as HTMLButtonElement);
    const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const next = tiles[(index + step + tiles.length) % tiles.length];
    next?.focus();
  });

  modalRoot.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-modal-backdrop]") && !target.closest(".modal")) {
      closeModal();
      return;
    }
    if (target.closest("[data-modal-close]")) {
      closeModal();
      return;
    }
    const confirm = target.closest<HTMLElement>("[data-modal-confirm]")?.dataset.modalConfirm;
    if (confirm === "remove-batch" && state?.batch) {
      closeModal();
      busy = true;
      render();
      post("remove-batch", { batchId: state.batch.id });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalOpen) {
      closeModal();
      return;
    }
    if (event.key === "Tab" && modalOpen) {
      const focusable = [
        ...modalRoot.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* ------------------------------------------------------------------ */
/* Message protocol                                                   */
/* ------------------------------------------------------------------ */

function applyThumbnails(batchId: string, thumbs: Record<string, string>): void {
  if (state?.batch?.id !== batchId) return;
  for (const [id, url] of Object.entries(thumbs)) {
    mysteryThumbnails.set(id, url);
    const variation = state.batch.variations.find((entry) => entry.id === id);
    if (variation) variation.thumbnail = url;
  }
  if (view === "results" || view === "crossbreed") render();
}

function handleMessage(type: string, payload: unknown): void {
  switch (type) {
    case "state": {
      const next = payload as MainState;
      const batchChanged =
        next.batch?.id !== lastBatchId && Boolean(next.batch);
      state = next;
      busy = next.pending;
      if (!next.pending) clearOperationProgress();
      if (next.selectedThumbnails) {
        for (const [id, url] of Object.entries(next.selectedThumbnails)) {
          mysteryThumbnails.set(id, url);
        }
      }
      if (next.batch) {
        lastBatchId = next.batch.id;
        for (const variation of next.batch.variations) {
          if (variation.thumbnail) mysteryThumbnails.set(variation.id, variation.thumbnail);
        }
        if (firstState || batchChanged) {
          settings = sanitizeSettings(next.batch.settings);
          selectedVariation = next.batch.variations[0]?.id ?? null;
          if (view !== "crossbreed") view = "results";
        }
      } else {
        lastBatchId = null;
        if (view === "results" || view === "crossbreed") view = "configure";
      }
      if (firstState && next.lastSettings && !next.batch) {
        settings = sanitizeSettings(next.lastSettings);
      }
      if (next.selectedGenerated.length === 2) {
        const ids = next.selectedGenerated.map((entry) => entry.variationId);
        if (!parentA || !ids.includes(parentA)) parentA = ids[0];
        if (!parentB || !ids.includes(parentB)) parentB = ids[1];
      }
      const valid = currentVariations().map((entry) => entry.id);
      if (parentA && !valid.includes(parentA)) parentA = null;
      if (parentB && !valid.includes(parentB)) parentB = null;
      firstState = false;
      render();
      break;
    }
    case "progress": {
      progress = payload as Progress;
      busy = true;
      if (view === "configure") {
        const fill = document.querySelector<HTMLElement>(".progress-fill");
        const meta = document.querySelector<HTMLElement>(".progress-meta");
        if (fill && meta) {
          fill.style.width = `${Math.round(progress.percent)}%`;
          const spans = meta.querySelectorAll("span");
          if (spans[0]) spans[0].textContent = progress.message;
          if (spans[1]) spans[1].textContent = `${Math.round(progress.percent)}%`;
        } else {
          render();
        }
      } else {
        renderProgressOverlay();
      }
      break;
    }
    case "generated":
    case "crossbred": {
      const data = payload as { batch: BatchInfo; warnings: string[] };
      state = {
        ...(state ?? {
          selection: null,
          selectionProblem: null,
          batch: null,
          canCrossbreed: false,
          selectedGenerated: [],
          lastSettings: null,
          version: "0.1.0",
          pending: false,
        }),
        batch: data.batch,
        lastSettings: data.batch.settings,
      };
      lastBatchId = data.batch.id;
      settings = sanitizeSettings(data.batch.settings);
      noticeList = data.warnings ?? [];
      selectedVariation = data.batch.variations[0]?.id ?? null;
      for (const variation of data.batch.variations) {
        if (variation.thumbnail) mysteryThumbnails.set(variation.id, variation.thumbnail);
      }
      const variations = currentVariations();
      parentA = variations[0]?.id ?? null;
      parentB = variations[1]?.id ?? null;
      view = "results";
      busy = false;
      progress = null;
      localError = null;
      clearOperationProgress();
      render();
      pushToast(
        "ok",
        type === "crossbred"
          ? "Offspring generated. The source and parents are untouched."
          : "Four variations generated as editable Figma layers.",
      );
      break;
    }
    case "regenerated": {
      const data = payload as { batch: BatchInfo | null; warnings: string[] };
      if (data.batch) {
        state = { ...state!, batch: data.batch };
        noticeList = data.warnings ?? [];
        for (const variation of data.batch.variations) {
          if (variation.thumbnail) mysteryThumbnails.set(variation.id, variation.thumbnail);
        }
      }
      busy = false;
      progress = null;
      view = "results";
      clearOperationProgress();
      render();
      pushToast("ok", "Variation regenerated in place. The previous frame was replaced safely.");
      break;
    }
    case "batch-updated": {
      const data = payload as { batch: BatchInfo };
      if (state) state = { ...state, batch: data.batch };
      render();
      break;
    }
    case "thumbnails": {
      const data = payload as { batchId: string; thumbs: Record<string, string> };
      applyThumbnails(data.batchId, data.thumbs);
      break;
    }
    case "toast": {
      const data = payload as { tone: string; message: string };
      pushToast(data.tone, data.message);
      break;
    }
    case "error": {
      const data = payload as { operation: string; message: string };
      busy = false;
      progress = null;
      localError = data.message;
      clearOperationProgress();
      if (view === "results" || view === "crossbreed") {
        pushToast("error", data.message);
        render();
      } else {
        render();
      }
      break;
    }
    case "focus-done":
      break;
    case "selection-problem": {
      pushToast("warn", (payload as { message: string }).message);
      break;
    }
    default:
      break;
  }
}

function renderProgressOverlay(): void {
  if (!(view === "results" || view === "crossbreed") || !busy || !progress) {
    clearOperationProgress();
    return;
  }
  if (!operationToast) {
    operationToast = document.createElement("div");
    operationToast.id = "operation-progress";
    operationToast.className = "operation-progress";
    operationToast.setAttribute("role", "status");
    document.body.appendChild(operationToast);
  }
  operationToast.innerHTML = `<div class="operation-copy"><span>${escapeHtml(
    progress.message,
  )}</span><b>${Math.round(progress.percent)}%</b></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(
    progress.percent,
  )}"><div class="progress-fill" style="width:${Math.round(
    progress.percent,
  )}%"></div></div>`;
}

function clearOperationProgress(): void {
  operationToast?.remove();
  operationToast = null;
}

window.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || message.pluginMessage) return;
  if (message.type) handleMessage(message.type, message.payload);
});

/* ------------------------------------------------------------------ */
/* Boot                                                              */
/* ------------------------------------------------------------------ */

function detectHostTheme(): void {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--figma-color-bg")
    .trim();
  if (!raw) return;
  let r = 255;
  let g = 255;
  let b = 255;
  const hex = raw.match(/^#([0-9a-f]{6})$/i);
  const rgb = raw.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (hex) {
    r = parseInt(hex[1].slice(0, 2), 16);
    g = parseInt(hex[1].slice(2, 4), 16);
    b = parseInt(hex[1].slice(4, 6), 16);
  } else if (rgb) {
    r = Number(rgb[1]);
    g = Number(rgb[2]);
    b = Number(rgb[3]);
  } else {
    return;
  }
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  document.documentElement.dataset.figmaTheme =
    luminance < 0.48 ? "dark" : "light";
}

detectHostTheme();
window.setTimeout(detectHostTheme, 250);
bindGlobalEvents();
app.innerHTML = `<div class="boot"><div><div class="boot-mark">GRID<br/><span>CRIMES</span><br/>/</div><p>Opening the instrument</p></div></div>`;
post("ready", { width: window.innerWidth, height: window.innerHeight });
