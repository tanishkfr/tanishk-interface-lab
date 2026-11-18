import type {
  BatchInfo,
  BatchVariation,
  CompositionSnapshot,
  CrossbreedMeta,
  CrossbreedParent,
  GridCrimesMeta,
  LayoutPlan,
  MutationSettings,
  UIRequest,
} from "../shared/types.ts";
import { BATCH_KEY, GENERATOR_VERSION, META_KEY } from "../shared/types.ts";
import { DEFAULT_SETTINGS, PRESETS } from "../shared/presets.ts";
import {
  applyRoleOverrides,
  emptyRoleCounts,
  sanitizeSettings,
} from "../shared/settings.ts";
import { decodeMeta, encodeMeta } from "../shared/meta.ts";
import { parseUIRequest } from "../shared/protocol.ts";
import { generatePlans } from "../engine/planner.ts";
import {
  canCrossbreed,
  crossbreedName,
  crossbreedPlans,
  inheritanceLabel,
} from "../engine/crossbreed/crossbreed.ts";
import {
  analyzeSelection,
  createSampleComposition,
  snapshotFromGeneratedFrame,
} from "./analysis.ts";
import {
  buildVariationFrame,
  loadFonts,
  missingSourceIds,
  refreshMetaOnFrame,
} from "./builder.ts";
import {
  batchDimensions,
  batchFrameName,
  chooseBatchPlacement,
  framePosition,
  newBatchId,
  variationFrameName,
} from "./placement.ts";

const LAST_BATCH_KEY = "gc.lastBatch";
const BATCH_COUNTER_KEY = "gc.batchCounter";
const SETTINGS_KEY = "gc.settings";

interface StoredBatchRef {
  batchId: string;
  containerId: string;
  pageId: string;
  createdAt: number;
}

let currentSnapshot: CompositionSnapshot | null = null;
let selectionProblem: string | null = null;
let currentBatch: BatchInfo | null = null;
let selectedGenerated: GridCrimesMeta[] = [];
let selectedThumbnails: Record<string, string> = {};
const selectedThumbCache = new Map<string, string>();
let lastSettings: MutationSettings | null = null;
let busy = false;
let analysisToken = 0;
let selectionTimer: ReturnType<typeof setTimeout> | null = null;
let batchCounter = 1;

function post(type: string, payload: unknown): void {
  figma.ui.postMessage({ type, payload });
}

function statePayload() {
  return {
    selection: currentSnapshot,
    selectionProblem,
    batch: currentBatch,
    canCrossbreed: selectedGenerated.length === 2,
    selectedGenerated,
    selectedThumbnails,
    lastSettings,
    version: GENERATOR_VERSION,
    pending: busy,
  };
}

function sendState(): void {
  post("state", statePayload());
}

function progress(
  operation: string,
  phase: string,
  message: string,
  percent: number,
): void {
  post("progress", { operation, phase, message, percent });
}

function toast(tone: "ok" | "warn" | "error" | "info", message: string): void {
  post("toast", { tone, message });
}

function fail(operation: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  const detail = error instanceof Error ? error.stack?.split("\n")[1]?.trim() : undefined;
  post("error", { operation, message, detail });
  figma.notify(`GRID CRIMES/ — ${message}`, { error: true, timeout: 6000 });
}

function isSceneNode(node: BaseNode | null): node is SceneNode {
  return Boolean(
    node &&
      node.type !== "DOCUMENT" &&
      node.type !== "PAGE",
  );
}

async function getSceneNode(id: string): Promise<SceneNode | null> {
  const node = await figma.getNodeByIdAsync(id);
  if (!isSceneNode(node) || node.removed) return null;
  return node;
}

function absoluteBounds(node: SceneNode): {
  x: number;
  y: number;
  w: number;
  h: number;
} | null {
  const box = node.absoluteBoundingBox;
  return box ? { x: box.x, y: box.y, w: box.width, h: box.height } : null;
}

function unionRect(nodes: SceneNode[]): { x: number; y: number; w: number; h: number } | null {
  const boxes = nodes
    .map(absoluteBounds)
    .filter((box): box is NonNullable<typeof box> => Boolean(box));
  if (!boxes.length) return null;
  const x = Math.min(...boxes.map((box) => box.x));
  const y = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.w));
  const bottom = Math.max(...boxes.map((box) => box.y + box.h));
  return { x, y, w: right - x, h: bottom - y };
}

function stripBatch(batch: BatchInfo): BatchInfo {
  return {
    ...batch,
    sourceThumbnail: null,
    variations: batch.variations.map((variation) => ({
      ...variation,
      thumbnail: null,
    })),
  };
}

