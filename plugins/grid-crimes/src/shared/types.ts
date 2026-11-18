/**
 * Shared types for GRID CRIMES/.
 *
 * This module is deliberately free of Figma API references. Both the plugin
 * controller and the pure layout engine depend on it, but the UI can consume
 * the same shapes through the message protocol.
 */

export const GENERATOR_VERSION = "0.1.0";
export const META_KEY = "gridcrimes.meta";
export const ROLE_KEY = "gridcrimes.role";
export const BATCH_KEY = "gridcrimes.batch";

export type PresetId =
  | "brutalist"
  | "swiss"
  | "minimal"
  | "maximal"
  | "antigrid"
  | "chaos";

export const PRESET_IDS: PresetId[] = [
  "brutalist",
  "swiss",
  "minimal",
  "maximal",
  "antigrid",
  "chaos",
];

export type Role =
  | "headline"
  | "subhead"
  | "body"
  | "visual"
  | "action"
  | "label"
  | "decoration"
  | "module";

export const ROLES: Role[] = [
  "headline",
  "subhead",
  "body",
  "visual",
  "action",
  "label",
  "decoration",
  "module",
];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type SelectionKind =
  | "frame"
  | "group"
  | "multiple"
  | "single"
  | "sample"
  | "generated";

export interface FontRef {
  family: string;
  style: string;
}

export interface TextMeta {
  characters: string;
  sample: string;
  length: number;
  fontSize: number;
  lineHeight: number | null;
  letterSpacing: number | null;
  textCase: string | null;
  fonts: FontRef[];
  hasMissingFont: boolean;
  mixedFontSize: boolean;
}

export interface BlockSnapshot {
  /** Stable Figma node id at analysis time. */
  id: string;
  name: string;
  sourceType: string;
  role: Role;
  /** Bounds relative to the source composition origin. */
  bounds: Rect;
  rotation: number;
  areaShare: number;
  text?: TextMeta;
  hasImage: boolean;
  hasVector: boolean;
  hasSolidFill: boolean;
  fillColors: string[];
  isInstance: boolean;
  isAutoLayout: boolean;
  childCount: number;
  /** Whether the node may be resized without meaningfully breaking a module. */
  resizeMode: "text" | "frame" | "rescale" | "fixed";
  canColorize: boolean;
  canRotate: boolean;
  /** True when this block or a descendant contains an unavailable font. */
  hasMissingFont?: boolean;
}

export interface CompositionSnapshot {
  version: 1;
  selectionKind: SelectionKind;
  name: string;
  sourceIds: string[];
  /** Source composition size in Figma pixels. */
  width: number;
  height: number;
  background: string;
  palette: string[];
  blocks: BlockSnapshot[];
  fonts: FontRef[];
  warnings: string[];
  roleCounts: Record<Role, number>;
  /** Structure-only fingerprint used to check crossbreed compatibility. */
  fingerprint: string;
  analyzedAt: number;
}

export type OutputSize = "source" | "square" | "portrait" | "landscape";

export interface MutationSettings {
  preset: PresetId;
  chaos: number;
  density: number;
  hierarchy: number;
  seed: number;
  preserveColors: boolean;
  preserveTypography: boolean;
  allowOverlap: boolean;
  outputSize: OutputSize;
}

export interface PresetDefinition {
  id: PresetId;
  index: string;
  name: string;
  philosophy: string;
  description: string;
  defaults: Pick<MutationSettings, "chaos" | "density" | "hierarchy">;
  accent: string;
  ink: string;
  paper: string;
  grammarIds: string[];
}

export type AlignmentStyle =
  | "left"
  | "right"
  | "center"
  | "mixed"
  | "broken";

export interface DesignDNA {
  /** Margin as a fraction of the shorter frame edge. */
  margin: number;
  columns: number;
  gutter: number;
  /** -1 favours the left/top edge, 1 favours right/bottom. */
  asymmetry: number;
  /** Maximum rotation in degrees at the current chaos value. */
  rotation: number;
  /** 0 = flat hierarchy, 1 = extreme size contrast. */
  scaleContrast: number;
  /** Density of added graphics, 0..1. */
  decorative: number;
  /** Target coverage of frame area, 0..1. */
  occupancy: number;
  alignment: AlignmentStyle;
  split: number;
  backgroundMode: "paper" | "ink" | "accent" | "source";
  colorStrategy: "restrained" | "bold" | "layered" | "mono";
}

export interface TextPlan {
  /** Absolute font size in output frame pixels. */
  fontSize: number;
  lineHeight: number | null;
  letterSpacing: number | null;
  align: "LEFT" | "CENTER" | "RIGHT";
  /** 0..1 — how much the type was dramatised versus the source. */
  emphasis: number;
}

export interface PlannedBlock {
  sourceId: string;
  role: Role;
  name: string;
  rect: Rect;
  rotation: number;
  z: number;
  opacity: number;
  /** Override for a simple text fill or simple shape fill. */
  color: string | null;
  text: TextPlan | null;
  /** The block was deliberately placed beneath another element. */
  underlay: boolean;
}

export type DecorationKind =
  | "bar"
  | "rule"
  | "block"
  | "ring"
  | "cross"
  | "dot"
  | "index"
  | "stamp"
  | "frame";

