import {
  OBSERVATION_WINDOW_MS,
  redactText,
  sanitizeUrl,
  type EventDraft,
  type EventKind,
} from "../../../lib/afterclick/schema.ts";
import {
  classifyFeedbackText,
  shortcutLabel,
} from "../../../lib/afterclick/classify.ts";
import {
  accessibleLabel,
  dialogSignature,
  feedbackRole,
  isDisabled,
  isInteractive,
  isVisible,
  liveRegion,
  loadingSignature,
  stableSelector,
  targetInfo,
  visibleText,
} from "../../../lib/afterclick/dom.ts";

type ContentConfig = {
  startedAt: string;
  startedAtMs: number;
  feedbackText: boolean;
  observationWindowMs: number;
  paused?: boolean;
};

type ActionWindow = {
  actionId: string;
  target: Element | null;
  selector: string;
  startedAt: number;
  initialDisabled: boolean;
  lastLabel: string;
  count: number;
  seen: Set<string>;
  timer: number;
};

type RecorderState = {
  recording: boolean;
  paused: boolean;
  config: ContentConfig | null;
  windows: Map<string, ActionWindow>;
  observer: MutationObserver | null;
  pollTimer: number | null;
  lastUrl: string;
  lastClickTarget: Element | null;
  lastClickAt: number;
  lastFocusKey: string;
  lastFocusAt: number;
  pending: MutationRecord[];
  flushTimer: number | null;
};

declare global {
  interface Window {
    __afterclickContentLoaded?: boolean;
    __afterclickRecorder?: {
      status: () => string;
    };
  }
}

const state: RecorderState = {
  recording: false,
  paused: false,
  config: null,
  windows: new Map(),
  observer: null,
  pollTimer: null,
  lastUrl: location.href,
  lastClickTarget: null,
  lastClickAt: 0,
  lastFocusKey: "",
  lastFocusAt: 0,
  pending: [],
  flushTimer: null,
};

const HISTORY_ATTRIBUTES = [
  "disabled",
  "aria-disabled",
  "aria-busy",
  "aria-hidden",
  "aria-live",
  "hidden",
  "open",
  "role",
  "data-state",
  "class",
  "style",
];

function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 14)
      : Math.random().toString(36).slice(2, 16);
  return `${prefix}_${random}`;
}

function send(message: unknown): void {
  try {
    void chrome.runtime.sendMessage(message).catch(() => {
      state.recording = false;
    });
  } catch {
    state.recording = false;
  }
}

function emit(draft: EventDraft): void {
  if (!state.recording || !state.config || state.paused) return;
  send({ type: "AFTERCLICK_EVENT", draft: { ...draft, at: draft.at ?? nowIso() } });
}

