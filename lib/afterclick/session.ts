/**
 * Pure recording session state machine.
 *
 * The background worker stores a serialisable snapshot between service-worker
 * wakeups. Keeping transitions here makes start / pause / resume / stop /
 * interrupt behaviour testable without Chrome.
 */

import {
  appendEvent,
  createRecording,
  type Annotation,
  type EventDraft,
  type Recording,
  type RecordingSource,
} from "./schema.ts";

export type SessionStatus = "recording" | "paused" | "complete" | "error";

export type RecordingSession = {
  status: SessionStatus;
  tabId: number;
  recording: Recording;
  /** Epoch milliseconds; duplicated for cheap timers in the popup. */
  startedAtMs: number;
  pausedAtMs?: number;
  endedAtMs?: number;
  error?: string;
  endReason?: "stopped" | "tab-closed" | "interrupted";
  lastPageUrl?: string;
};

export type SessionResult =
  | { ok: true; session: RecordingSession }
  | { ok: false; error: string };

export type StartInput = {
  tabId: number;
  url: string;
  title: string;
  consentStatement: string;
  feedbackText?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  startedAt?: string;
};

export function startSession(input: StartInput): SessionResult {
  if (!Number.isInteger(input.tabId) || input.tabId < 0) {
    return { ok: false, error: "No recordable tab was selected." };
  }
  if (!/^https?:\/\//i.test(input.url)) {
    return {
      ok: false,
      error: "This page cannot be recorded. Open a normal http:// or https:// page.",
    };
  }
  if (!input.consentStatement.trim()) {
    return { ok: false, error: "Recording consent was not confirmed." };
  }
  const recording = createRecording({
    url: input.url,
    title: input.title,
    startedAt: input.startedAt,
    viewport: input.viewport,
    userAgent: input.userAgent,
    consentStatement: input.consentStatement,
    feedbackText: input.feedbackText,
  });
  const session: RecordingSession = {
    status: "recording",
    tabId: input.tabId,
    startedAtMs: Date.parse(recording.startedAt),
    recording,
    lastPageUrl: recording.source.url,
  };
  appendEvent(recording, {
    family: "context",
    kind: "page-ready",
    title: "Page ready",
    data: {
      path: new URL(input.url).pathname || "/",
      viewport: input.viewport
        ? `${input.viewport.width}×${input.viewport.height}`
        : "unknown",
    },
    at: recording.startedAt,
    evidence: "observed",
  });
  appendEvent(recording, {
    family: "context",
    kind: "session-start",
    title: "Recording started",
    at: recording.startedAt,
    data: {
      feedbackText: input.feedbackText === true,
      observationWindowMs: recording.capture.observationWindowMs,
    },
    evidence: "manual",
  });
  return { ok: true, session };
}

export function addEvent(
  session: RecordingSession,
  draft: EventDraft,
): { ok: boolean; eventId?: string; error?: string } {
  if (session.status === "complete" || session.status === "error") {
    return { ok: false, error: "The recording has already ended." };
  }
  if (session.status === "paused" && draft.kind !== "checkpoint") {
    return { ok: false, error: "The recording is paused." };
  }
  const event = appendEvent(session.recording, draft);
  return event ? { ok: true, eventId: event.id } : { ok: false, error: "Event not stored." };
}

export function pauseSession(session: RecordingSession): SessionResult {
  if (session.status !== "recording") {
    return { ok: false, error: "Only a recording session can be paused." };
  }
  const at = new Date().toISOString();
  session.status = "paused";
  session.pausedAtMs = Date.parse(at);
  appendEvent(session.recording, {
    family: "context",
    kind: "session-paused",
    title: "Recording paused",
    at,
    evidence: "manual",
  });
  return { ok: true, session };
}

