import {
  addEvent,
  addManualCheckpoint,
  interruptSession,
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
  type RecordingSession,
} from "../../../lib/afterclick/session.ts";
import {
  appendEvent,
  parseRecording,
  sanitizeUrl,
  type EventDraft,
  type Recording,
} from "../../../lib/afterclick/schema.ts";

const ACTIVE_KEY = "afterclick.active.v1";
const LAST_KEY = "afterclick.lastCompleted.v1";
const SETTINGS_KEY = "afterclick.settings.v1";
const STUDIO_URL = "https://lab.tanishk.me/play/afterclick";
const CONSENT_STATEMENT =
  "I chose to record this tab with AFTERCLICK. It records local interaction events and observed UI changes only. It does not read form values or typed characters.";
const SUPPORTED = /^https?:\/\//i;

type Settings = { feedbackText: boolean };
type SavedRecording = { recording: Recording; savedAt: string };
type ActiveState = RecordingSession | null;

let activeCache: ActiveState | undefined;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function isSession(value: unknown): value is RecordingSession {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RecordingSession>;
  return (
    (item.status === "recording" ||
      item.status === "paused" ||
      item.status === "complete" ||
      item.status === "error") &&
    typeof item.tabId === "number" &&
    typeof item.startedAtMs === "number" &&
    Boolean(item.recording && typeof item.recording === "object")
  );
}

async function loadActive(): Promise<ActiveState> {
  if (activeCache !== undefined) return activeCache;
  try {
    const stored = await chrome.storage.session.get(ACTIVE_KEY);
    const value = stored[ACTIVE_KEY];
    activeCache = isSession(value) ? value : null;
  } catch {
    activeCache = null;
  }
  return activeCache;
}

async function persistActive(): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    if (activeCache) {
      await chrome.storage.session.set({ [ACTIVE_KEY]: activeCache });
    } else {
      await chrome.storage.session.remove(ACTIVE_KEY);
    }
  } catch {
    // A failed persistence must not stop the live recording. The popup can
    // still export the in-memory session until the worker is suspended.
  }
}

function persistSoon(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void persistActive();
  }, 240);
}

async function getSettings(): Promise<Settings> {
  try {
    const stored = await chrome.storage.local.get(SETTINGS_KEY);
    const value = stored[SETTINGS_KEY];
    if (value && typeof value === "object") {
      return { feedbackText: (value as { feedbackText?: unknown }).feedbackText === true };
    }
  } catch {
    // Defaults are privacy-first.
  }
  return { feedbackText: false };
}

async function setSettings(settings: Settings): Promise<void> {
  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  } catch {
    // Settings are convenient, not required.
  }
}

async function saveLast(recording: Recording): Promise<{ ok: boolean; error?: string }> {
  try {
    const saved: SavedRecording = { recording, savedAt: new Date().toISOString() };
    await chrome.storage.local.set({ [LAST_KEY]: saved });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Chrome storage rejected the recording.",
    };
  }
}

async function getLast(): Promise<SavedRecording | null> {
  try {
    const stored = await chrome.storage.local.get(LAST_KEY);
    const value = stored[LAST_KEY];
    if (!value || typeof value !== "object") return null;
    const item = value as { recording?: unknown; savedAt?: unknown };
    const parsed = parseRecording(item.recording);
    if (!parsed.ok) return null;
    return {
      recording: parsed.recording,
      savedAt:
        typeof item.savedAt === "string" && !Number.isNaN(Date.parse(item.savedAt))
          ? item.savedAt
          : parsed.recording.createdAt,
    };
  } catch {
    return null;
  }
}

async function badge(session: RecordingSession | null): Promise<void> {
  try {
    if (!session) {
      await chrome.action.setBadgeText({ text: "" });
      return;
    }
    const text = session.status === "paused" ? "II" : session.status === "recording" ? "REC" : "";
    await chrome.action.setBadgeText({ text, tabId: session.tabId });
    await chrome.action.setBadgeBackgroundColor({
      color: session.status === "paused" ? "#8a5300" : "#b3261e",
      tabId: session.tabId,
    });
  } catch {
    // Badge failures are cosmetic.
  }
}