function saveBatch(batch: BatchInfo): void {
  currentBatch = batch;
  void (async () => {
    const node = await figma.getNodeByIdAsync(batch.containerId);
    if (node && node.type === "FRAME") {
      node.setPluginData(BATCH_KEY, JSON.stringify(stripBatch(batch)));
    }
  })();
  void figma.clientStorage.setAsync(LAST_BATCH_KEY, {
    batchId: batch.id,
    containerId: batch.containerId,
    pageId: figma.currentPage.id,
    createdAt: batch.createdAt,
  } satisfies StoredBatchRef);
}

function parseBatch(raw: string): BatchInfo | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    if (typeof value.id !== "string" || typeof value.containerId !== "string") {
      return null;
    }
    if (!Array.isArray(value.variations)) return null;
    return {
      id: value.id,
      containerId: value.containerId,
      sourceName: String(value.sourceName ?? "Original composition"),
      sourceFingerprint: String(value.sourceFingerprint ?? ""),
      createdAt: Number(value.createdAt) || 0,
      preset: (value.preset as BatchInfo["preset"]) ?? "brutalist",
      settings: sanitizeSettings(value.settings),
      variations: value.variations
        .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
        .map((entry) => ({
          id: String(entry.id ?? ""),
          frameId: String(entry.frameId ?? ""),
          name: String(entry.name ?? ""),
          seed: Number(entry.seed) || 1,
          preset: String(entry.preset ?? ""),
          presetName: String(entry.presetName ?? ""),
          grammar: String(entry.grammar ?? ""),
          grammarName: String(entry.grammarName ?? ""),
          score: Number(entry.score) || 0,
          width: Number(entry.width) || 0,
          height: Number(entry.height) || 0,
          kept: entry.kept === true,
          locked: entry.locked === true,
          thumbnail: null,
          dna: entry.dna as BatchVariation["dna"],
        })),
      parentMeta: (value.parentMeta as CrossbreedMeta | null) ?? null,
      auxNodeIds: Array.isArray(value.auxNodeIds)
        ? value.auxNodeIds.filter((id): id is string => typeof id === "string")
        : [],
      sourceThumbnail: null,
    };
  } catch {
    return null;
  }
}

async function exportThumbnail(node: SceneNode, maxPx = 440): Promise<string | null> {
  try {
    const width = Math.max(1, node.width);
    const scale = Math.min(1.5, Math.max(0.03, maxPx / width));
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: scale },
    });
    return `data:image/png;base64,${figma.base64Encode(bytes)}`;
  } catch {
    return null;
  }
}

async function hydrateThumbnails(batch: BatchInfo): Promise<void> {
  if (
    !batch.sourceThumbnail &&
    currentSnapshot?.sourceIds.length === 1
  ) {
    const source = await getSceneNode(currentSnapshot.sourceIds[0]);
    if (source) {
      batch.sourceThumbnail = await exportThumbnail(source, 700);
      sendState();
    }
  }
  for (const variation of batch.variations) {
    if (variation.thumbnail) continue;
    const frame = await getSceneNode(variation.frameId);
    if (frame && frame.type === "FRAME") {
      variation.thumbnail = await exportThumbnail(frame);
    }
  }
  post("thumbnails", {
    batchId: batch.id,
    thumbs: Object.fromEntries(
      batch.variations
        .filter((variation) => variation.thumbnail)
        .map((variation) => [variation.id, variation.thumbnail]),
    ),
  });
}

async function loadBatchFromContainer(
  containerId: string,
  send = true,
): Promise<BatchInfo | null> {
  const node = await getSceneNode(containerId);
  if (!node || node.type !== "FRAME") return null;
  if (node.parent?.id !== figma.currentPage.id) return null;
  const parsed = parseBatch(node.getPluginData(BATCH_KEY));
  if (!parsed) return null;
  currentBatch = parsed;
  if (send) {
    sendState();
    void hydrateThumbnails(parsed);
  }
  return parsed;
}

async function restoreLastBatch(): Promise<void> {
  try {
    const ref = (await figma.clientStorage.getAsync(LAST_BATCH_KEY)) as
      | StoredBatchRef
      | undefined;
    if (!ref || ref.pageId !== figma.currentPage.id) return;
    await loadBatchFromContainer(ref.containerId, false);
  } catch {
    // A missing or malformed local record is not an error.
  }
}

async function readBatchSettings(): Promise<void> {
  try {
    const stored = await figma.clientStorage.getAsync(SETTINGS_KEY);
    if (stored) lastSettings = sanitizeSettings(stored);
  } catch {
    lastSettings = null;
  }
  try {
    const counter = await figma.clientStorage.getAsync(BATCH_COUNTER_KEY);
    batchCounter = typeof counter === "number" && counter > 0 ? Math.floor(counter) : 1;
  } catch {
    batchCounter = 1;
  }
}

