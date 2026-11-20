/**
 * AFTERCLICK recording schema, version 1.
 *
 * This file is the single source of truth for the extension and the Studio.
 * It is deliberately dependency-free so the extension can bundle it and the
 * browser tests can import it without a DOM.
 *
 * Facts and interpretations are separate:
 *   evidence "observed" — a DOM/event fact the recorder actually saw
 *   evidence "inferred" — a heuristic label applied to that fact
 *   evidence "manual"   — a person typed or placed it
 */

export const SCHEMA_ID = "afterclick.recording";
export const SCHEMA_VERSION = 1;
export const PRODUCER_VERSION = "0.1.0";
export const MAX_EVENTS = 1200;
export const MAX_ANNOTATIONS = 400;
export const MAX_FILE_BYTES = 6 * 1024 * 1024;
export const OBSERVATION_WINDOW_MS = 4000;

export type EventFamily =
  | "action"
  | "state"
  | "navigation"
  | "focus"
  | "manual"
  | "context"
  | "system";

export type EventKind =
  | "session-start"
  | "session-paused"
  | "session-resumed"
  | "page-ready"
  | "session-end"
  | "click"
  | "shortcut"
  | "submit"
  | "focus"
  | "navigation"
  | "route-change"
  | "checkpoint"
  | "control-disabled"
  | "control-enabled"
  | "control-label-changed"
  | "loading-appeared"
  | "loading-cleared"
  | "feedback-appeared"
  | "dialog-appeared"
  | "state-changed"
  | "warning"
  | "interrupted"
  | "unknown";

export type Evidence = "observed" | "inferred" | "manual";
export type Confidence = "high" | "medium" | "low";

export type ACChange = {
  property: string;
  from?: string;
  to?: string;
  summary: string;
};

export type TargetInfo = {
  tag: string;
  role?: string;
  label?: string;
  inputType?: string;
  selector?: string;
  disabled?: boolean;
  hidden?: boolean;
  redacted?: boolean;
};

export type ACEvent = {
  id: string;
  seq: number;
  /** Milliseconds from the recording's startedAt. Wall clock, not active time. */
  t: number;
  /** ISO timestamp of the observed event. */
  at: string;
  family: EventFamily;
  kind: EventKind;
  title: string;
  target?: TargetInfo;
  afterActionId?: string;
  /** Milliseconds from the related action, when this event is a consequence. */
  deltaMs?: number;
  changes?: ACChange[];
  data?: Record<string, string | number | boolean>;
  evidence: Evidence;
  confidence?: Confidence;
  note?: string;
  warnings?: string[];
};

export type Annotation = {
  id: string;
  eventId: string;
  text: string;
  createdAt: string;
};

export type RecordingSource = {
  url: string;
  title: string;
  viewport?: { width: number; height: number };
  userAgent?: string;
};

export type RecordingConsent = {
  grantedAt: string;
  statement: string;
  textCollection: boolean;
};

export type RecordingCapture = {
  clicks: boolean;
  shortcuts: boolean;
  focus: boolean;
  domMutations: boolean;
  navigation: boolean;
  screenshots: boolean;
  formValues: boolean;
  keystrokes: boolean;
  feedbackText: boolean;
  observationWindowMs: number;
};

export type Recording = {
  schema: typeof SCHEMA_ID;
  version: typeof SCHEMA_VERSION;
  id: string;
  title: string;
  createdAt: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  producer: {
    name: "AFTERCLICK";
    kind: "extension" | "studio" | "unknown";
    version: string;
  };
  source: RecordingSource;
  consent: RecordingConsent;
  capture: RecordingCapture;
  events: ACEvent[];
  annotations: Annotation[];
  notes?: string;
};

export type EventDraft = {
  id?: string;
  at?: string;
  family?: EventFamily;
  kind: EventKind;
  title?: string;
  target?: Partial<TargetInfo>;
  afterActionId?: string;
  changes?: Partial<ACChange>[];
  data?: Record<string, unknown>;
  evidence?: Evidence;
  confidence?: Confidence;
  note?: string;
  warnings?: string[];
};

