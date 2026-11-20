import { isActionKind, type ACEvent, type EventKind, type StateMapGroup } from "./schema.ts";

export const EVENT_LABELS: Record<EventKind, string> = {
  "session-start": "Session",
  "session-paused": "Pause",
  "session-resumed": "Resume",
  "page-ready": "Page",
  "session-end": "Session",
  click: "Click",
  shortcut: "Shortcut",
  submit: "Submit",
  focus: "Focus",
  navigation: "Navigation",
  "route-change": "Route",
  checkpoint: "Checkpoint",
  "control-disabled": "Disabled",
  "control-enabled": "Enabled",
  "control-label-changed": "Label",
  "loading-appeared": "Loading",
  "loading-cleared": "Loading ended",
  "feedback-appeared": "Feedback",
  "dialog-appeared": "Dialog",
  "state-changed": "State",
  warning: "Warning",
  interrupted: "Interrupted",
  unknown: "Unclassified",
};

export type EventTone =
  | "action"
  | "error"
  | "success"
  | "loading"
  | "navigation"
  | "manual"
  | "neutral"
  | "muted";

export function eventTone(event: ACEvent): EventTone {
  if (isActionKind(event.kind)) return "action";
  if (event.kind === "feedback-appeared") {
    const type = event.data?.messageType;
    if (type === "error") return "error";
    if (type === "success") return "success";
    if (type === "loading") return "loading";
    return "neutral";
  }
  if (event.kind === "control-disabled" || event.kind === "control-enabled") return "neutral";
  if (event.kind === "loading-appeared" || event.kind === "loading-cleared") return "loading";
  if (event.kind === "dialog-appeared") return "neutral";
  if (event.kind === "navigation" || event.kind === "route-change") return "navigation";
  if (event.kind === "checkpoint") return "manual";
  if (event.kind === "warning" || event.kind === "interrupted") return "error";
  if (event.kind === "focus") return "muted";
  return "neutral";
}

export function eventLabel(event: ACEvent): string {
  return EVENT_LABELS[event.kind] ?? "Event";
}

export function isFocusEvent(event: ACEvent): boolean {
  return event.family === "focus";
}

export function timelineBand(event: ACEvent): "action" | "state" | "context" {
  if (isActionKind(event.kind)) return "action";
  if (event.family === "state") return "state";
  return "context";
}

/** Consequence events worth showing in the compact state map. */
export function mapConsequences(group: StateMapGroup, limit = 3): {
  visible: ACEvent[];
  hidden: number;
} {
  const score = (event: ACEvent): number => {
    if (event.kind === "feedback-appeared") {
      if (event.data?.messageType === "error") return 100;
      if (event.data?.messageType === "success") return 96;
      return 88;
    }
    if (event.kind === "loading-appeared") return 80;
    if (event.kind === "control-disabled") return 72;
    if (event.kind === "control-enabled") return 58;
    if (event.kind === "dialog-appeared") return 76;
    if (event.kind === "route-change" || event.kind === "navigation") return 84;
    if (event.kind === "control-label-changed") return 32;
    return 20;
  };
  const ordered = [...group.consequences].sort((a, b) => {
    const difference = score(b) - score(a);
    return difference !== 0 ? difference : a.t - b.t;
  });
  const visible = ordered.slice(0, limit).sort((a, b) => a.t - b.t);
  return { visible, hidden: Math.max(0, group.consequences.length - visible.length) };
}

export function evidenceLabel(event: ACEvent): string {
  if (event.evidence === "manual") return "Manual note";
  if (event.evidence === "inferred") return "Inferred label";
  return "Observed fact";
}

export const DATA_LABELS: Record<string, string> = {
  messageType: "Message type",
  source: "Detection source",
  preview: "Feedback text",
  method: "Navigation method",
  keys: "Keys",
  note: "Checkpoint note",
  path: "Path",
  url: "URL",
  from: "From",
  pointer: "Pointer",
  modifiers: "Modifiers",
  viewport: "Viewport",
  observationWindowMs: "Observation window",
  trigger: "Trigger",
  paused: "Added while paused",
  reason: "End reason",
  feedbackText: "Feedback text enabled",
};

export function valueLabel(key: string, value: string | number | boolean): string {
  if (key === "observationWindowMs" && typeof value === "number") return `${value}ms`;
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}