function generatedMetaFor(node: SceneNode): GridCrimesMeta | null {
  try {
    return decodeMeta(node.getPluginData(META_KEY));
  } catch {
    return null;
  }
}

async function updateFromSelection(): Promise<void> {
  const token = ++analysisToken;
  const selection = [...figma.currentPage.selection];
  const metas: GridCrimesMeta[] = [];
  const containers: string[] = [];
  const other: SceneNode[] = [];
  for (const node of selection) {
    const meta = generatedMetaFor(node);
    if (meta) {
      metas.push(meta);
      continue;
    }
    try {
      if (node.getPluginData(BATCH_KEY)) {
        containers.push(node.id);
        continue;
      }
    } catch {
      // Not a managed node.
    }
    other.push(node);
  }
  selectedGenerated = metas;
  if (metas.length === 2) {
    selectedThumbnails = {};
    for (const node of selection) {
      const meta = generatedMetaFor(node);
      if (!meta) continue;
      const cacheKey = `${meta.variationId}:${meta.revision}`;
      let thumb = selectedThumbCache.get(cacheKey) ?? null;
      if (!thumb) {
        thumb = await exportThumbnail(node);
        if (thumb) selectedThumbCache.set(cacheKey, thumb);
      }
      if (thumb) selectedThumbnails[meta.variationId] = thumb;
    }
  } else {
    selectedThumbnails = {};
  }

  if (other.length === 0 && (metas.length || containers.length)) {
    const batchId = metas[0]?.batchId;
    if (
      batchId &&
      metas.length > 0 &&
      metas.every((meta) => meta.batchId === batchId) &&
      (!currentBatch || currentBatch.id !== batchId)
    ) {
      await loadBatchFromContainer(metas[0].containerId, false);
    }
    if (containers.length && !metas.length) {
      const container = await getSceneNode(containers[0]);
      if (container?.type === "FRAME") {
        const parsed = parseBatch(container.getPluginData(BATCH_KEY));
        if (parsed) currentBatch = parsed;
      }
    }
    if (token !== analysisToken) return;
    sendState();
    return;
  }

  if (other.length === 0) {
    currentSnapshot = null;
    selectionProblem =
      selection.length === 0
        ? "Select a frame, group, or a few sibling layers to begin."
        : null;
    if (token !== analysisToken) return;
    sendState();
    return;
  }

  const result = await analyzeSelection(other);
  if (token !== analysisToken) return;
  currentSnapshot = result.snapshot;
  selectionProblem = result.problem;
  if (result.snapshot) {
    lastSettings = sanitizeSettings({
      ...(lastSettings ?? DEFAULT_SETTINGS),
      preset: lastSettings?.preset ?? DEFAULT_SETTINGS.preset,
    });
  }
  sendState();
}

function scheduleSelectionUpdate(): void {
  if (selectionTimer) clearTimeout(selectionTimer);
  selectionTimer = setTimeout(() => {
    void updateFromSelection();
  }, 140);
}

async function resolveSources(
  snapshot: CompositionSnapshot,
): Promise<Map<string, SceneNode>> {
  const map = new Map<string, SceneNode>();
  for (const block of snapshot.blocks) {
    const node = await getSceneNode(block.id);
    if (node) map.set(block.id, node);
  }
  const missing = missingSourceIds(snapshot, map);
  if (missing.length) {
    throw new Error(
      `The source changed while the plugin was open. These layers are missing: ${missing
        .slice(0, 3)
        .join(", ")}${missing.length > 3 ? "…" : ""}. Select the composition again.`,
    );
  }
  return map;
}

async function sourceRectFor(snapshot: CompositionSnapshot): Promise<{
  x: number;
  y: number;
  w: number;
  h: number;
}> {
  const roots: SceneNode[] = [];
  for (const id of snapshot.sourceIds) {
    const node = await getSceneNode(id);
    if (node) roots.push(node);
  }
  const union = unionRect(roots);
  if (union) return union;
  const blocks: SceneNode[] = [];
  for (const block of snapshot.blocks) {
    const node = await getSceneNode(block.id);
    if (node) blocks.push(node);
  }
  const blockUnion = unionRect(blocks);
  if (blockUnion) return blockUnion;
  return { x: 0, y: 0, w: snapshot.width, h: snapshot.height };
}

function pageOccupied(): Array<{ x: number; y: number; w: number; h: number }> {
  return figma.currentPage.children
    .map(absoluteBounds)
    .filter((box): box is NonNullable<typeof box> => Boolean(box));
}