function supported(url: string | undefined): boolean {
  return typeof url === "string" && SUPPORTED.test(url);
}

async function activeTabState(tabId?: number): Promise<{
  id: number;
  url: string;
  title: string;
  supported: boolean;
} | null> {
  try {
    let tab;
    if (typeof tabId === "number") {
      tab = await chrome.tabs.get(tabId);
    } else {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      tab = tabs[0];
    }
    if (!tab || typeof tab.id !== "number") return null;
    const url = tab.url ?? "";
    return {
      id: tab.id,
      url,
      title: tab.title ?? "",
      supported: supported(url),
    };
  } catch {
    return null;
  }
}

function statePayload(
  active: RecordingSession | null,
  saved: SavedRecording | null,
  settings: Settings,
  tab: Awaited<ReturnType<typeof activeTabState>>,
) {
  return {
    ok: true,
    now: Date.now(),
    active: active
      ? {
          status: active.status,
          tabId: active.tabId,
          startedAtMs: active.startedAtMs,
          pausedAtMs: active.pausedAtMs,
          endedAtMs: active.endedAtMs,
          error: active.error,
          endReason: active.endReason,
          recording: active.recording,
        }
      : null,
    saved,
    settings,
    tab,
    studioUrl: STUDIO_URL,
    consentStatement: CONSENT_STATEMENT,
  };
}

async function injectAndStart(
  tabId: number,
  config: {
    startedAt: string;
    startedAtMs: number;
    feedbackText: boolean;
    observationWindowMs: number;
    paused: boolean;
  },
): Promise<{ viewport: { width: number; height: number } } | { error: string }> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `AFTERCLICK could not enter this page: ${error.message}`
          : "AFTERCLICK could not enter this page.",
    };
  }
  try {
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: "AFTERCLICK_CONTENT_START",
      config,
    })) as { ok?: boolean; error?: string; viewport?: { width: number; height: number } };
    if (!response || response.ok !== true) {
      return { error: response?.error ?? "The page recorder did not start." };
    }
    return { viewport: response.viewport ?? { width: 0, height: 0 } };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `The page recorder did not answer: ${error.message}`
          : "The page recorder did not answer.",
    };
  }
}

async function startRecording(message: {
  tabId?: number;
  feedbackText?: boolean;
  consent?: boolean;
}) {
  const existing = await loadActive();
  if (existing && (existing.status === "recording" || existing.status === "paused")) {
    return {
      ok: false,
      error: "A recording is already in progress. Stop it before starting another.",
    };
  }
  if (message.consent !== true) {
    return { ok: false, error: "Confirm recording consent before starting." };
  }
  const tab = await activeTabState(message.tabId);
  if (!tab) return { ok: false, error: "No active tab was found." };
  if (!tab.supported) {
    return {
      ok: false,
      error:
        "This page cannot be recorded. Open a normal http:// or https:// page, not a browser settings page or the new tab page.",
    };
  }
  const settings = await getSettings();
  const feedbackText =
    typeof message.feedbackText === "boolean" ? message.feedbackText : settings.feedbackText;
  await setSettings({ feedbackText });
  const result = startSession({
    tabId: tab.id,
    url: tab.url,
    title: tab.title || tab.url,
    consentStatement: CONSENT_STATEMENT,
    feedbackText,
  });
  if (!result.ok) return result;
  const session = result.session;
  const injected = await injectAndStart(tab.id, {
    startedAt: session.recording.startedAt,
    startedAtMs: session.startedAtMs,
    feedbackText,
    observationWindowMs: session.recording.capture.observationWindowMs,
    paused: false,
  });
  if ("error" in injected) {
    return { ok: false, error: injected.error };
  }
  if (injected.viewport && injected.viewport.width > 0) {
    session.recording.source.viewport = injected.viewport;
  }
  activeCache = session;
  await persistActive();
  await badge(session);
  return { ok: true, state: statePayload(session, null, { feedbackText }, tab) };
}

