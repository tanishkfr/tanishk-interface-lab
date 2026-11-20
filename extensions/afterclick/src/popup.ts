import {
  formatClock,
  formatDuration,
  serializeRecording,
  shortUrl,
  type ACEvent,
  type Recording,
} from "../../../lib/afterclick/schema.ts";

type PopupRecordingState = {
  status: "recording" | "paused" | "complete" | "error";
  tabId: number;
  startedAtMs: number;
  pausedAtMs?: number;
  endedAtMs?: number;
  error?: string;
  endReason?: string;
  recording: Recording;
};

type PopupState = {
  ok: boolean;
  now: number;
  active: PopupRecordingState | null;
  saved: { recording: Recording; savedAt: string } | null;
  settings: { feedbackText: boolean };
  tab: { id: number; url: string; title: string; supported: boolean } | null;
  studioUrl: string;
  consentStatement: string;
  error?: string;
};

let popupState: PopupState | null = null;
let transientError = "";
let forceIdle = false;
let busy = false;
let lastAnnounce = "";
let poll: ReturnType<typeof setInterval> | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing popup element: ${id}`);
  return element as T;
}

const views = {
  idle: byId("view-idle"),
  recording: byId("view-recording"),
  complete: byId("view-complete"),
  error: byId("view-error"),
  loading: byId("view-loading"),
};

const consent = byId<HTMLInputElement>("consent");
const feedbackToggle = byId<HTMLInputElement>("feedback-text");
const startButton = byId<HTMLButtonElement>("start");
const pauseButton = byId<HTMLButtonElement>("pause");
const resumeButton = byId<HTMLButtonElement>("resume");
const stopButton = byId<HTMLButtonElement>("stop");
const checkpointNote = byId<HTMLInputElement>("checkpoint-note");
const checkpointButton = byId<HTMLButtonElement>("checkpoint");
const exportButton = byId<HTMLButtonElement>("export");
const openStudioButton = byId<HTMLButtonElement>("open-studio");
const startAgainButton = byId<HTMLButtonElement>("start-again");
const clearButton = byId<HTMLButtonElement>("clear");
const retryButton = byId<HTMLButtonElement>("retry");
const errorExportButton = byId<HTMLButtonElement>("error-export");
const errorStudioButton = byId<HTMLButtonElement>("error-open-studio");
const statusLine = document.querySelector<HTMLElement>(".ac-statusline");
const statusLabel = byId("status-label");
const statusScope = byId("status-scope");
const live = byId("live");
const tape = byId("tape");
const timer = byId("timer");
const eventCount = byId("event-count");
const actionCount = byId("action-count");
const latest = byId("latest");
const recordingMode = byId("recording-mode");
const pausedWarning = byId("paused-warning");
const completeEyebrow = byId("complete-eyebrow");
const completeTitle = byId("complete-title");
const completeDuration = byId("complete-duration");
const completeEvents = byId("complete-events");
const completeActions = byId("complete-actions");
const completeMeta = byId("complete-meta");
const errorTitle = byId("error-title");
const errorMessage = byId("error-message");
const consentTab = byId("consent-tab");

function announce(text: string): void {
  if (text === lastAnnounce) return;
  lastAnnounce = text;
  live.textContent = text;
}

function currentRecording(): Recording | null {
  return popupState?.active?.recording ?? popupState?.saved?.recording ?? null;
}

function userEvents(recording: Recording): ACEvent[] {
  return recording.events.filter(
    (event) =>
      event.kind !== "session-start" &&
      event.kind !== "session-paused" &&
      event.kind !== "session-resumed" &&
      event.kind !== "session-end",
  );
}

function actions(recording: Recording): ACEvent[] {
  return recording.events.filter(
    (event) => event.kind === "click" || event.kind === "shortcut" || event.kind === "submit",
  );
}

function setBusy(value: boolean): void {
  busy = value;
  for (const button of [
    startButton,
    pauseButton,
    resumeButton,
    stopButton,
    checkpointButton,
    exportButton,
    startAgainButton,
    clearButton,
    retryButton,
  ]) {
    button.disabled = value || (button === startButton && !consent.checked);
  }
}

function show(view: keyof typeof views): void {
  for (const [key, element] of Object.entries(views)) {
    element.hidden = key !== view;
  }
}

function setStatus(
  tone: "idle" | "recording" | "paused" | "complete" | "error",
  label: string,
  scope = "local only",
): void {
  if (statusLine) statusLine.dataset.tone = tone;
  statusLabel.textContent = label;
  statusScope.textContent = scope;
}

function renderTape(recording: Recording): void {
  tape.replaceChildren();
  const events = userEvents(recording).filter((event) => event.family !== "focus");
  const duration = Math.max(1, recording.durationMs || Date.now() - Date.parse(recording.startedAt));
  const marks = events.slice(-70);
  if (!marks.length) {
    const empty = document.createElement("span");
    empty.className = "ac-tape-empty";
    empty.textContent = "tape empty · waiting for an action";
    tape.append(empty);
    return;
  }
  for (const event of marks) {
    const tick = document.createElement("span");
    tick.className = "ac-tick";
    tick.dataset.family = event.family;
    tick.style.left = `${Math.min(99, Math.max(0.5, (event.t / duration) * 100))}%`;
    tick.title = `${formatClock(event.t)} · ${event.title}`;
    tape.append(tick);
  }
  tape.setAttribute(
    "aria-label",
    `Activity tape: ${marks.length} visible marks across ${formatDuration(duration)}.`,
  );
}

function renderLatest(recording: Recording): void {
  const events = userEvents(recording);
  const last = events[events.length - 1];
  latest.replaceChildren();
  if (!last) {
    latest.textContent = "Listening for the first action.";
    return;
  }
  const label = document.createElement("strong");
  label.textContent = `${formatClock(last.t)} · ${last.family}`;
  const title = document.createElement("span");
  title.textContent = last.title;
  latest.append(label, title);
}

function updateTimer(): void {
  const active = popupState?.active;
  if (!active || (active.status !== "recording" && active.status !== "paused")) return;
  const end =
    active.status === "paused" && active.pausedAtMs ? active.pausedAtMs : Date.now();
  timer.textContent = formatClock(end - active.startedAtMs);
}

function renderRecording(): void {
  const active = popupState?.active;
  if (!active) return;
  const recording = active.recording;
  const paused = active.status === "paused";
  show("recording");
  recordingMode.textContent = paused ? "Paused · not observing" : "Recording this tab";
  pauseButton.hidden = paused;
  resumeButton.hidden = !paused;
  pausedWarning.hidden = !paused;
  eventCount.textContent = String(userEvents(recording).length);
  actionCount.textContent = String(actions(recording).length);
  updateTimer();
  renderTape(recording);
  renderLatest(recording);
  timer.setAttribute("aria-label", `Elapsed time ${timer.textContent}`);
  setStatus(
    paused ? "paused" : "recording",
    paused ? "Paused" : "Recording",
    shortUrl(recording.source.url),
  );
  announce(paused ? "Recording paused." : "Recording started.");
}

function renderComplete(recording: Recording, saved: boolean): void {
  show("complete");
  const events = userEvents(recording);
  const acts = actions(recording);
  completeEyebrow.textContent = saved ? "Saved recording" : "Recording complete";
  completeTitle.innerHTML = saved ? "Your last<br />recording." : "A recording<br />you can inspect.";
  completeDuration.textContent = formatDuration(recording.durationMs);
  completeEvents.textContent = String(events.length);
  completeActions.textContent = String(acts.length);
  const when = new Date(recording.startedAt);
  completeMeta.textContent = `${shortUrl(recording.source.url)} · ${when.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })} · ${recording.annotations.length} annotation${recording.annotations.length === 1 ? "" : "s"}`;
  setStatus("complete", saved ? "Saved locally" : "Recording complete", "not uploaded");
  announce(saved ? "Saved recording ready to export." : "Recording complete. Ready to export.");
}

function renderIdle(): void {
  show("idle");
  const tab = popupState?.tab;
  const supported = Boolean(tab?.supported);
  startButton.disabled = busy || !supported || !consent.checked;
  consentTab.textContent = tab?.title ? shortUrl(tab.url) : "this tab";
  if (!supported && tab) {
    consent.disabled = true;
    startButton.textContent = "This page cannot be recorded";
    setStatus("error", "Unsupported page", "protected page");
    announce("This page cannot be recorded. Open a normal website.");
    return;
  }
  consent.disabled = false;
  startButton.innerHTML = 'Start recording <span aria-hidden="true">→</span>';
  setStatus("idle", "Idle · ready", tab ? shortUrl(tab.url) : "local only");
}

function renderError(message: string, active?: PopupRecordingState | null): void {
  show("error");
  const isInterrupted = Boolean(active?.error);
  errorTitle.innerHTML = isInterrupted ? "Capture<br />stopped." : "This page<br />is out of reach.";
  errorMessage.textContent = message;
  errorExportButton.hidden = !active?.recording;
  errorStudioButton.hidden = !active?.recording;
  retryButton.hidden = !popupState?.tab?.supported && !isInterrupted;
  setStatus("error", isInterrupted ? "Recording interrupted" : "Cannot record", "partial data local");
  announce(message);
}

function render(): void {
  if (busy) setBusy(true);
  if (!popupState) {
    show("loading");
    return;
  }
  if (transientError) {
    renderError(transientError);
    return;
  }
  const active = popupState.active;
  if (active && (active.status === "recording" || active.status === "paused")) {
    renderRecording();
    return;
  }
  if (forceIdle && (active?.status === "complete" || active?.status === "error")) {
    renderIdle();
    return;
  }
  if (active && active.status === "complete") {
    renderComplete(active.recording, false);
    return;
  }
  if (active && active.status === "error") {
    renderError(
      active.error ?? "The recording stopped before it finished. The partial capture is still exportable.",
      active,
    );
    return;
  }
  if (!forceIdle && popupState.saved) {
    renderComplete(popupState.saved.recording, true);
    return;
  }
  if (popupState.tab && !popupState.tab.supported) {
    renderError(
      "This page cannot be recorded. Open a normal http:// or https:// page, then open AFTERCLICK again.",
    );
    return;
  }
  renderIdle();
}

async function loadState(): Promise<void> {
  try {
    const message: Record<string, unknown> = { type: "AFTERCLICK_GET_STATE" };
    if (popupState?.tab?.id) message.tabId = popupState.tab.id;
    const response = (await chrome.runtime.sendMessage(message)) as PopupState;
    if (!response || response.ok !== true) {
      transientError = response?.error ?? "The recorder did not answer.";
      render();
      return;
    }
    popupState = response;
    feedbackToggle.checked = response.settings.feedbackText;
    if (!consent.dataset.initialised) {
      consent.dataset.initialised = "true";
    }
    render();
  } catch (error) {
    transientError =
      error instanceof Error
        ? `The recorder is unavailable. Reload the extension. (${error.message})`
        : "The recorder is unavailable. Reload the extension.";
    render();
  }
}

function downloadRecording(): void {
  const recording = currentRecording();
  if (!recording) return;
  try {
    const text = serializeRecording(recording);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const slug =
      recording.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "recording";
    const stamp = recording.startedAt.slice(0, 19).replace(/[T:]/g, "-");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `afterclick-${slug}-${stamp}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 15000);
    announce("Recording exported as JSON.");
  } catch {
    transientError = "Chrome blocked the download. Open the Studio and try again.";
    render();
  }
}