interface CreateBatchInput {
  plans: LayoutPlan[];
  snapshot: CompositionSnapshot;
  settings: MutationSettings;
  frameNames: string[];
  presetLabel: string;
  crossbreed?: CrossbreedMeta;
  parentMeta?: CrossbreedMeta | null;
  warnings?: string[];
}

async function createBatch(input: CreateBatchInput): Promise<{
  batch: BatchInfo;
  warnings: string[];
}> {
  const {
    plans,
    snapshot,
    settings,
    frameNames,
    presetLabel,
    crossbreed,
    parentMeta,
    warnings: extraWarnings = [],
  } = input;
  if (!plans.length) throw new Error("No valid layout was produced.");
  const sources = await resolveSources(snapshot);
  const fonts = await loadFonts(snapshot);
  const warnings = [...extraWarnings, ...fonts.warnings];
  const sourceRect = await sourceRectFor(snapshot);
  const dims = batchDimensions(plans[0].width, plans[0].height);
  const placement = chooseBatchPlacement(sourceRect, dims, pageOccupied());
  const batchId = newBatchId(settings.seed, Date.now());
  const container = figma.createFrame();
  container.name = batchFrameName(batchCounter);
  container.resizeWithoutConstraints(dims.width, dims.height);
  container.x = placement.x;
  container.y = placement.y;
  container.fills = [];
  container.clipsContent = false;
  container.cornerRadius = 0;
  figma.currentPage.appendChild(container);

  const auxNodeIds: string[] = [];
  let sourceThumbnail: string | null = null;
  if (snapshot.sourceIds.length === 1) {
    const root = await getSceneNode(snapshot.sourceIds[0]);
    if (root) sourceThumbnail = await exportThumbnail(root, 700);
  }

  try {
    if (fonts.decorationFont) {
      const title = figma.createText();
      title.name = "Batch label";
      title.fontName = { family: "Inter", style: "Medium" };
      title.characters = `GRID CRIMES / ${String(batchCounter).padStart(3, "0")}`;
      title.fontSize = 22;
      title.letterSpacing = { unit: "PERCENT", value: -1 };
      title.fills = [{ type: "SOLID", color: { r: 0x23 / 255, g: 0x24 / 255, b: 0x1f / 255 } }];
      title.textAutoResize = "HEIGHT";
      title.resizeWithoutConstraints(480, 30);
      title.x = 48;
      title.y = 22;
      container.appendChild(title);
      auxNodeIds.push(title.id);

      const note = figma.createText();
      note.name = "Batch note";
      note.fontName = { family: "Inter", style: "Regular" };
      note.characters = `LAB/ COMPOSITION INSTRUMENT  ·  ${presetLabel}  ·  SEED ${settings.seed}  ·  ${plans.length} VARIATIONS`;
      note.fontSize = 10;
      note.letterSpacing = { unit: "PERCENT", value: 6 };
      note.fills = [{ type: "SOLID", color: { r: 0x62 / 255, g: 0x63 / 255, b: 0x5a / 255 } }];
      note.textAutoResize = "HEIGHT";
      note.resizeWithoutConstraints(Math.max(320, dims.width - 96), 18);
      note.x = 48;
      note.y = 52;
      container.appendChild(note);
      auxNodeIds.push(note.id);
    }
    const rule = figma.createRectangle();
    rule.name = "Batch rule";
    rule.resizeWithoutConstraints(Math.max(10, dims.width - 96), 2);
    rule.x = 48;
    rule.y = 78;
    rule.fills = [{ type: "SOLID", color: { r: 0x23 / 255, g: 0x24 / 255, b: 0x1f / 255 } }];
    container.appendChild(rule);
    auxNodeIds.push(rule.id);

    const variations: BatchVariation[] = [];
    for (let index = 0; index < plans.length; index += 1) {
      const plan = plans[index];
      progress("generate", "build", `Building variation ${index + 1} of ${plans.length}`, 48 + index * 10);
      const position = framePosition(index, plan.width, plan.height);
      const built = buildVariationFrame({
        plan,
        snapshot,
        container,
        x: position.x,
        y: position.y,
        index,
        batchId,
        frameName: frameNames[index] ?? variationFrameName(presetLabel, index + 1),
        sources,
        fonts,
        crossbreed,
      });
      warnings.push(...built.warnings);
      variations.push({
        id: built.meta.variationId,
        frameId: built.frame.id,
        name: built.frame.name,
        seed: plan.seed,
        preset: plan.preset,
        presetName: plan.presetName,
        grammar: plan.grammarId,
        grammarName: plan.grammarName,
        score: plan.score,
        width: plan.width,
        height: plan.height,
        kept: false,
        locked: false,
        thumbnail: null,
        dna: plan.dna,
      });
    }

    const batch: BatchInfo = {
      id: batchId,
      containerId: container.id,
      sourceName: snapshot.name,
      sourceFingerprint: snapshot.fingerprint,
      createdAt: Date.now(),
      variations,
      preset: settings.preset,
      settings,
      parentMeta: parentMeta ?? null,
      auxNodeIds,
      sourceThumbnail,
    };

    progress("generate", "thumbnail", "Rendering real previews", 88);
    for (const variation of batch.variations) {
      const frame = await getSceneNode(variation.frameId);
      if (frame) variation.thumbnail = await exportThumbnail(frame);
    }
    saveBatch(batch);
    batchCounter += 1;
    void figma.clientStorage.setAsync(BATCH_COUNTER_KEY, batchCounter);
    void figma.clientStorage.setAsync(SETTINGS_KEY, settings);
    currentBatch = batch;
    figma.currentPage.selection = [container];
    figma.viewport.scrollAndZoomIntoView([container]);
    figma.commitUndo();
    return { batch, warnings: [...new Set(warnings)] };
  } catch (error) {
    try {
      container.remove();
    } catch {
      // Best effort; container removal is the transaction rollback.
    }
    throw error;
  }
}