async function stopAndSave(reason: "stopped" | "tab-closed" | "interrupted") {
  const session = await loadActive();
  if (!session) return { ok: false, error: "There is no recording to stop." };
  const result = stopSession(session, reason);
  if (!result.ok) return result;
  await chrome.tabs
    .sendMessage(session.tabId, { type: "AFTERCLICK_CONTENT_STOP" })
    .catch(() => undefined);
  const saved = await saveLast(session.recording);
  activeCache = null;
  await persistActive();
  await badge(null);
  const settings = await getSettings();
  const tab = await activeTabState(session.tabId);
  return {
    ok: true,
    saveError: saved.ok ? undefined : saved.error,
    state: statePayload(null, { recording: session.recording, savedAt: new Date().toISOString() }, settings, tab),
  };
}

async function handleMessage(
  message: unknown,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> {
  const type =
    message && typeof message === "object" && "type" in message
      ? String((message as { type: unknown }).type)
      : "";
  const payload = (message ?? {}) as Record<string, unknown>;

  if (type === "AFTERCLICK_EVENT") {
    const session = await loadActive();
    if (!session) return { ok: false, error: "No active session." };
    if (!sender.tab || sender.tab.id !== session.tabId) {
      return { ok: false, error: "Event came from a different tab." };
    }
    if (session.status === "complete" || session.status === "error") {
      return { ok: false, error: "The recording has ended." };
    }
    const draft = payload.draft;
    if (!draft || typeof draft !== "object") return { ok: false, error: "Empty event." };
    const result = addEvent(session, draft as EventDraft);
    if (!result.ok) return result;
    persistSoon();
    return { ok: true, eventId: result.eventId };
  }

  if (type === "AFTERCLICK_PAGE_LEAVING") {
    const session = await loadActive();
    if (!session || !sender.tab || sender.tab.id !== session.tabId) return { ok: true };
    if (session.status !== "recording") return { ok: true };
    const url = sanitizeUrl(payload.url);
    const draft: EventDraft = {
      family: "navigation",
      kind: "navigation",
      title: `Navigated to ${url || "another page"}`,
      data: { url, path: url, method: "document" },
      evidence: "observed",
      confidence: "high",
      at: new Date().toISOString(),
      ...(typeof payload.afterActionId === "string"
        ? { afterActionId: payload.afterActionId }
        : {}),
    };
    appendEvent(session.recording, draft);
    session.lastPageUrl = url;
    await persistActive();
    return { ok: true };
  }

  if (type === "AFTERCLICK_GET_STATE") {
    const active = await loadActive();
    const saved = await getLast();
    const settings = await getSettings();
    const requestedTab =
      typeof payload.tabId === "number" ? payload.tabId : active?.tabId;
    const tab = await activeTabState(requestedTab);
    return statePayload(active, saved, settings, tab);
  }

  if (type === "AFTERCLICK_START") {
    return startRecording({
      tabId: typeof payload.tabId === "number" ? payload.tabId : undefined,
      feedbackText: payload.feedbackText === true,
      consent: payload.consent === true,
    });
  }

  if (type === "AFTERCLICK_PAUSE") {
    const session = await loadActive();
    if (!session) return { ok: false, error: "There is no active recording." };
    const result = pauseSession(session);
    if (!result.ok) return result;
    activeCache = session;
    await chrome.tabs
      .sendMessage(session.tabId, { type: "AFTERCLICK_CONTENT_PAUSE" })
      .catch(() => undefined);
    await persistActive();
    await badge(session);
    return { ok: true, state: statePayload(session, null, await getSettings(), await activeTabState(session.tabId)) };
  }

  if (type === "AFTERCLICK_RESUME") {
    const session = await loadActive();
    if (!session) return { ok: false, error: "There is no paused recording." };
    const result = resumeSession(session);
    if (!result.ok) return result;
    activeCache = session;
    await chrome.tabs
      .sendMessage(session.tabId, { type: "AFTERCLICK_CONTENT_RESUME" })
      .catch(() => undefined);
    await persistActive();
    await badge(session);
    return { ok: true, state: statePayload(session, null, await getSettings(), await activeTabState(session.tabId)) };
  }

  if (type === "AFTERCLICK_STOP") {
    return stopAndSave("stopped");
  }

  if (type === "AFTERCLICK_CHECKPOINT") {
    const session = await loadActive();
    if (!session) return { ok: false, error: "Start a recording before adding a checkpoint." };
    const note =
      typeof payload.note === "string" ? payload.note.replace(/\s+/g, " ").trim().slice(0, 160) : "";
    const result = addManualCheckpoint(session, note);
    if (!result.ok) return result;
    activeCache = session;
    await persistActive();
    return { ok: true, eventId: result.eventId };
  }

  if (type === "AFTERCLICK_SET_SETTINGS") {
    const settings = { feedbackText: payload.feedbackText === true };
    await setSettings(settings);
    return { ok: true, settings };
  }

  if (type === "AFTERCLICK_CLEAR_SAVED") {
    const active = await loadActive();
    if (active && (active.status === "complete" || active.status === "error")) {
      activeCache = null;
      await persistActive();
    }
    await chrome.storage.local.remove(LAST_KEY);
    return { ok: true };
  }

  if (type === "AFTERCLICK_OPEN_STUDIO") {
    await chrome.tabs.create({ url: STUDIO_URL });
    return { ok: true };
  }

  return { ok: false, error: "Unknown AFTERCLICK message." };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "AFTERCLICK hit an unexpected error.",
      }),
    );
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  void (async () => {
    const session = await loadActive();
    if (!session || session.tabId !== tabId) return;
    if (session.status === "complete" || session.status === "error") return;
    if (!supported(tab.url)) {
      const result = interruptSession(
        session,
        "The tab left a normal web page, so capture stopped. The partial recording is still exportable.",
      );
      if (result.ok) {
        activeCache = session;
        await saveLast(session.recording);
        await persistActive();
        await badge(null);
      }
      return;
    }
    // A History API route change can also surface as tabs.onUpdated complete.
    // If the content recorder still answers, the document did not reload; let
    // its URL poller report the route without restarting observation.
    try {
      const ping = (await chrome.tabs.sendMessage(tabId, {
        type: "AFTERCLICK_CONTENT_PING",
      })) as { ok?: boolean; status?: string } | undefined;
      if (ping?.ok && ping.status && ping.status !== "idle") return;
    } catch {
      // No live recorder in this document: inject after the navigation.
    }
    const url = sanitizeUrl(tab.url);
    const injected = await injectAndStart(tabId, {
      startedAt: session.recording.startedAt,
      startedAtMs: session.startedAtMs,
      feedbackText: session.recording.capture.feedbackText,
      observationWindowMs: session.recording.capture.observationWindowMs,
      paused: session.status === "paused",
    });
    if ("error" in injected) {
      const result = interruptSession(
        session,
        "Navigation ended capture on this tab. This can happen when a page crosses origins. The partial recording is exportable.",
      );
      if (result.ok) {
        activeCache = session;
        await saveLast(session.recording);
        await persistActive();
        await badge(null);
      }
      return;
    }
    if (session.status === "recording" && url && url !== session.lastPageUrl) {
      session.lastPageUrl = url;
      appendEvent(session.recording, {
        family: "context",
        kind: "page-ready",
        title: "Page ready",
        at: new Date().toISOString(),
        data: { path: url, viewport: injected.viewport ? `${injected.viewport.width}×${injected.viewport.height}` : "unknown" },
        evidence: "observed",
      });
    }
    if (injected.viewport && injected.viewport.width > 0) {
      session.recording.source.viewport = injected.viewport;
    }
    activeCache = session;
    await persistActive();
  })().catch(() => undefined);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void (async () => {
    const session = await loadActive();
    if (!session || session.tabId !== tabId) return;
    const result = stopSession(session, "tab-closed");
    if (result.ok) {
      await saveLast(session.recording);
      activeCache = null;
      await persistActive();
      await badge(null);
    }
  })().catch(() => undefined);
});

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local
    .get(SETTINGS_KEY)
    .then((value) => {
      if (!value[SETTINGS_KEY]) {
        return chrome.storage.local.set({
          [SETTINGS_KEY]: { feedbackText: false } satisfies Settings,
        });
      }
      return undefined;
    })
    .catch(() => undefined);
});