export interface PlannedDecoration {
  id: string;
  kind: DecorationKind;
  rect: Rect;
  color: string;
  rotation: number;
  z: number;
  opacity: number;
  label?: string;
  /** If true, text may sit on top of this decoration. */
  backing: boolean;
}

export interface LayoutPlan {
  version: 1;
  preset: PresetId;
  presetName: string;
  grammarId: string;
  grammarName: string;
  seed: number;
  settings: MutationSettings;
  width: number;
  height: number;
  background: string;
  ink: string;
  accent: string;
  blocks: PlannedBlock[];
  decorations: PlannedDecoration[];
  dna: DesignDNA;
  score: number;
  scoreParts: Record<string, number>;
  warnings: string[];
  createdAt: number;
}

export interface BatchVariation {
  id: string;
  frameId: string;
  name: string;
  seed: number;
  preset: string;
  presetName: string;
  grammar: string;
  grammarName: string;
  score: number;
  width: number;
  height: number;
  kept: boolean;
  locked: boolean;
  thumbnail: string | null;
  error?: string;
  dna?: DesignDNA;
}

export interface BatchInfo {
  id: string;
  containerId: string;
  sourceName: string;
  sourceFingerprint: string;
  createdAt: number;
  variations: BatchVariation[];
  preset: PresetId;
  settings: MutationSettings;
  parentMeta?: CrossbreedMeta | null;
  /** Generated title/auxiliary nodes that belong to this batch. */
  auxNodeIds?: string[];
  /** Real export of the source when it is a single frame. */
  sourceThumbnail?: string | null;
}

export interface CrossbreedMeta {
  parentA: CrossbreedParent;
  parentB: CrossbreedParent;
  inheritance: number;
  offspringIndex: number;
}

export interface CrossbreedParent {
  frameId: string;
  preset: PresetId;
  presetName: string;
  grammar: string;
  seed: number;
  score: number;
  sourceFingerprint: string;
  batchId: string;
  settings: MutationSettings;
  dna: DesignDNA;
}

/** Versioned plugin-data record stored on generated frames. */
export interface GridCrimesMeta {
  v: 1;
  generator: string;
  kind: "variation" | "batch-container";
  batchId: string;
  containerId: string;
  variationId: string;
  index: number;
  preset: PresetId;
  presetName: string;
  seed: number;
  settings: MutationSettings;
  grammar: string;
  grammarName: string;
  score: number;
  sourceFingerprint: string;
  sourceName: string;
  sourceIds: string[];
  dna: DesignDNA;
  createdAt: number;
  kept: boolean;
  locked: boolean;
  revision: number;
  crossbreed?: CrossbreedMeta;
}

export interface RoleOverride {
  id: string;
  role: Role;
}

export interface UIRequestMap {
  ready: { width: number; height: number };
  "request-selection": Record<string, never>;
  "try-sample": Record<string, never>;
  "set-role": { id: string; role: Role };
  generate: { settings: MutationSettings; roleOverrides: RoleOverride[] };
  "generate-again": {
    settings: MutationSettings;
    roleOverrides: RoleOverride[];
  };
  regenerate: {
    variationId: string;
    settings: MutationSettings;
    roleOverrides: RoleOverride[];
  };
  "remove-batch": { batchId: string };
  "remove-variation": { variationId: string };
  "focus-variation": { variationId: string };
  "focus-batch": { batchId: string };
  "focus-source": Record<string, never>;
  "toggle-lock": { variationId: string; locked: boolean };
  "crossbreed": {
    parentA: string;
    parentB: string;
    inheritance: number;
    settings: MutationSettings;
    roleOverrides: RoleOverride[];
  };
  "load-batch": { batchId: string };
  "request-thumbnails": { batchId: string };
  help: Record<string, never>;
}

export type UIRequestType = keyof UIRequestMap;

export type UIRequest = {
  [K in UIRequestType]: { type: K; requestId?: string; payload: UIRequestMap[K] };
}[UIRequestType];

export type MainPhase =
  | "analyze"
  | "plan"
  | "build"
  | "thumbnail"
  | "cleanup"
  | "crossbreed"
  | "sample"
  | "done";

export interface MainMessageMap {
  state: {
    selection: CompositionSnapshot | null;
    selectionProblem: string | null;
    batch: BatchInfo | null;
    canCrossbreed: boolean;
    selectedGenerated: GridCrimesMeta[];
    lastSettings: MutationSettings | null;
    version: string;
    pending: boolean;
  };
  progress: {
    operation: string;
    phase: MainPhase;
    message: string;
    percent: number;
  };
  generated: { batch: BatchInfo; warnings: string[] };
  regenerated: { batch: BatchInfo; variationId: string; warnings: string[] };
  crossbred: { batch: BatchInfo; warnings: string[] };
  "batch-updated": { batch: BatchInfo };
  "selection-problem": { message: string };
  toast: { tone: "ok" | "warn" | "error" | "info"; message: string };
  error: { operation: string; message: string; detail?: string };
  thumbnails: { batchId: string; thumbs: Record<string, string> };
  "focus-done": { target: string };
}

export type MainMessage = {
  [K in keyof MainMessageMap]: { type: K; payload: MainMessageMap[K] };
}[keyof MainMessageMap];

export interface EngineResult {
  plans: LayoutPlan[];
  warnings: string[];
  effectiveSeed: number;
}