async function handleGenerate(
  settings: MutationSettings,
  roleOverrides: Parameters<typeof applyRoleOverrides>[1],
): Promise<void> {
  if (busy) return;
  if (!currentSnapshot) {
    throw new Error("Select a composition before generating.");
  }
  busy = true;
  sendState();
  const operation = "generate";
  try {
    progress(operation, "analyze", "Reading the composition", 8);
    const snapshot = applyRoleOverrides(currentSnapshot, roleOverrides);
    progress(operation, "plan", "Planning four directions", 20);
    const result = generatePlans(snapshot, settings, { count: 4 });
    if (!result.plans.length) throw new Error("The engine could not produce a safe layout.");
    progress(operation, "build", "Building editable Figma frames", 42);
    const batch = await createBatch({
      plans: result.plans,
      snapshot,
      settings,
      frameNames: result.plans.map((plan, index) =>
        variationFrameName(plan.presetName, index + 1),
      ),
      presetLabel: PRESETS[settings.preset]?.name ?? settings.preset,
      warnings: [...result.warnings],
    });
    lastSettings = settings;
    busy = false;
    post("generated", { batch: batch.batch, warnings: batch.warnings });
    sendState();
    figma.notify("GRID CRIMES/ — four variations generated.", { timeout: 4000 });
  } catch (error) {
    busy = false;
    sendState();
    fail(operation, error);
  }
}

async function resolveVariationFrame(variationId: string): Promise<{
  variation: BatchVariation;
  frame: FrameNode;
  meta: GridCrimesMeta;
} | null> {
  const variation = currentBatch?.variations.find((entry) => entry.id === variationId);
  let frameId = variation?.frameId;
  if (!frameId) {
    const selectedMeta = selectedGenerated.find(
      (entry) => entry.variationId === variationId,
    );
    if (selectedMeta) {
      const container = await getSceneNode(selectedMeta.containerId);
      if (container?.type === "FRAME") {
        const child = container.children.find((candidate) => {
          const meta = generatedMetaFor(candidate);
          return meta?.variationId === variationId;
        });
        frameId = child?.id;
      }
    }
  }
  if (!frameId) {
    for (const node of figma.currentPage.selection) {
      const meta = generatedMetaFor(node);
      if (meta?.variationId === variationId) {
        frameId = node.id;
        break;
      }
    }
  }
  if (!frameId) return null;
  const node = await getSceneNode(frameId);
  if (!node || node.type !== "FRAME") return null;
  const meta = generatedMetaFor(node);
  if (!meta) return null;
  return {
    variation: variation ?? {
      id: meta.variationId,
      frameId: node.id,
      name: node.name,
      seed: meta.seed,
      preset: meta.preset,
      presetName: meta.presetName,
      grammar: meta.grammar,
      grammarName: meta.grammarName,
      score: meta.score,
      width: node.width,
      height: node.height,
      kept: meta.kept,
      locked: meta.locked,
      thumbnail: null,
      dna: meta.dna,
    },
    frame: node,
    meta,
  };
}