export type StateMapGroup = {
  action: ACEvent;
  consequences: ACEvent[];
  firstDelta: number | null;
  watchedMs: number;
  outcome: "feedback" | "no-observed-change" | "recording-ended";
  annotationCount: number;
};

export type StateMapModel = {
  groups: StateMapGroup[];
  context: ACEvent[];
  detached: ACEvent[];
  actions: ACEvent[];
  stateEvents: ACEvent[];
  lostCount: number;
};

const ACTION_KINDS = new Set<EventKind>(["click", "shortcut", "submit"]);
const KNOWN_FAMILIES = new Set<EventFamily>([
  "action",
  "state",
  "navigation",
  "focus",
  "manual",
  "context",
  "system",
]);
const KNOWN_KINDS = new Set<EventKind>([
  "session-start",
  "session-paused",
  "session-resumed",
  "page-ready",
  "session-end",
  "click",
  "shortcut",
  "submit",
  "focus",
  "navigation",
  "route-change",
  "checkpoint",
  "control-disabled",
  "control-enabled",
  "control-label-changed",
  "loading-appeared",
  "loading-cleared",
  "feedback-appeared",
  "dialog-appeared",
  "state-changed",
  "warning",
  "interrupted",
  "unknown",
]);
const INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "email",
  "file",
  "hidden",
  "image",
  "month",
  "number",
  "password",
  "radio",
  "range",
  "reset",
  "search",
  "submit",
  "tel",
  "text",
  "time",
  "url",
  "week",
]);
const SENSITIVE_INPUT_TYPES = new Set(["password", "hidden", "file"]);

export function isActionKind(kind: EventKind): boolean {
  return ACTION_KINDS.has(kind);
}

export function isSensitiveInputType(type: string | undefined): boolean {
  return type ? SENSITIVE_INPUT_TYPES.has(type.toLowerCase()) : false;
}

/** Remove control characters, collapse whitespace, and bound the result. */
export function cleanText(value: unknown, max = 160): string {
  if (typeof value !== "string") return "";
  const cleaned = value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > max ? `${cleaned.slice(0, Math.max(0, max - 1))}…` : cleaned;
}

/**
 * Redact the obvious personal data that can appear inside a UI label or a
 * short feedback message. This is a last line of defence, not a promise that
 * every possible secret can be recognised. The recorder never reads values.
 */
export function redactText(value: unknown, max = 160): string {
  return cleanText(value, max * 2)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/\+?\d[\d\s().-]{8,}\d/g, (match) => {
      const digits = (match.match(/\d/g) ?? []).length;
      return digits >= 9 ? "[number]" : match;
    })
    .replace(/\b(?:bearer|token|secret|api[_-]?key)\s*[:=]\s*\S+/gi, "[redacted]")
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, (token) =>
      /\d/.test(token) && /[A-Za-z]/.test(token) ? "[token]" : token,
    )
    .slice(0, max);
}

/** Sanitised page URL: no credentials, query string, or fragment. */
export function sanitizeUrl(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return `${url.protocol}//${url.hostname}`;
    }
    return `${url.origin}${url.pathname}`;
  } catch {
    return cleanText(value, 300);
  }
}