function pathOnly(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.hash}`.slice(0, 160) || "/";
  } catch {
    return sanitizeUrl(url);
  }
}

function addWindow(actionId: string, target: Element | null): void {
  if (state.windows.size >= 4) {
    const oldest = state.windows.keys().next().value;
    if (oldest) {
      const previous = state.windows.get(oldest);
      if (previous) clearTimeout(previous.timer);
      state.windows.delete(oldest);
    }
  }
  const info = targetInfo(target);
  const aw: ActionWindow = {
    actionId,
    target,
    selector: info?.selector ?? "",
    startedAt: performance.now(),
    initialDisabled: isDisabled(target),
    lastLabel: info?.label ?? "",
    count: 0,
    seen: new Set(),
    timer: 0,
  };
  aw.timer = window.setTimeout(() => {
    state.windows.delete(actionId);
  }, Math.max(1000, state.config?.observationWindowMs ?? OBSERVATION_WINDOW_MS));
  state.windows.set(actionId, aw);
  window.setTimeout(() => inspectTarget(aw), 45);
  window.setTimeout(() => inspectTarget(aw), 180);
}

function mostRecentWindow(): ActionWindow | null {
  const ids = Array.from(state.windows.keys()).reverse();
  for (const id of ids) {
    const aw = state.windows.get(id);
    if (aw) return aw;
  }
  return null;
}

function windowForElement(element: Element, allowGlobal: boolean): ActionWindow | null {
  const entries = Array.from(state.windows.values()).reverse();
  for (const aw of entries) {
    if (!aw.target?.isConnected && aw.selector) {
      aw.target = document.querySelector(aw.selector);
    }
    if (aw.target && (aw.target === element || aw.target.contains(element))) {
      return aw;
    }
  }
  if (!allowGlobal) return null;
  const recent = mostRecentWindow();
  if (recent && performance.now() - recent.startedAt < 3000) return recent;
  return null;
}

function record(aw: ActionWindow, draft: EventDraft, dedupe: string): void {
  if (!state.recording || !state.config) return;
  if (aw.count >= 8 || aw.seen.has(dedupe)) return;
  aw.seen.add(dedupe);
  aw.count += 1;
  emit({ ...draft, afterActionId: aw.actionId });
}

function targetMatches(aw: ActionWindow, element: Element): boolean {
  if (aw.target?.isConnected) {
    if (aw.target === element || aw.target.contains(element)) return true;
  }
  if (aw.selector) {
    return element.matches(aw.selector) || Boolean(element.closest(aw.selector));
  }
  return false;
}

function inspectTarget(aw: ActionWindow): void {
  if (!state.recording || !state.config || state.paused) return;
  const element = aw.target?.isConnected
    ? aw.target
    : aw.selector
      ? document.querySelector(aw.selector)
      : null;
  if (!element) return;
  aw.target = element;
  const disabled = isDisabled(element);
  if (disabled !== aw.initialDisabled) {
    aw.initialDisabled = disabled;
    record(
      aw,
      {
        family: "state",
        kind: disabled ? "control-disabled" : "control-enabled",
        target: targetInfo(element),
        changes: [
          {
            property: "disabled",
            from: String(!disabled),
            to: String(disabled),
            summary: disabled ? "Control became disabled" : "Control became enabled",
          },
        ],
        evidence: "observed",
        data: { source: "target-state" },
      },
      `disabled:${disabled}`,
    );
  }
  if (element.matches("button,a,input,summary,[role='button'],[role='link']")) {
    const label = targetInfo(element)?.label ?? "";
    if (label && label !== aw.lastLabel) {
      const from = aw.lastLabel;
      aw.lastLabel = label;
      record(
        aw,
        {
          family: "state",
          kind: "control-label-changed",
          target: targetInfo(element),
          changes: [
            {
              property: "label",
              from,
              to: label,
              summary: `Label changed from “${from || "empty"}” to “${label}”`,
            },
          ],
          evidence: "observed",
          data: { source: "target-label" },
        },
        `label:${label}`,
      );
    }
  }
}

function labeledTarget(element: Element): ReturnType<typeof targetInfo> {
  const info = targetInfo(element);
  if (info && state.config?.feedbackText && liveRegion(element)) {
    const text = visibleText(element, 80);
    if (text) info.label = redactText(text, 80);
  }
  return info;
}

function processLiveFeedback(element: Element, aw: ActionWindow): void {
  if (!state.config) return;
  if (!isVisible(element)) return;
  const text = visibleText(element, 220);
  if (!text) return;
  const type = classifyFeedbackText(text);
  const role = feedbackRole(element) || "live-region";
  if (!type && !liveRegion(element)) return;
  const safeText = state.config.feedbackText ? redactText(text, 180) : "";
  const className = `${element.getAttribute("class") ?? ""} ${element.getAttribute("id") ?? ""}`;
  const fallbackFeedback =
    !type &&
    /(toast|alert|notification|feedback|error|success|message|banner)/i.test(className);
  if (!type && !fallbackFeedback) return;
  const messageType = type ?? "info";
  record(
    aw,
    {
      family: "state",
      kind: "feedback-appeared",
      target: labeledTarget(element),
      evidence: "inferred",
      confidence: liveRegion(element) ? "medium" : "low",
      changes: [
        {
          property: "content",
          summary: `${messageType === "info" ? "Feedback" : messageType[0].toUpperCase() + messageType.slice(1)} message appeared`,
        },
      ],
      data: {
        messageType,
        source: role,
        ...(safeText ? { preview: safeText } : {}),
      },
      warnings: state.config.feedbackText
        ? ["Feedback text is user-enabled and redacted; review before sharing."]
        : [],
    },
    `feedback:${messageType}:${element === aw.target ? "target" : "new"}:${text.slice(0, 40)}`,
  );
}

function processLoading(element: Element, aw: ActionWindow, gone = false): void {
  const signature = loadingSignature(element);
  if (!signature) return;
  const isTarget = targetMatches(aw, element);
  if (!isTarget && !liveRegion(element) && !isVisible(element)) return;
  record(
    aw,
    {
      family: "state",
      kind: gone ? "loading-cleared" : "loading-appeared",
      target: labeledTarget(element),
      evidence: "observed",
      confidence: "high",
      changes: [
        {
          property: gone ? "loading-end" : "loading-start",
          summary: gone ? "Loading indicator cleared" : "Loading indicator appeared",
        },
      ],
      data: {
        source: /aria-busy/i.test(signature)
          ? "aria-busy"
          : /progressbar|progress/i.test(signature)
            ? "progress"
            : "descriptor",
      },
    },
    `loading:${gone ? "off" : "on"}:${stableSelector(element)}`,
  );
}

function processDialog(element: Element, aw: ActionWindow): void {
  if (!dialogSignature(element)) return;
  record(
    aw,
    {
      family: "state",
      kind: "dialog-appeared",
      target: targetInfo(element),
      evidence: "observed",
      changes: [{ property: "appeared", summary: "A dialog or modal appeared" }],
      data: { source: "role-or-semantics" },
    },
    `dialog:${stableSelector(element)}`,
  );
}

function processBusy(element: Element, aw: ActionWindow): void {
  const busy = element.getAttribute("aria-busy") === "true";
  if (!busy && !aw.seen.has("busy:on")) return;
  processLoading(element, aw, !busy);
}

function processElement(element: Element, aw: ActionWindow): void {
  if (!(element instanceof Element)) return;
  processDialog(element, aw);
  processLoading(element, aw);
  processBusy(element, aw);
  if (liveRegion(element)) processLiveFeedback(element, aw);
  else {
    const className = `${element.getAttribute("class") ?? ""} ${element.getAttribute("id") ?? ""}`;
    if (
      /(toast|alert|notification|feedback|error|success|message|banner)/i.test(className) &&
      visibleText(element, 80).length > 0
    ) {
      processLiveFeedback(element, aw);
    }
  }
  if (targetMatches(aw, element)) inspectTarget(aw);
}

function elementFromNode(node: Node | null): Element | null {
  if (!node) return null;
  if (node instanceof Element) return node;
  return node.parentElement;
}

function collectElements(node: Node, depth = 0): Element[] {
  if (!(node instanceof Element) || depth > 2) return [];
  const output: Element[] = [node];
  const candidates = node.querySelectorAll(
    "[role='alert'],[role='status'],[role='log'],[role='dialog'],[role='alertdialog'],[role='progressbar'],[aria-live],[aria-busy='true'],progress,dialog,[class*='spinner'],[class*='loader'],[class*='loading'],[class*='toast'],[class*='alert'],[class*='success'],[class*='error']",
  );
  for (const candidate of Array.from(candidates).slice(0, 16)) output.push(candidate);
  return output.slice(0, 18);
}

function flushMutations(): void {
  state.flushTimer = null;
  if (!state.recording || state.paused || !state.windows.size) {
    state.pending = [];
    return;
  }
  const records = state.pending.splice(0, 120);
  for (const mutation of records) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        const aw = windowForElement(elementFromNode(node) ?? document.body, true);
        if (!aw) return;
        for (const element of collectElements(node)) {
          processElement(element, aw);
        }
      });
      mutation.removedNodes.forEach((node) => {
        const element = elementFromNode(node);
        if (!element) return;
        const aw = windowForElement(element, true);
        if (!aw) return;
        if (loadingSignature(element)) processLoading(element, aw, true);
      });
    } else if (mutation.type === "attributes") {
      const element = elementFromNode(mutation.target);
      if (!element) continue;
      const aw = windowForElement(element, true);
      if (!aw) continue;
      if (mutation.attributeName === "aria-busy") processBusy(element, aw);
      processElement(element, aw);
    } else if (mutation.type === "characterData") {
      const element = elementFromNode(mutation.target);
      if (!element) continue;
      const aw = windowForElement(element, true);
      if (!aw) continue;
      if (liveRegion(element) || liveRegion(element.parentElement)) {
        processLiveFeedback(liveRegion(element) ? element : element.parentElement!, aw);
      }
      if (targetMatches(aw, element)) inspectTarget(aw);
    }
  }
}

function queueMutation(mutation: MutationRecord): void {
  if (!state.recording || state.paused || !state.windows.size) return;
  state.pending.push(mutation);
  if (state.flushTimer) return;
  state.flushTimer = window.setTimeout(flushMutations, 110);
}

function hrefChanged(): void {
  if (!state.recording || state.paused) return;
  if (location.href === state.lastUrl) return;
  const from = state.lastUrl;
  state.lastUrl = location.href;
  const recent = Array.from(state.windows.values()).reverse().find(
    (window) => performance.now() - window.startedAt < 1800,
  );
  emit({
    family: "navigation",
    kind: "route-change",
    title: `Route changed to ${pathOnly(location.href)}`,
    data: {
      path: pathOnly(location.href),
      from: pathOnly(from),
      method: "history-or-hash",
    },
    afterActionId: recent?.actionId,
    evidence: "observed",
    confidence: "high",
  });
}

function onClick(event: MouseEvent): void {
  if (!state.recording || state.paused) return;
  if (event.button !== 0) return;
  const raw = event.target instanceof Element ? event.target : null;
  const interactive = raw?.closest(
    "a,button,input,select,textarea,summary,label,[role='button'],[role='link'],[role='tab'],[role='menuitem'],[role='switch'],[role='checkbox'],[role='radio'],[role='option'],[onclick]",
  );
  const target = interactive ?? raw;
  if (!target || target === document.documentElement || target === document.body) return;
  if (target.closest("[contenteditable='true']")) return;
  if (document.getSelection()?.toString()) return;
  const info = targetInfo(target);
  const actionId = uid("act");
  const tag = target.tagName.toLowerCase();
  const pointerType =
    "pointerType" in event && typeof (event as PointerEvent).pointerType === "string"
      ? (event as PointerEvent).pointerType
      : "mouse";
  const data: Record<string, string | number | boolean> = {
    pointer: pointerType,
    observationWindowMs: state.config?.observationWindowMs ?? OBSERVATION_WINDOW_MS,
  };
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    data.modifiers = [
      event.ctrlKey ? "Ctrl" : "",
      event.metaKey ? "Meta" : "",
      event.shiftKey ? "Shift" : "",
      event.altKey ? "Alt" : "",
    ]
      .filter(Boolean)
      .join("+");
  }
  emit({
    id: actionId,
    family: "action",
    kind: "click",
    title: info?.label ? `Clicked “${info.label}”` : `Clicked <${tag}>`,
    target: info,
    data,
    evidence: "observed",
    confidence: "high",
  });
  state.lastClickTarget = target;
  state.lastClickAt = performance.now();
  addWindow(actionId, target);
}

function onSubmit(event: SubmitEvent): void {
  if (!state.recording || state.paused) return;
  if (event.target instanceof HTMLFormElement) {
    if (
      state.lastClickTarget &&
      performance.now() - state.lastClickAt < 700 &&
      event.target.contains(state.lastClickTarget)
    ) {
      return;
    }
    const submitter =
      event.submitter instanceof Element ? event.submitter : event.target;
    const info = targetInfo(submitter);
    const actionId = uid("act");
    emit({
      id: actionId,
      family: "action",
      kind: "submit",
      title: "Submitted a form",
      target: info,
      data: { trigger: event.submitter ? "control" : "keyboard-or-script" },
      evidence: "observed",
      confidence: "high",
    });
    addWindow(actionId, submitter);
  }
}

function onFocusIn(event: FocusEvent): void {
  if (!state.recording || state.paused) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target || target === document.body) return;
  if (!isInteractive(target)) return;
  if (
    state.lastClickTarget &&
    performance.now() - state.lastClickAt < 320 &&
    (state.lastClickTarget === target || state.lastClickTarget.contains(target))
  ) {
    return;
  }
  const info = targetInfo(target);
  const key = `${info?.selector ?? ""}:${info?.label ?? ""}`;
  if (key === state.lastFocusKey && performance.now() - state.lastFocusAt < 600) return;
  state.lastFocusKey = key;
  state.lastFocusAt = performance.now();
  emit({
    family: "focus",
    kind: "focus",
    title: info?.label ? `Focus moved to “${info.label}”` : "Focus moved",
    target: info,
    evidence: "observed",
    confidence: "high",
  });
}

function onKeyDown(event: KeyboardEvent): void {
  if (!state.recording || state.paused || event.isComposing || event.repeat) return;
  const shortcut = shortcutLabel({
    key: event.key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey,
    shiftKey: event.shiftKey,
  });
  if (!shortcut) return;
  const target = event.target instanceof Element ? event.target : null;
  const info = targetInfo(target);
  const actionId = uid("act");
  emit({
    id: actionId,
    family: "action",
    kind: "shortcut",
    title: `Shortcut ${shortcut}`,
    target: info,
    data: { keys: shortcut },
    evidence: "observed",
    confidence: "high",
  });
  addWindow(actionId, target);
}

function onPageHide(): void {
  if (!state.recording || !state.config) return;
  const recent = Array.from(state.windows.values()).reverse().find(
    (window) => performance.now() - window.startedAt < 2000,
  );
  send({
    type: "AFTERCLICK_PAGE_LEAVING",
    url: sanitizeUrl(location.href),
    afterActionId: recent?.actionId,
  });
}

function removeListeners(): void {
  document.removeEventListener("click", onClick, true);
  document.removeEventListener("submit", onSubmit, true);
  document.removeEventListener("focusin", onFocusIn, true);
  document.removeEventListener("keydown", onKeyDown, true);
  window.removeEventListener("pagehide", onPageHide);
  window.removeEventListener("popstate", hrefChanged);
  window.removeEventListener("hashchange", hrefChanged);
}

function bindListeners(): void {
  document.addEventListener("click", onClick, true);
  document.addEventListener("submit", onSubmit, true);
  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("popstate", hrefChanged);
  window.addEventListener("hashchange", hrefChanged);
}

function startObserver(): void {
  if (state.observer) state.observer.disconnect();
  state.observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) queueMutation(mutation);
  });
  state.observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: HISTORY_ATTRIBUTES,
    attributeOldValue: true,
    characterData: true,
  });
  if (state.pollTimer) window.clearInterval(state.pollTimer);
  state.pollTimer = window.setInterval(hrefChanged, 280);
}

function stopObserver(): void {
  state.observer?.disconnect();
  state.observer = null;
  if (state.pollTimer) window.clearInterval(state.pollTimer);
  state.pollTimer = null;
  if (state.flushTimer) window.clearTimeout(state.flushTimer);
  state.flushTimer = null;
  state.pending = [];
  for (const window of state.windows.values()) clearTimeout(window.timer);
  state.windows.clear();
}

function start(config: ContentConfig): { viewport: { width: number; height: number } } {
  stop();
  state.recording = true;
  state.paused = false;
  state.config = {
    ...config,
    observationWindowMs: Math.max(
      500,
      Math.min(config.observationWindowMs || OBSERVATION_WINDOW_MS, 15000),
    ),
  };
  state.lastUrl = location.href;
  state.lastFocusKey = "";
  state.lastFocusAt = 0;
  if (config.paused) {
    state.paused = true;
  } else {
    bindListeners();
    startObserver();
  }
  return { viewport: { width: window.innerWidth, height: window.innerHeight } };
}

function pause(): void {
  if (!state.recording) return;
  state.paused = true;
  removeListeners();
  stopObserver();
}

function resume(): void {
  if (!state.recording) return;
  state.paused = false;
  bindListeners();
  startObserver();
  state.lastUrl = location.href;
}

function stop(): void {
  state.recording = false;
  state.paused = false;
  state.config = null;
  removeListeners();
  stopObserver();
}

if (!window.__afterclickContentLoaded) {
  window.__afterclickContentLoaded = true;
  window.__afterclickRecorder = {
    status: () =>
      !state.recording ? "idle" : state.paused ? "paused" : "recording",
  };

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const type =
      message && typeof message === "object" && "type" in message
        ? String((message as { type: unknown }).type)
        : "";
    if (type === "AFTERCLICK_CONTENT_START") {
      const config = (message as { config?: ContentConfig }).config;
      if (!config) {
        sendResponse({ ok: false, error: "Missing recording configuration." });
        return;
      }
      sendResponse({ ok: true, ...start(config) });
      return;
    }
    if (type === "AFTERCLICK_CONTENT_PAUSE") {
      pause();
      sendResponse({ ok: true, status: "paused" });
      return;
    }
    if (type === "AFTERCLICK_CONTENT_RESUME") {
      resume();
      sendResponse({ ok: true, status: "recording" });
      return;
    }
    if (type === "AFTERCLICK_CONTENT_STOP") {
      stop();
      sendResponse({ ok: true, status: "idle" });
      return;
    }
    if (type === "AFTERCLICK_CONTENT_PING") {
      sendResponse({
        ok: true,
        status: !state.recording ? "idle" : state.paused ? "paused" : "recording",
        url: sanitizeUrl(location.href),
      });
      return;
    }
  });
}