async function handleRegenerate(variationId: string): Promise<void> {
  if (busy) return;
  const found = await resolveVariationFrame(variationId);
  if (!found) throw new Error("That variation is no longer available.");
  if (found.frame.locked || found.meta.locked) {
    throw new Error("Unlock this variation before regenerating it.");
  }
  busy = true;
  sendState();
  const operation = "regenerate";
  let temp: FrameNode | null = null;
  try {
    progress(operation, "analyze", "Recovering the composition", 12);
    let snapshot = currentSnapshot;
    if (!snapshot || snapshot.fingerprint !== found.meta.sourceFingerprint) {
      const siblings = currentBatch?.variations ?? [];
      for (const sibling of siblings) {
        if (sibling.frameId === found.frame.id) continue;
        const frame = await getSceneNode(sibling.frameId);
        if (frame?.type === "FRAME") {
          snapshot = await snapshotFromGeneratedFrame(
            frame,
            found.meta.sourceFingerprint,
          );
          if (snapshot) break;
        }
      }
    }
    if (!snapshot) snapshot = await snapshotFromGeneratedFrame(found.frame, found.meta.sourceFingerprint);
    if (!snapshot) throw new Error("The source content for this variation could not be recovered.");
    const sources = await resolveSources(snapshot);
    const fonts = await loadFonts(snapshot);
    progress(operation, "plan", "Re-planning this direction", 30);
    const revision = (found.meta.revision ?? 0) + 1;
    const settings = { ...found.meta.settings };
    const result = generatePlans(snapshot, settings, {
      count: 1,
      grammarIds: [found.meta.grammar],
      salt: `regen:${variationId}:${revision}`,
    });
    const plan = result.plans[0];
    if (!plan) throw new Error("No safe layout could be produced.");
    const container = await getSceneNode(found.meta.containerId);
    if (!container || container.type !== "FRAME") {
      throw new Error("The batch container is missing.");
    }
    const built = buildVariationFrame({
      plan,
      snapshot,
      container,
      x: found.frame.x,
      y: found.frame.y,
      index: found.meta.index,
      batchId: found.meta.batchId,
      frameName: found.frame.name,
      sources,
      fonts,
      crossbreed: found.meta.crossbreed,
    });
    temp = built.frame;
    built.frame.setPluginData(
      META_KEY,
      encodeMeta({ ...built.meta, revision, kept: found.meta.kept }),
    );
    const oldFrame = found.frame;
    oldFrame.remove();
    temp = null;
    const variation: BatchVariation = {
      ...found.variation,
      frameId: built.frame.id,
      seed: plan.seed,
      preset: plan.preset,
      presetName: plan.presetName,
      grammar: plan.grammarId,
      grammarName: plan.grammarName,
      score: plan.score,
      thumbnail: await exportThumbnail(built.frame),
      error: undefined,
      dna: plan.dna,
    };
    if (currentBatch) {
      currentBatch.variations = currentBatch.variations.map((entry) =>
        entry.id === variation.id ? variation : entry,
      );
      saveBatch(currentBatch);
    }
    figma.currentPage.selection = [built.frame];
    figma.viewport.scrollAndZoomIntoView([built.frame]);
    figma.commitUndo();
    post("regenerated", {
      batch: currentBatch,
      variationId,
      warnings: [...result.warnings, ...fonts.warnings],
    });
    sendState();
    figma.notify("GRID CRIMES/ — variation regenerated.", { timeout: 3000 });
  } catch (error) {
    try {
      temp?.remove();
    } catch {
      // Keep the previous variation intact.
    }
    fail(operation, error);
  } finally {
    busy = false;
    sendState();
  }
}

function toCrossbreedParent(meta: GridCrimesMeta): CrossbreedParent {
  return {
    frameId: meta.sourceIds[0] ?? "",
    preset: meta.preset,
    presetName: meta.presetName,
    grammar: meta.grammar,
    seed: meta.seed,
    score: meta.score,
    sourceFingerprint: meta.sourceFingerprint,
    batchId: meta.batchId,
    settings: meta.settings,
    dna: meta.dna,
  };
}