export function resumeSession(session: RecordingSession): SessionResult {
  if (session.status !== "paused") {
    return { ok: false, error: "Only a paused session can resume." };
  }
  session.status = "recording";
  delete session.pausedAtMs;
  appendEvent(session.recording, {
    family: "context",
    kind: "session-resumed",
    title: "Recording resumed",
    at: new Date().toISOString(),
    evidence: "manual",
  });
  return { ok: true, session };
}

export function stopSession(
  session: RecordingSession,
  reason: "stopped" | "tab-closed" | "interrupted" = "stopped",
): SessionResult {
  if (session.status === "complete") return { ok: true, session };
  if (session.status === "error") return { ok: false, error: session.error ?? "The session failed." };
  const endedAt = new Date().toISOString();
  session.status = "complete";
  session.endedAtMs = Date.parse(endedAt);
  session.endReason = reason;
  delete session.pausedAtMs;
  session.recording.endedAt = endedAt;
  session.recording.durationMs = Math.max(
    session.recording.durationMs,
    Date.parse(endedAt) - session.startedAtMs,
  );
  appendEvent(session.recording, {
    family: "context",
    kind: "session-end",
    title:
      reason === "tab-closed"
        ? "Recording ended: tab closed"
        : reason === "interrupted"
          ? "Recording interrupted"
          : "Recording stopped",
    at: endedAt,
    data: { reason },
    evidence: "observed",
  });
  return { ok: true, session };
}

export function interruptSession(session: RecordingSession, message: string): SessionResult {
  if (session.status === "complete" || session.status === "error") {
    return { ok: false, error: "The session has already ended." };
  }
  const endedAt = new Date().toISOString();
  appendEvent(session.recording, {
    family: "system",
    kind: "interrupted",
    title: "Recording interrupted",
    at: endedAt,
    data: { message },
    evidence: "observed",
    warnings: [message],
  });
  session.status = "error";
  session.error = message;
  session.endedAtMs = Date.parse(endedAt);
  session.endReason = "interrupted";
  session.recording.endedAt = endedAt;
  session.recording.durationMs = Math.max(
    session.recording.durationMs,
    Date.parse(endedAt) - session.startedAtMs,
  );
  return { ok: true, session };
}

export function addManualCheckpoint(
  session: RecordingSession,
  note: string,
): { ok: boolean; eventId?: string; error?: string } {
  if (session.status !== "recording" && session.status !== "paused") {
    return { ok: false, error: "Start a recording before adding a checkpoint." };
  }
  return addEvent(session, {
    family: "manual",
    kind: "checkpoint",
    title: note ? `Manual checkpoint: ${note}` : "Manual checkpoint",
    note,
    data: { note: note || "none", paused: session.status === "paused" },
    evidence: "manual",
  });
}

export function addSessionAnnotation(
  session: RecordingSession,
  eventId: string,
  text: string,
): Annotation | null {
  const clean = text.trim();
  if (!clean) return null;
  if (!session.recording.events.some((event) => event.id === eventId)) return null;
  const annotation: Annotation = {
    id: `note_${session.recording.annotations.length}_${Math.random().toString(36).slice(2, 7)}`,
    eventId,
    text: clean.slice(0, 1000),
    createdAt: new Date().toISOString(),
  };
  session.recording.annotations.push(annotation);
  return annotation;
}

export function elapsedMs(session: RecordingSession, now = Date.now()): number {
  if (session.status === "paused" && session.pausedAtMs) return session.pausedAtMs - session.startedAtMs;
  if (session.status === "complete" && session.endedAtMs) return session.endedAtMs - session.startedAtMs;
  if (session.status === "error" && session.endedAtMs) return session.endedAtMs - session.startedAtMs;
  return Math.max(0, now - session.startedAtMs);
}

export function activeEventCount(session: RecordingSession): number {
  return session.recording.events.filter(
    (event) =>
      event.kind !== "session-end" &&
      event.kind !== "session-paused" &&
      event.kind !== "session-resumed" &&
      event.kind !== "session-start",
  ).length;
}

export function sessionSource(session: RecordingSession): RecordingSource {
  return session.recording.source;
}