async function sendAction(message: Record<string, unknown>): Promise<boolean> {
  setBusy(true);
  try {
    const response = (await chrome.runtime.sendMessage(message)) as {
      ok?: boolean;
      error?: string;
      state?: PopupState;
    };
    if (!response || response.ok !== true) {
      transientError = response?.error ?? "The recorder did not complete that action.";
      setBusy(false);
      render();
      return false;
    }
    transientError = "";
    forceIdle = false;
    if (response.state) popupState = response.state;
    setBusy(false);
    await loadState();
    return true;
  } catch (error) {
    transientError = error instanceof Error ? error.message : "The recorder did not answer.";
    setBusy(false);
    render();
    return false;
  }
}

consent.addEventListener("change", () => {
  startButton.disabled = !consent.checked || busy || !popupState?.tab?.supported;
});

feedbackToggle.addEventListener("change", async () => {
  await chrome.runtime
    .sendMessage({ type: "AFTERCLICK_SET_SETTINGS", feedbackText: feedbackToggle.checked })
    .catch(() => undefined);
  if (popupState) popupState.settings.feedbackText = feedbackToggle.checked;
});

startButton.addEventListener("click", async () => {
  if (!consent.checked) return;
  const tab = popupState?.tab;
  const ok = await sendAction({
    type: "AFTERCLICK_START",
    tabId: tab?.id,
    consent: true,
    feedbackText: feedbackToggle.checked,
  });
  if (ok) consent.checked = false;
});