async function handleCrossbreed(
  parentAId: string,
  parentBId: string,
  inheritance: number,
  settings: MutationSettings,
): Promise<void> {
  if (busy) return;
  const a = await resolveVariationFrame(parentAId);
  const b = await resolveVariationFrame(parentBId);
  if (!a || !b) throw new Error("One of the selected parents is no longer available.");
  const parentA: CrossbreedParent = {
    ...toCrossbreedParent(a.meta),
    frameId: a.frame.id,
  };
  const parentB: CrossbreedParent = {
    ...toCrossbreedParent(b.meta),
    frameId: b.frame.id,
  };
  const compatibility = canCrossbreed(parentA, parentB);
  if (!compatibility.ok) throw new Error(compatibility.reason);
  busy = true;
  sendState();
  const operation = "crossbreed";
  try {
    progress(operation, "crossbreed", "Reading two design DNAs", 10);
    let snapshot =
      currentSnapshot && currentSnapshot.fingerprint === parentA.sourceFingerprint
        ? currentSnapshot
        : null;
    if (!snapshot) {
      snapshot = await snapshotFromGeneratedFrame(a.frame, parentA.sourceFingerprint);
    }
    if (!snapshot) throw new Error("The crossed content could not be recovered.");
    progress(operation, "plan", "Mixing grammars and constraints", 28);
    const result = crossbreedPlans(snapshot, parentA, parentB, {
      inheritance,
      settings,
      count: 4,
    });
    const crossbreed: CrossbreedMeta = {
      parentA,
      parentB,
      inheritance,
      offspringIndex: 0,
    };
    const label = crossbreedName(parentA, parentB);
    const frameNames = result.plans.map((_, index) =>
      `GRID CRIMES / CROSSBREED / ${String(index + 1).padStart(3, "0")}`,
    );
    progress(operation, "build", "Building offspring", 46);
    const batch = await createBatch({
      plans: result.plans,
      snapshot,
      settings: result.settings,
      frameNames,
      presetLabel: `${label} · ${inheritanceLabel(inheritance, parentA, parentB)}`,
      crossbreed,
      parentMeta: crossbreed,
      warnings: [...result.warnings, `Inheritance: ${inheritance}% — ${label}`],
    });
    lastSettings = result.settings;
    post("crossbred", {
      batch: batch.batch,
      warnings: [
        ...batch.warnings,
        `${label}: ${inheritanceLabel(inheritance, parentA, parentB)}`,
      ],
    });
    sendState();
    figma.notify(`GRID CRIMES/ — ${label} offspring generated.`, { timeout: 5000 });
  } catch (error) {
    fail(operation, error);
  } finally {
    busy = false;
    sendState();
  }
}

async function handleRemoveBatch(batchId: string): Promise<void> {
  if (!currentBatch || currentBatch.id !== batchId) {
    throw new Error("That batch is no longer active.");
  }
  const container = await getSceneNode(currentBatch.containerId);
  const removedIds = new Set<string>();
  for (const variation of currentBatch.variations) {
    const node = await getSceneNode(variation.frameId);
    if (node) {
      node.remove();
      removedIds.add(node.id);
    }
  }
  for (const id of currentBatch.auxNodeIds ?? []) {
    const node = await getSceneNode(id);
    if (node) {
      node.remove();
      removedIds.add(node.id);
    }
  }
  let leftBehind = 0;
  if (container && container.type === "FRAME") {
    leftBehind = container.children.filter((child) => !removedIds.has(child.id)).length;
    if (leftBehind === 0) container.remove();
    else container.name = `${container.name} / DETACHED`;
  }
  currentBatch = null;
  await figma.clientStorage.deleteAsync(LAST_BATCH_KEY);
  figma.commitUndo();
  sendState();
  toast(
    leftBehind
      ? "warn"
      : "ok",
    leftBehind
      ? "Batch content removed. The container was left in place because it holds non-generated layers."
      : "Batch removed. The original composition was not touched.",
  );
}

async function handleRemoveVariation(variationId: string): Promise<void> {
  const found = await resolveVariationFrame(variationId);
  if (!found) throw new Error("That variation is no longer available.");
  if (found.frame.locked) throw new Error("Unlock this variation before removing it.");
  found.frame.remove();
  if (currentBatch) {
    currentBatch.variations = currentBatch.variations.filter(
      (entry) => entry.id !== variationId,
    );
    saveBatch(currentBatch);
  }
  sendState();
}

async function handleToggleLock(variationId: string, locked: boolean): Promise<void> {
  const found = await resolveVariationFrame(variationId);
  if (!found) throw new Error("That variation is no longer available.");
  found.frame.locked = locked;
  const meta: GridCrimesMeta = { ...found.meta, locked, kept: locked };
  refreshMetaOnFrame(found.frame, meta);
  if (currentBatch) {
    currentBatch.variations = currentBatch.variations.map((entry) =>
      entry.id === variationId
        ? { ...entry, locked, kept: locked }
        : entry,
    );
    saveBatch(currentBatch);
    post("batch-updated", { batch: currentBatch });
  }
  sendState();
}

async function handleFocusVariation(variationId: string): Promise<void> {
  const found = await resolveVariationFrame(variationId);
  if (!found) throw new Error("That variation is no longer available.");
  figma.currentPage.selection = [found.frame];
  figma.viewport.scrollAndZoomIntoView([found.frame]);
  post("focus-done", { target: found.frame.id });
}