export function safeTarget(target: Partial<TargetInfo> | undefined): TargetInfo | undefined {
  if (!target || typeof target !== "object") return undefined;
  const tag = cleanText(target.tag, 40).toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!tag) return undefined;
  const inputType =
    typeof target.inputType === "string" &&
    INPUT_TYPES.has(target.inputType.toLowerCase())
      ? target.inputType.toLowerCase()
      : undefined;
  const role =
    typeof target.role === "string" && /^[a-z-]{1,32}$/i.test(target.role)
      ? target.role.toLowerCase()
      : undefined;
  const sensitive = isSensitiveInputType(inputType) || target.redacted === true;
  const label = sensitive ? "[redacted]" : redactText(target.label, 96);
  const selector = cleanText(target.selector, 160).replace(/[<>]/g, "");
  return {
    tag,
    ...(role ? { role } : {}),
    ...(label ? { label } : {}),
    ...(inputType ? { inputType } : {}),
    ...(selector ? { selector } : {}),
    ...(typeof target.disabled === "boolean" ? { disabled: target.disabled } : {}),
    ...(typeof target.hidden === "boolean" ? { hidden: target.hidden } : {}),
    ...(sensitive ? { redacted: true } : {}),
  };
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isoOr(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const time = Date.parse(value);
  return Number.isNaN(time) ? fallback : new Date(time).toISOString();
}

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string, seed = 0): string {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${seed.toString(36)}${random}`;
}

function primitiveData(
  data: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const output: Record<string, string | number | boolean> = {};
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    if (count >= 20 || !/^[a-zA-Z0-9_-]{1,40}$/.test(key)) continue;
    if (typeof value === "string") {
      output[key] = redactText(value, 180);
      count += 1;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      output[key] = Math.round(value);
      count += 1;
    } else if (typeof value === "boolean") {
      output[key] = value;
      count += 1;
    }
  }
  return Object.keys(output).length ? output : undefined;
}

function safeChanges(changes: Partial<ACChange>[] | undefined): ACChange[] | undefined {
  if (!Array.isArray(changes)) return undefined;
  const output: ACChange[] = [];
  for (const change of changes.slice(0, 8)) {
    if (!change || typeof change !== "object") continue;
    const property = cleanText(change.property, 40).replace(/[^a-zA-Z0-9_-]/g, "");
    const summary = redactText(change.summary, 140);
    if (!property || !summary) continue;
    output.push({
      property,
      summary,
      ...(change.from !== undefined ? { from: redactText(change.from, 100) } : {}),
      ...(change.to !== undefined ? { to: redactText(change.to, 100) } : {}),
    });
  }
  return output.length ? output : undefined;
}

/** A human title is derived here, never scraped wholesale from the page. */
export function describeEvent(
  kind: EventKind,
  target?: TargetInfo,
  data?: Record<string, string | number | boolean>,
): string {
  const label = target?.label ? `“${target.label}”` : target?.role ?? target?.tag ?? "";
  const withLabel = label ? ` ${label}` : "";
  switch (kind) {
    case "page-ready":
      return "Page ready";
    case "session-start":
      return "Recording started";
    case "session-paused":
      return "Recording paused";
    case "session-resumed":
      return "Recording resumed";
    case "session-end":
      return data?.reason === "tab-closed" ? "Recording ended: tab closed" : "Recording stopped";
    case "click":
      return `Clicked${withLabel}`;
    case "shortcut":
      return `Shortcut ${data?.keys ?? "pressed"}`;
    case "submit":
      return `Submitted${withLabel}`;
    case "focus":
      return `Focus moved to${withLabel}`;
    case "navigation":
      return `Navigated to ${data?.path ?? data?.url ?? "another page"}`;
    case "route-change":
      return `Route changed to ${data?.path ?? data?.url ?? "another view"}`;
    case "checkpoint":
      return `Manual checkpoint${data?.note ? `: ${data.note}` : ""}`;
    case "control-disabled":
      return `${label || "Control"} became disabled`;
    case "control-enabled":
      return `${label || "Control"} became enabled`;
    case "control-label-changed":
      return `${label || "Control"} label changed`;
    case "loading-appeared":
      return `Loading feedback appeared${label ? ` (${label})` : ""}`;
    case "loading-cleared":
      return `Loading feedback cleared${label ? ` (${label})` : ""}`;
    case "feedback-appeared": {
      const type = data?.messageType;
      if (type === "success") return `Success feedback appeared${label ? ` (${label})` : ""}`;
      if (type === "error") return `Error feedback appeared${label ? ` (${label})` : ""}`;
      if (type === "warning") return `Warning feedback appeared${label ? ` (${label})` : ""}`;
      if (type === "loading") return `Loading feedback appeared${label ? ` (${label})` : ""}`;
      return `Interface feedback appeared${label ? ` (${label})` : ""}`;
    }
    case "dialog-appeared":
      return `Dialog opened${label ? ` (${label})` : ""}`;
    case "state-changed":
      return `Interface state changed${label ? ` (${label})` : ""}`;
    case "warning":
      return data?.message ? cleanText(data.message, 120) : "Recorder warning";
    case "interrupted":
      return "Recording interrupted";
    default:
      return "Event";
  }
}

function fallbackFamily(kind: EventKind): EventFamily {
  if (ACTION_KINDS.has(kind)) return "action";
  if (kind === "focus") return "focus";
  if (kind === "navigation" || kind === "route-change") return "navigation";
  if (kind === "checkpoint") return "manual";
  if (
    kind === "session-start" ||
    kind === "session-paused" ||
    kind === "session-resumed" ||
    kind === "page-ready" ||
    kind === "session-end"
  )
    return "context";
  if (kind === "warning" || kind === "interrupted" || kind === "unknown") return "system";
  return "state";
}

export function createRecording(input: {
  url: string;
  title: string;
  startedAt?: string;
  viewport?: { width: number; height: number };
  userAgent?: string;
  consentStatement: string;
  feedbackText?: boolean;
  observationWindowMs?: number;
}): Recording {
  const startedAt = isoOr(input.startedAt, nowIso());
  return {
    schema: SCHEMA_ID,
    version: SCHEMA_VERSION,
    id: id("rec", Date.parse(startedAt)),
    title: redactText(input.title || "Untitled recording", 120),
    createdAt: startedAt,
    startedAt,
    durationMs: 0,
    producer: { name: "AFTERCLICK", kind: "extension", version: PRODUCER_VERSION },
    source: {
      url: sanitizeUrl(input.url),
      title: redactText(input.title, 160),
      ...(input.viewport ? { viewport: input.viewport } : {}),
      ...(input.userAgent ? { userAgent: cleanText(input.userAgent, 220) } : {}),
    },
    consent: {
      grantedAt: startedAt,
      statement: cleanText(input.consentStatement, 280),
      textCollection: input.feedbackText === true,
    },
    capture: {
      clicks: true,
      shortcuts: true,
      focus: true,
      domMutations: true,
      navigation: true,
      screenshots: false,
      formValues: false,
      keystrokes: false,
      feedbackText: input.feedbackText === true,
      observationWindowMs: Math.max(
        500,
        Math.min(15000, number(input.observationWindowMs, OBSERVATION_WINDOW_MS)),
      ),
    },
    events: [],
    annotations: [],
  };
}

/**
 * Append one event in place, applying the privacy and size rules. The
 * recording is owned by the background worker, so mutation keeps the hot path
 * cheap; callers that need a copy can use `structuredClone` themselves.
 */
export function appendEvent(recording: Recording, draft: EventDraft): ACEvent | null {
  if (!draft || typeof draft !== "object") return null;
  if (recording.events.length >= MAX_EVENTS) {
    const last = recording.events[recording.events.length - 1];
    if (!last || last.kind !== "warning") {
      recording.events.push({
        id: id("evt", recording.events.length),
        seq: recording.events.length,
        t: Math.max(0, Date.now() - Date.parse(recording.startedAt)),
        at: nowIso(),
        family: "system",
        kind: "warning",
        title: "Event limit reached",
        data: {
          message: "Event limit reached",
          detail: `Only the first ${MAX_EVENTS} events are kept.`,
        },
        evidence: "observed",
        warnings: ["Recording event limit reached."],
      });
    }
    return null;
  }

  const kind: EventKind = KNOWN_KINDS.has(draft.kind) ? draft.kind : "unknown";
  const at = isoOr(draft.at, nowIso());
  const offset = Math.max(0, Date.parse(at) - Date.parse(recording.startedAt));
  const last = recording.events[recording.events.length - 1];
  const target = safeTarget(draft.target);
  const targetKey = target
    ? `${target.tag}:${target.role ?? ""}:${target.label ?? ""}:${target.inputType ?? ""}`
    : "";

  // Suppress an identical action captured by both the content script and a
  // fallback path. Small windows only; this is not a general event filter.
  if (
    last &&
    ACTION_KINDS.has(kind) &&
    last.kind === kind &&
    offset - last.t < 180 &&
    (last.target?.label ?? "") === (target?.label ?? "") &&
    (last.target?.tag ?? "") === (target?.tag ?? "")
  ) {
    return last;
  }

  const family: EventFamily = draft.family && KNOWN_FAMILIES.has(draft.family)
    ? draft.family
    : fallbackFamily(kind);
  const data = primitiveData(draft.data);
  const event: ACEvent = {
    id: (() => {
      const candidate = cleanText(draft.id, 80).replace(/[^a-zA-Z0-9_-]/g, "");
      return candidate && !recording.events.some((item) => item.id === candidate)
        ? candidate
        : id("evt", recording.events.length);
    })(),
    seq: recording.events.length,
    t: offset,
    at,
    family,
    kind,
    title: redactText(draft.title || describeEvent(kind, target, data), 160),
    evidence:
      draft.evidence === "inferred" || draft.evidence === "manual"
        ? draft.evidence
        : "observed",
    ...(target ? { target } : {}),
    ...(draft.confidence ? { confidence: draft.confidence } : {}),
    ...(draft.afterActionId
      ? { afterActionId: cleanText(draft.afterActionId, 80) }
      : {}),
    ...(data ? { data } : {}),
    ...(draft.note ? { note: redactText(draft.note, 240) } : {}),
    ...(Array.isArray(draft.warnings) && draft.warnings.length
      ? { warnings: draft.warnings.slice(0, 4).map((warning) => redactText(warning, 160)) }
      : {}),
  };
  const changes = safeChanges(draft.changes);
  if (changes) event.changes = changes;

  const action = event.afterActionId
    ? recording.events.find((item) => item.id === event.afterActionId && isActionKind(item.kind))
    : undefined;
  if (action) {
    event.afterActionId = action.id;
    event.deltaMs = Math.max(0, event.t - action.t);
    if (!event.confidence) event.confidence = "medium";
  } else {
    delete event.afterActionId;
    delete event.deltaMs;
  }
  if (ACTION_KINDS.has(event.kind) && !event.data) {
    event.data = { observationWindowMs: recording.capture.observationWindowMs };
  }
  if (!targetKey && event.kind === "click") event.title = "Clicked the page";
  recording.events.push(event);
  recording.durationMs = Math.max(recording.durationMs, event.t);
  return event;
}

export function addAnnotation(
  recording: Recording,
  eventId: string,
  text: string,
  at = nowIso(),
): Annotation | null {
  const clean = redactText(text, 1000);
  if (!clean || recording.annotations.length >= MAX_ANNOTATIONS) return null;
  if (!recording.events.some((event) => event.id === eventId)) return null;
  const annotation: Annotation = {
    id: id("note", recording.annotations.length),
    eventId,
    text: clean,
    createdAt: isoOr(at, nowIso()),
  };
  recording.annotations.push(annotation);
  return annotation;
}

export function removeAnnotation(recording: Recording, annotationId: string): boolean {
  const index = recording.annotations.findIndex((item) => item.id === annotationId);
  if (index < 0) return false;
  recording.annotations.splice(index, 1);
  return true;
}

export type ParseResult =
  | { ok: true; recording: Recording; warnings: string[] }
  | { ok: false; error: string; details: string[] };

export function parseRecording(value: unknown): ParseResult {
  const warnings: string[] = [];
  if (!value || typeof value !== "object") {
    return { ok: false, error: "This file is not an AFTERCLICK recording.", details: [] };
  }
  const input = value as Record<string, unknown>;
  if (input.schema !== SCHEMA_ID) {
    if (typeof input.schema === "string" && input.schema.startsWith("afterclick")) {
      return {
        ok: false,
        error: "This file uses a different AFTERCLICK schema.",
        details: [`Found “${cleanText(input.schema, 80)}”; expected “${SCHEMA_ID}”.`],
      };
    }
    return {
      ok: false,
      error: "This JSON is not an AFTERCLICK recording.",
      details: ["The required schema identifier is missing."],
    };
  }
  const version = number(input.version, -1);
  if (version !== SCHEMA_VERSION) {
    return {
      ok: false,
      error:
        version > SCHEMA_VERSION
          ? "This recording was made by a newer AFTERCLICK version."
          : "This recording uses an unsupported AFTERCLICK version.",
      details: [
        `File version: ${version >= 0 ? version : "unknown"}. This Studio reads version ${SCHEMA_VERSION}.`,
        version > SCHEMA_VERSION
          ? "Update the Studio or re-export from a matching extension build."
          : "Re-export the recording from AFTERCLICK v0.1.0.",
      ],
    };
  }

  const startedAt = isoOr(input.startedAt, nowIso());
  const startedMs = Date.parse(startedAt);
  const endedAt = typeof input.endedAt === "string" ? isoOr(input.endedAt, "") : "";
  const endedMs = endedAt ? Date.parse(endedAt) : null;
  const durationMs =
    endedMs !== null
      ? Math.max(0, endedMs - startedMs)
      : Math.max(0, number(input.durationMs, 0));

  const sourceInput =
    input.source && typeof input.source === "object"
      ? (input.source as Record<string, unknown>)
      : {};
  const sourceViewport =
    sourceInput.viewport && typeof sourceInput.viewport === "object"
      ? (sourceInput.viewport as Record<string, unknown>)
      : null;
  const source: RecordingSource = {
    url: sanitizeUrl(sourceInput.url),
    title: redactText(sourceInput.title, 160) || "Untitled page",
    ...(sourceViewport
      ? {
          viewport: {
            width: Math.max(1, Math.min(10000, number(sourceViewport.width, 1))),
            height: Math.max(1, Math.min(10000, number(sourceViewport.height, 1))),
          },
        }
      : {}),
    ...(typeof sourceInput.userAgent === "string"
      ? { userAgent: cleanText(sourceInput.userAgent, 220) }
      : {}),
  };

  const consentInput =
    input.consent && typeof input.consent === "object"
      ? (input.consent as Record<string, unknown>)
      : {};
  const consent: RecordingConsent = {
    grantedAt: typeof consentInput.grantedAt === "string"
      ? isoOr(consentInput.grantedAt, "")
      : "",
    statement: cleanText(consentInput.statement, 280),
    textCollection: consentInput.textCollection === true,
  };
  if (!consent.grantedAt) {
    warnings.push("The file does not declare when recording consent was granted.");
  }

  const captureInput =
    input.capture && typeof input.capture === "object"
      ? (input.capture as Record<string, unknown>)
      : {};
  const capture: RecordingCapture = {
    clicks: captureInput.clicks === true,
    shortcuts: captureInput.shortcuts === true,
    focus: captureInput.focus === true,
    domMutations: captureInput.domMutations === true,
    navigation: captureInput.navigation === true,
    screenshots: captureInput.screenshots === true,
    formValues: captureInput.formValues === true,
    keystrokes: captureInput.keystrokes === true,
    feedbackText: captureInput.feedbackText === true,
    observationWindowMs: Math.max(
      500,
      Math.min(15000, number(captureInput.observationWindowMs, OBSERVATION_WINDOW_MS)),
    ),
  };
  if (capture.screenshots) warnings.push("This recording declares screenshots; the Studio does not display or embed them.");
  if (capture.formValues || capture.keystrokes) {
    warnings.push("The file declares form-value or keystroke capture. Treat it as sensitive.");
  }

  const rawEvents = Array.isArray(input.events) ? input.events : [];
  if (!Array.isArray(input.events)) warnings.push("The file has no event list.");
  if (rawEvents.length > MAX_EVENTS) {
    warnings.push(`Only the first ${MAX_EVENTS} of ${rawEvents.length} events are loaded.`);
  }
  const events: ACEvent[] = [];
  const usedIds = new Set<string>();
  rawEvents.slice(0, MAX_EVENTS).forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      warnings.push(`Event ${index + 1} is not an object and was skipped.`);
      return;
    }
    const item = raw as Record<string, unknown>;
    const kind: EventKind = KNOWN_KINDS.has(item.kind as EventKind)
      ? (item.kind as EventKind)
      : "unknown";
    if (kind === "unknown" && item.kind !== "unknown") {
      warnings.push(`Event ${index + 1} has an unknown kind and is shown as unclassified.`);
    }
    const family: EventFamily = KNOWN_FAMILIES.has(item.family as EventFamily)
      ? (item.family as EventFamily)
      : fallbackFamily(kind);
    const at = isoOr(item.at, new Date(startedMs + Math.max(0, number(item.t, 0))).toISOString());
    const target = safeTarget(item.target as Partial<TargetInfo> | undefined);
    const changes = safeChanges(item.changes as Partial<ACChange>[] | undefined);
    const data = primitiveData(item.data as Record<string, unknown> | undefined);
    let idValue = cleanText(item.id, 80).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!idValue || usedIds.has(idValue)) idValue = id(`evt${index}`, index);
    usedIds.add(idValue);
    const event: ACEvent = {
      id: idValue,
      seq: events.length,
      t: Math.max(0, number(item.t, Date.parse(at) - startedMs)),
      at,
      family,
      kind,
      title: redactText(item.title || describeEvent(kind, target, data), 160) || "Event",
      evidence:
        item.evidence === "inferred" || item.evidence === "manual"
          ? item.evidence
          : "observed",
      ...(target ? { target } : {}),
      ...(item.confidence === "high" || item.confidence === "medium" || item.confidence === "low"
        ? { confidence: item.confidence }
        : {}),
      ...(data ? { data } : {}),
      ...(typeof item.note === "string" ? { note: redactText(item.note, 240) } : {}),
      ...(Array.isArray(item.warnings)
        ? {
            warnings: item.warnings
              .slice(0, 4)
              .map((warning) => redactText(warning, 160))
              .filter(Boolean),
          }
        : {}),
      ...(changes ? { changes } : {}),
    };
    events.push(event);
  });
  events.sort((a, b) => a.t - b.t);
  events.forEach((event, index) => {
    event.seq = index;
    event.afterActionId = undefined;
    event.deltaMs = undefined;
  });
  for (const raw of rawEvents.slice(0, MAX_EVENTS)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const event = events.find((candidate) => candidate.id === item.id);
    if (!event) continue;
    const after = cleanText(item.afterActionId, 80);
    if (!after) continue;
    const action = events.find((candidate) => candidate.id === after && isActionKind(candidate.kind));
    if (action) {
      event.afterActionId = action.id;
      event.deltaMs = Math.max(0, event.t - action.t);
    }
  }

  const maxEventT = events.length ? events[events.length - 1].t : 0;
  const computedDuration = Math.max(durationMs, maxEventT);
  if (endedMs !== null && maxEventT > durationMs) {
    warnings.push("Some events fall after the declared end time; the duration was extended.");
  }
  if (!events.length) warnings.push("This recording contains no events.");

  const rawAnnotations = Array.isArray(input.annotations) ? input.annotations : [];
  const annotations: Annotation[] = [];
  rawAnnotations.slice(0, MAX_ANNOTATIONS).forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Record<string, unknown>;
    const eventId = cleanText(item.eventId, 80);
    const text = redactText(item.text, 1000);
    if (!text) return;
    if (!events.some((event) => event.id === eventId)) {
      warnings.push(`Annotation ${index + 1} refers to a missing event and was skipped.`);
      return;
    }
    annotations.push({
      id: cleanText(item.id, 80) || id("note", index),
      eventId,
      text,
      createdAt: isoOr(item.createdAt, nowIso()),
    });
  });

  const producerInput =
    input.producer && typeof input.producer === "object"
      ? (input.producer as Record<string, unknown>)
      : {};
  const producerKind =
    producerInput.kind === "extension" || producerInput.kind === "studio"
      ? producerInput.kind
      : "unknown";

  const recording: Recording = {
    schema: SCHEMA_ID,
    version: SCHEMA_VERSION,
    id: cleanText(input.id, 80) || id("rec", 0),
    title: redactText(input.title, 120) || "Untitled recording",
    createdAt: isoOr(input.createdAt, startedAt),
    startedAt,
    ...(endedAt ? { endedAt } : {}),
    durationMs: computedDuration,
    producer: {
      name: "AFTERCLICK",
      kind: producerKind,
      version: cleanText(producerInput.version, 40) || "unknown",
    },
    source,
    consent,
    capture,
    events,
    annotations,
    ...(typeof input.notes === "string" ? { notes: redactText(input.notes, 2000) } : {}),
  };
  return { ok: true, recording, warnings };
}

export function parseRecordingFile(text: string): ParseResult {
  if (typeof text !== "string" || !text.trim()) {
    return { ok: false, error: "The file is empty.", details: ["Choose an exported AFTERCLICK JSON file."] };
  }
  if (text.length > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: "The file is too large.",
      details: [`Limit: ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(1)} MB.`],
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      error: "This file is not valid JSON.",
      details: [error instanceof Error ? error.message : "The parser rejected it."],
    };
  }
  return parseRecording(parsed);
}

export function serializeRecording(recording: Recording): string {
  return `${JSON.stringify(recording, null, 2)}\n`;
}

export function annotationCount(recording: Recording, eventId?: string): number {
  return recording.annotations.filter((annotation) =>
    eventId ? annotation.eventId === eventId : true,
  ).length;
}

/** Derive the visual relationships used by the Studio and reports. */
export function buildStateMap(recording: Recording): StateMapModel {
  const actions = recording.events.filter((event) => isActionKind(event.kind));
  const actionIds = new Set(actions.map((action) => action.id));
  const consequences = recording.events.filter(
    (event) => event.afterActionId && actionIds.has(event.afterActionId),
  );
  const consequenceIds = new Set(consequences.map((event) => event.id));
  const detached: ACEvent[] = [];
  const groups: StateMapGroup[] = actions.map((action) => {
    const attached = consequences
      .filter((event) => event.afterActionId === action.id)
      .sort((a, b) => a.t - b.t);
    const watched = Math.max(
      0,
      Math.min(
        recording.durationMs - action.t,
        recording.capture.observationWindowMs,
      ),
    );
    const firstDelta = attached.length
      ? Math.max(0, attached[0].t - action.t)
      : null;
    let outcome: StateMapGroup["outcome"] = "no-observed-change";
    if (firstDelta !== null) outcome = "feedback";
    else if (watched < 600) outcome = "recording-ended";
    return {
      action,
      consequences: attached,
      firstDelta,
      watchedMs: watched,
      outcome,
      annotationCount: annotationCount(recording, action.id),
    };
  });
  for (const event of recording.events) {
    if (event.afterActionId && !actionIds.has(event.afterActionId)) detached.push(event);
  }
  const context = recording.events.filter(
    (event) =>
      !actionIds.has(event.id) &&
      !consequenceIds.has(event.id) &&
      !detached.includes(event),
  );
  return {
    groups,
    context,
    detached,
    actions,
    stateEvents: recording.events.filter((event) => event.family === "state"),
    lostCount: groups.filter((group) => group.outcome === "no-observed-change").length,
  };
}

export function summarizeRecording(recording: Recording): {
  actions: number;
  states: number;
  annotations: number;
  observedFeedback: number;
  lostActions: number;
  firstFeedbackMs: number | null;
  durationMs: number;
} {
  const map = buildStateMap(recording);
  const deltas = map.groups
    .map((group) => group.firstDelta)
    .filter((delta): delta is number => delta !== null);
  return {
    actions: map.actions.length,
    states: map.stateEvents.length,
    annotations: recording.annotations.length,
    observedFeedback: map.groups.filter((group) => group.outcome === "feedback").length,
    lostActions: map.lostCount,
    firstFeedbackMs: deltas.length ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length) : null,
    durationMs: recording.durationMs,
  };
}

export function formatDuration(ms: number): string {
  const safe = Math.max(0, Math.round(ms));
  if (safe < 1000) return `${safe}ms`;
  if (safe < 60000) return `${(safe / 1000).toFixed(safe < 10000 ? 2 : 1)}s`;
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.round((safe % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const tenths = Math.floor((total % 1000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

export function formatDelay(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "no observed change";
  if (ms < 1000) return `+${Math.round(ms)}ms`;
  return `+${(ms / 1000).toFixed(2)}s`;
}

export function shortUrl(url: string): string {
  if (!url) return "unknown page";
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return cleanText(url, 80);
  }
}