pauseButton.addEventListener("click", () => {
  void sendAction({ type: "AFTERCLICK_PAUSE" });
});

resumeButton.addEventListener("click", () => {
  void sendAction({ type: "AFTERCLICK_RESUME" });
});

stopButton.addEventListener("click", () => {
  void sendAction({ type: "AFTERCLICK_STOP" });
});

checkpointButton.addEventListener("click", async () => {
  const ok = await sendAction({
    type: "AFTERCLICK_CHECKPOINT",
    note: checkpointNote.value,
  });
  if (ok) checkpointNote.value = "";
});

checkpointNote.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    checkpointButton.click();
  }
});

exportButton.addEventListener("click", downloadRecording);
errorExportButton.addEventListener("click", downloadRecording);

openStudioButton.addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "AFTERCLICK_OPEN_STUDIO" });
});
errorStudioButton.addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "AFTERCLICK_OPEN_STUDIO" });
});

startAgainButton.addEventListener("click", () => {
  transientError = "";
  forceIdle = true;
  consent.checked = false;
  render();
  announce("Ready to start another recording.");
});

retryButton.addEventListener("click", () => {
  transientError = "";
  forceIdle = true;
  consent.checked = false;
  void loadState();
});

clearButton.addEventListener("click", async () => {
  const confirmed = window.confirm(
    "Delete the locally saved recording? Export it first if you want to keep it.",
  );
  if (!confirmed) return;
  await chrome.runtime.sendMessage({ type: "AFTERCLICK_CLEAR_SAVED" }).catch(() => undefined);
  forceIdle = true;
  await loadState();
  announce("Saved recording cleared.");
});

void loadState();
poll = setInterval(() => {
  if (!document.hidden && !busy) void loadState();
}, 1000);
ticker = setInterval(updateTimer, 100);
window.addEventListener("unload", () => {
  if (poll) clearInterval(poll);
  if (ticker) clearInterval(ticker);
});