async function handleFocusBatch(batchId: string): Promise<void> {
  if (!currentBatch || currentBatch.id !== batchId) {
    throw new Error("That batch is no longer active.");
  }
  const container = await getSceneNode(currentBatch.containerId);
  if (!container) throw new Error("The batch container was removed.");
  figma.currentPage.selection = [container];
  figma.viewport.scrollAndZoomIntoView([container]);
  post("focus-done", { target: container.id });
}

async function handleFocusSource(): Promise<void> {
  const nodes: SceneNode[] = [];
  for (const id of currentSnapshot?.sourceIds ?? []) {
    const node = await getSceneNode(id);
    if (node) nodes.push(node);
  }
  if (!nodes.length) throw new Error("The original source is no longer on this page.");
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
  post("focus-done", { target: nodes[0].id });
}

async function handleRequest(parsed: UIRequest): Promise<void> {
  switch (parsed.type) {
    case "ready":
      await readBatchSettings();
      await restoreLastBatch();
      await updateFromSelection();
      sendState();
      break;
    case "request-selection":
      await updateFromSelection();
      break;
    case "try-sample": {
      busy = true;
      sendState();
      progress("sample", "sample", "Creating a real editable sample in Figma", 30);
      const frame = await createSampleComposition();
      if (!frame) {
        busy = false;
        throw new Error(
          "The sample could not be created because the Inter font is unavailable.",
        );
      }
      await updateFromSelection();
      lastSettings = sanitizeSettings(DEFAULT_SETTINGS);
      busy = false;
      post("toast", {
        tone: "ok",
        message: "Sample composition created as real editable layers. Press Generate.",
      });
      sendState();
      break;
    }
    case "set-role":
      // Role corrections are applied at generation time; keep the selection
      // snapshot's role for the UI without mutating the source document.
      if (currentSnapshot) {
        const blocks = currentSnapshot.blocks.map((block) =>
          block.id === parsed.payload.id
            ? { ...block, role: parsed.payload.role }
            : block,
        );
        const roleCounts = emptyRoleCounts();
        for (const block of blocks) roleCounts[block.role] += 1;
        currentSnapshot = { ...currentSnapshot, blocks, roleCounts };
        sendState();
      }
      break;
    case "generate":
      await handleGenerate(parsed.payload.settings, parsed.payload.roleOverrides);
      break;
    case "generate-again":
      await handleGenerate(parsed.payload.settings, parsed.payload.roleOverrides);
      break;
    case "regenerate":
      await handleRegenerate(parsed.payload.variationId);
      break;
    case "crossbreed":
      await handleCrossbreed(
        parsed.payload.parentA,
        parsed.payload.parentB,
        parsed.payload.inheritance,
        parsed.payload.settings,
      );
      break;
    case "remove-batch":
      await handleRemoveBatch(parsed.payload.batchId);
      break;
    case "remove-variation":
      await handleRemoveVariation(parsed.payload.variationId);
      break;
    case "focus-variation":
      await handleFocusVariation(parsed.payload.variationId);
      break;
    case "focus-batch":
      await handleFocusBatch(parsed.payload.batchId);
      break;
    case "focus-source":
      await handleFocusSource();
      break;
    case "toggle-lock":
      await handleToggleLock(parsed.payload.variationId, parsed.payload.locked);
      break;
    case "load-batch":
      if (currentBatch?.id === parsed.payload.batchId) {
        sendState();
        void hydrateThumbnails(currentBatch);
      } else {
        const ref = (await figma.clientStorage.getAsync(LAST_BATCH_KEY)) as
          | StoredBatchRef
          | undefined;
        if (ref?.batchId === parsed.payload.batchId) {
          await loadBatchFromContainer(ref.containerId);
        } else {
          throw new Error("That batch is no longer available.");
        }
      }
      break;
    case "request-thumbnails":
      if (currentBatch?.id === parsed.payload.batchId) {
        void hydrateThumbnails(currentBatch);
      }
      break;
    case "help":
      break;
    default:
      break;
  }
}

figma.showUI(__html__, {
  width: 440,
  height: 780,
  title: "GRID CRIMES/ — LAB",
  themeColors: true,
});

figma.ui.onmessage = async (raw: unknown) => {
  const parsed = parseUIRequest(
    raw && typeof raw === "object" && "pluginMessage" in raw
      ? (raw as { pluginMessage: unknown }).pluginMessage
      : raw,
  );
  if (!parsed) return;
  if (busy && parsed.type !== "ready" && parsed.type !== "request-selection") {
    return;
  }
  try {
    await handleRequest(parsed);
  } catch (error) {
    busy = false;
    fail(parsed.type, error);
    sendState();
  }
};

figma.on("selectionchange", scheduleSelectionUpdate);

void (async () => {
  await readBatchSettings();
  await restoreLastBatch();
  await updateFromSelection();
})();
