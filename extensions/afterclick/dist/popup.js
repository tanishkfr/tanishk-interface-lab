"use strict";
(() => {
  // lib/afterclick/schema.ts
  var MAX_FILE_BYTES = 6 * 1024 * 1024;
  function cleanText(value, max = 160) {
    if (typeof value !== "string") return "";
    const cleaned = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    return cleaned.length > max ? `${cleaned.slice(0, Math.max(0, max - 1))}\u2026` : cleaned;
  }
  function serializeRecording(recording) {
    return `${JSON.stringify(recording, null, 2)}
`;
  }
  function formatDuration(ms) {
    const safe = Math.max(0, Math.round(ms));
    if (safe < 1e3) return `${safe}ms`;
    if (safe < 6e4) return `${(safe / 1e3).toFixed(safe < 1e4 ? 2 : 1)}s`;
    const minutes = Math.floor(safe / 6e4);
    const seconds = Math.round(safe % 6e4 / 1e3);
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  function formatClock(ms) {
    const total = Math.max(0, Math.round(ms));
    const minutes = Math.floor(total / 6e4);
    const seconds = Math.floor(total % 6e4 / 1e3);
    const tenths = Math.floor(total % 1e3 / 100);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  }
  function shortUrl(url) {
    if (!url) return "unknown page";
    try {
      const parsed = new URL(url);
      return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`;
    } catch {
      return cleanText(url, 80);
    }
  }

  // extensions/afterclick/src/popup.ts
  var popupState = null;
  var transientError = "";
  var forceIdle = false;
  var busy = false;
  var lastAnnounce = "";
  var poll = null;
  var ticker = null;
  function byId(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing popup element: ${id}`);
    return element;
  }
  var views = {
    idle: byId("view-idle"),
    recording: byId("view-recording"),
    complete: byId("view-complete"),
    error: byId("view-error"),
    loading: byId("view-loading")
  };
  var consent = byId("consent");
  var feedbackToggle = byId("feedback-text");
  var startButton = byId("start");
  var pauseButton = byId("pause");
  var resumeButton = byId("resume");
  var stopButton = byId("stop");
  var checkpointNote = byId("checkpoint-note");
  var checkpointButton = byId("checkpoint");
  var exportButton = byId("export");
  var openStudioButton = byId("open-studio");
  var startAgainButton = byId("start-again");
  var clearButton = byId("clear");
  var retryButton = byId("retry");
  var errorExportButton = byId("error-export");
  var errorStudioButton = byId("error-open-studio");
  var statusLine = document.querySelector(".ac-statusline");
  var statusLabel = byId("status-label");
  var statusScope = byId("status-scope");
  var live = byId("live");
  var tape = byId("tape");
  var timer = byId("timer");
  var eventCount = byId("event-count");
  var actionCount = byId("action-count");
  var latest = byId("latest");
  var recordingMode = byId("recording-mode");
  var pausedWarning = byId("paused-warning");
  var completeEyebrow = byId("complete-eyebrow");
  var completeTitle = byId("complete-title");
  var completeDuration = byId("complete-duration");
  var completeEvents = byId("complete-events");
  var completeActions = byId("complete-actions");
  var completeMeta = byId("complete-meta");
  var errorTitle = byId("error-title");
  var errorMessage = byId("error-message");
  var consentTab = byId("consent-tab");
  function announce(text) {
    if (text === lastAnnounce) return;
    lastAnnounce = text;
    live.textContent = text;
  }
  function currentRecording() {
    return popupState?.active?.recording ?? popupState?.saved?.recording ?? null;
  }
  function userEvents(recording) {
    return recording.events.filter(
      (event) => event.kind !== "session-start" && event.kind !== "session-paused" && event.kind !== "session-resumed" && event.kind !== "session-end"
    );
  }
  function actions(recording) {
    return recording.events.filter(
      (event) => event.kind === "click" || event.kind === "shortcut" || event.kind === "submit"
    );
  }
  function setBusy(value) {
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
      retryButton
    ]) {
      button.disabled = value || button === startButton && !consent.checked;
    }
  }
  function show(view) {
    for (const [key, element] of Object.entries(views)) {
      element.hidden = key !== view;
    }
  }
  function setStatus(tone, label, scope = "local only") {
    if (statusLine) statusLine.dataset.tone = tone;
    statusLabel.textContent = label;
    statusScope.textContent = scope;
  }
  function renderTape(recording) {
    tape.replaceChildren();
    const events = userEvents(recording).filter((event) => event.family !== "focus");
    const duration = Math.max(1, recording.durationMs || Date.now() - Date.parse(recording.startedAt));
    const marks = events.slice(-70);
    if (!marks.length) {
      const empty = document.createElement("span");
      empty.className = "ac-tape-empty";
      empty.textContent = "tape empty \xB7 waiting for an action";
      tape.append(empty);
      return;
    }
    for (const event of marks) {
      const tick = document.createElement("span");
      tick.className = "ac-tick";
      tick.dataset.family = event.family;
      tick.style.left = `${Math.min(99, Math.max(0.5, event.t / duration * 100))}%`;
      tick.title = `${formatClock(event.t)} \xB7 ${event.title}`;
      tape.append(tick);
    }
    tape.setAttribute(
      "aria-label",
      `Activity tape: ${marks.length} visible marks across ${formatDuration(duration)}.`
    );
  }
  function renderLatest(recording) {
    const events = userEvents(recording);
    const last = events[events.length - 1];
    latest.replaceChildren();
    if (!last) {
      latest.textContent = "Listening for the first action.";
      return;
    }
    const label = document.createElement("strong");
    label.textContent = `${formatClock(last.t)} \xB7 ${last.family}`;
    const title = document.createElement("span");
    title.textContent = last.title;
    latest.append(label, title);
  }
  function updateTimer() {
    const active = popupState?.active;
    if (!active || active.status !== "recording" && active.status !== "paused") return;
    const end = active.status === "paused" && active.pausedAtMs ? active.pausedAtMs : Date.now();
    timer.textContent = formatClock(end - active.startedAtMs);
  }
  function renderRecording() {
    const active = popupState?.active;
    if (!active) return;
    const recording = active.recording;
    const paused = active.status === "paused";
    show("recording");
    recordingMode.textContent = paused ? "Paused \xB7 not observing" : "Recording this tab";
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
      shortUrl(recording.source.url)
    );
    announce(paused ? "Recording paused." : "Recording started.");
  }
  function renderComplete(recording, saved) {
    show("complete");
    const events = userEvents(recording);
    const acts = actions(recording);
    completeEyebrow.textContent = saved ? "Saved recording" : "Recording complete";
    completeTitle.innerHTML = saved ? "Your last<br />recording." : "A recording<br />you can inspect.";
    completeDuration.textContent = formatDuration(recording.durationMs);
    completeEvents.textContent = String(events.length);
    completeActions.textContent = String(acts.length);
    const when = new Date(recording.startedAt);
    completeMeta.textContent = `${shortUrl(recording.source.url)} \xB7 ${when.toLocaleString(void 0, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })} \xB7 ${recording.annotations.length} annotation${recording.annotations.length === 1 ? "" : "s"}`;
    setStatus("complete", saved ? "Saved locally" : "Recording complete", "not uploaded");
    announce(saved ? "Saved recording ready to export." : "Recording complete. Ready to export.");
  }
  function renderIdle() {
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
    startButton.innerHTML = 'Start recording <span aria-hidden="true">\u2192</span>';
    setStatus("idle", "Idle \xB7 ready", tab ? shortUrl(tab.url) : "local only");
  }
  function renderError(message, active) {
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
  function render() {
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
        active
      );
      return;
    }
    if (!forceIdle && popupState.saved) {
      renderComplete(popupState.saved.recording, true);
      return;
    }
    if (popupState.tab && !popupState.tab.supported) {
      renderError(
        "This page cannot be recorded. Open a normal http:// or https:// page, then open AFTERCLICK again."
      );
      return;
    }
    renderIdle();
  }
  async function loadState() {
    try {
      const message = { type: "AFTERCLICK_GET_STATE" };
      if (popupState?.tab?.id) message.tabId = popupState.tab.id;
      const response = await chrome.runtime.sendMessage(message);
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
      transientError = error instanceof Error ? `The recorder is unavailable. Reload the extension. (${error.message})` : "The recorder is unavailable. Reload the extension.";
      render();
    }
  }
  function downloadRecording() {
    const recording = currentRecording();
    if (!recording) return;
    try {
      const text = serializeRecording(recording);
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const slug = recording.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "recording";
      const stamp = recording.startedAt.slice(0, 19).replace(/[T:]/g, "-");
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `afterclick-${slug}-${stamp}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 15e3);
      announce("Recording exported as JSON.");
    } catch {
      transientError = "Chrome blocked the download. Open the Studio and try again.";
      render();
    }
  }
  async function sendAction(message) {
    setBusy(true);
    try {
      const response = await chrome.runtime.sendMessage(message);
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
    await chrome.runtime.sendMessage({ type: "AFTERCLICK_SET_SETTINGS", feedbackText: feedbackToggle.checked }).catch(() => void 0);
    if (popupState) popupState.settings.feedbackText = feedbackToggle.checked;
  });
  startButton.addEventListener("click", async () => {
    if (!consent.checked) return;
    const tab = popupState?.tab;
    const ok = await sendAction({
      type: "AFTERCLICK_START",
      tabId: tab?.id,
      consent: true,
      feedbackText: feedbackToggle.checked
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
      note: checkpointNote.value
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
      "Delete the locally saved recording? Export it first if you want to keep it."
    );
    if (!confirmed) return;
    await chrome.runtime.sendMessage({ type: "AFTERCLICK_CLEAR_SAVED" }).catch(() => void 0);
    forceIdle = true;
    await loadState();
    announce("Saved recording cleared.");
  });
  void loadState();
  poll = setInterval(() => {
    if (!document.hidden && !busy) void loadState();
  }, 1e3);
  ticker = setInterval(updateTimer, 100);
  window.addEventListener("unload", () => {
    if (poll) clearInterval(poll);
    if (ticker) clearInterval(ticker);
  });
})();
