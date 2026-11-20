"use strict";
(() => {
  // lib/afterclick/schema.ts
  var SCHEMA_ID = "afterclick.recording";
  var SCHEMA_VERSION = 1;
  var PRODUCER_VERSION = "0.1.0";
  var MAX_EVENTS = 1200;
  var MAX_ANNOTATIONS = 400;
  var MAX_FILE_BYTES = 6 * 1024 * 1024;
  var OBSERVATION_WINDOW_MS = 4e3;
  var ACTION_KINDS = /* @__PURE__ */ new Set(["click", "shortcut", "submit"]);
  var KNOWN_FAMILIES = /* @__PURE__ */ new Set([
    "action",
    "state",
    "navigation",
    "focus",
    "manual",
    "context",
    "system"
  ]);
  var KNOWN_KINDS = /* @__PURE__ */ new Set([
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
    "unknown"
  ]);
  var INPUT_TYPES = /* @__PURE__ */ new Set([
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
    "week"
  ]);
  var SENSITIVE_INPUT_TYPES = /* @__PURE__ */ new Set(["password", "hidden", "file"]);
  function isActionKind(kind) {
    return ACTION_KINDS.has(kind);
  }
  function isSensitiveInputType(type) {
    return type ? SENSITIVE_INPUT_TYPES.has(type.toLowerCase()) : false;
  }
  function cleanText(value, max = 160) {
    if (typeof value !== "string") return "";
    const cleaned = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    return cleaned.length > max ? `${cleaned.slice(0, Math.max(0, max - 1))}\u2026` : cleaned;
  }
  function redactText(value, max = 160) {
    return cleanText(value, max * 2).replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]").replace(/\+?\d[\d\s().-]{8,}\d/g, (match) => {
      const digits = (match.match(/\d/g) ?? []).length;
      return digits >= 9 ? "[number]" : match;
    }).replace(/\b(?:bearer|token|secret|api[_-]?key)\s*[:=]\s*\S+/gi, "[redacted]").replace(
      /\b[A-Za-z0-9_-]{32,}\b/g,
      (token) => /\d/.test(token) && /[A-Za-z]/.test(token) ? "[token]" : token
    ).slice(0, max);
  }
  function sanitizeUrl(value) {
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
  function safeTarget(target) {
    if (!target || typeof target !== "object") return void 0;
    const tag = cleanText(target.tag, 40).toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!tag) return void 0;
    const inputType = typeof target.inputType === "string" && INPUT_TYPES.has(target.inputType.toLowerCase()) ? target.inputType.toLowerCase() : void 0;
    const role = typeof target.role === "string" && /^[a-z-]{1,32}$/i.test(target.role) ? target.role.toLowerCase() : void 0;
    const sensitive = isSensitiveInputType(inputType) || target.redacted === true;
    const label = sensitive ? "[redacted]" : redactText(target.label, 96);
    const selector = cleanText(target.selector, 160).replace(/[<>]/g, "");
    return {
      tag,
      ...role ? { role } : {},
      ...label ? { label } : {},
      ...inputType ? { inputType } : {},
      ...selector ? { selector } : {},
      ...typeof target.disabled === "boolean" ? { disabled: target.disabled } : {},
      ...typeof target.hidden === "boolean" ? { hidden: target.hidden } : {},
      ...sensitive ? { redacted: true } : {}
    };
  }
  function number(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }
  function isoOr(value, fallback) {
    if (typeof value !== "string") return fallback;
    const time = Date.parse(value);
    return Number.isNaN(time) ? fallback : new Date(time).toISOString();
  }
  function nowIso() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  function id(prefix, seed = 0) {
    const random = Math.random().toString(36).slice(2, 9);
    return `${prefix}_${seed.toString(36)}${random}`;
  }
  function primitiveData(data) {
    if (!data || typeof data !== "object") return void 0;
    const output = {};
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
    return Object.keys(output).length ? output : void 0;
  }
  function safeChanges(changes) {
    if (!Array.isArray(changes)) return void 0;
    const output = [];
    for (const change of changes.slice(0, 8)) {
      if (!change || typeof change !== "object") continue;
      const property = cleanText(change.property, 40).replace(/[^a-zA-Z0-9_-]/g, "");
      const summary = redactText(change.summary, 140);
      if (!property || !summary) continue;
      output.push({
        property,
        summary,
        ...change.from !== void 0 ? { from: redactText(change.from, 100) } : {},
        ...change.to !== void 0 ? { to: redactText(change.to, 100) } : {}
      });
    }
    return output.length ? output : void 0;
  }
  function describeEvent(kind, target, data) {
    const label = target?.label ? `\u201C${target.label}\u201D` : target?.role ?? target?.tag ?? "";
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
  function fallbackFamily(kind) {
    if (ACTION_KINDS.has(kind)) return "action";
    if (kind === "focus") return "focus";
    if (kind === "navigation" || kind === "route-change") return "navigation";
    if (kind === "checkpoint") return "manual";
    if (kind === "session-start" || kind === "session-paused" || kind === "session-resumed" || kind === "page-ready" || kind === "session-end")
      return "context";
    if (kind === "warning" || kind === "interrupted" || kind === "unknown") return "system";
    return "state";
  }
  function createRecording(input) {
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
        ...input.viewport ? { viewport: input.viewport } : {},
        ...input.userAgent ? { userAgent: cleanText(input.userAgent, 220) } : {}
      },
      consent: {
        grantedAt: startedAt,
        statement: cleanText(input.consentStatement, 280),
        textCollection: input.feedbackText === true
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
          Math.min(15e3, number(input.observationWindowMs, OBSERVATION_WINDOW_MS))
        )
      },
      events: [],
      annotations: []
    };
  }
  function appendEvent(recording, draft) {
    if (!draft || typeof draft !== "object") return null;
    if (recording.events.length >= MAX_EVENTS) {
      const last2 = recording.events[recording.events.length - 1];
      if (!last2 || last2.kind !== "warning") {
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
            detail: `Only the first ${MAX_EVENTS} events are kept.`
          },
          evidence: "observed",
          warnings: ["Recording event limit reached."]
        });
      }
      return null;
    }
    const kind = KNOWN_KINDS.has(draft.kind) ? draft.kind : "unknown";
    const at = isoOr(draft.at, nowIso());
    const offset = Math.max(0, Date.parse(at) - Date.parse(recording.startedAt));
    const last = recording.events[recording.events.length - 1];
    const target = safeTarget(draft.target);
    const targetKey = target ? `${target.tag}:${target.role ?? ""}:${target.label ?? ""}:${target.inputType ?? ""}` : "";
    if (last && ACTION_KINDS.has(kind) && last.kind === kind && offset - last.t < 180 && (last.target?.label ?? "") === (target?.label ?? "") && (last.target?.tag ?? "") === (target?.tag ?? "")) {
      return last;
    }
    const family = draft.family && KNOWN_FAMILIES.has(draft.family) ? draft.family : fallbackFamily(kind);
    const data = primitiveData(draft.data);
    const event = {
      id: (() => {
        const candidate = cleanText(draft.id, 80).replace(/[^a-zA-Z0-9_-]/g, "");
        return candidate && !recording.events.some((item) => item.id === candidate) ? candidate : id("evt", recording.events.length);
      })(),
      seq: recording.events.length,
      t: offset,
      at,
      family,
      kind,
      title: redactText(draft.title || describeEvent(kind, target, data), 160),
      evidence: draft.evidence === "inferred" || draft.evidence === "manual" ? draft.evidence : "observed",
      ...target ? { target } : {},
      ...draft.confidence ? { confidence: draft.confidence } : {},
      ...draft.afterActionId ? { afterActionId: cleanText(draft.afterActionId, 80) } : {},
      ...data ? { data } : {},
      ...draft.note ? { note: redactText(draft.note, 240) } : {},
      ...Array.isArray(draft.warnings) && draft.warnings.length ? { warnings: draft.warnings.slice(0, 4).map((warning) => redactText(warning, 160)) } : {}
    };
    const changes = safeChanges(draft.changes);
    if (changes) event.changes = changes;
    const action = event.afterActionId ? recording.events.find((item) => item.id === event.afterActionId && isActionKind(item.kind)) : void 0;
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
  function parseRecording(value) {
    const warnings = [];
    if (!value || typeof value !== "object") {
      return { ok: false, error: "This file is not an AFTERCLICK recording.", details: [] };
    }
    const input = value;
    if (input.schema !== SCHEMA_ID) {
      if (typeof input.schema === "string" && input.schema.startsWith("afterclick")) {
        return {
          ok: false,
          error: "This file uses a different AFTERCLICK schema.",
          details: [`Found \u201C${cleanText(input.schema, 80)}\u201D; expected \u201C${SCHEMA_ID}\u201D.`]
        };
      }
      return {
        ok: false,
        error: "This JSON is not an AFTERCLICK recording.",
        details: ["The required schema identifier is missing."]
      };
    }
    const version = number(input.version, -1);
    if (version !== SCHEMA_VERSION) {
      return {
        ok: false,
        error: version > SCHEMA_VERSION ? "This recording was made by a newer AFTERCLICK version." : "This recording uses an unsupported AFTERCLICK version.",
        details: [
          `File version: ${version >= 0 ? version : "unknown"}. This Studio reads version ${SCHEMA_VERSION}.`,
          version > SCHEMA_VERSION ? "Update the Studio or re-export from a matching extension build." : "Re-export the recording from AFTERCLICK v0.1.0."
        ]
      };
    }
    const startedAt = isoOr(input.startedAt, nowIso());
    const startedMs = Date.parse(startedAt);
    const endedAt = typeof input.endedAt === "string" ? isoOr(input.endedAt, "") : "";
    const endedMs = endedAt ? Date.parse(endedAt) : null;
    const durationMs = endedMs !== null ? Math.max(0, endedMs - startedMs) : Math.max(0, number(input.durationMs, 0));
    const sourceInput = input.source && typeof input.source === "object" ? input.source : {};
    const sourceViewport = sourceInput.viewport && typeof sourceInput.viewport === "object" ? sourceInput.viewport : null;
    const source = {
      url: sanitizeUrl(sourceInput.url),
      title: redactText(sourceInput.title, 160) || "Untitled page",
      ...sourceViewport ? {
        viewport: {
          width: Math.max(1, Math.min(1e4, number(sourceViewport.width, 1))),
          height: Math.max(1, Math.min(1e4, number(sourceViewport.height, 1)))
        }
      } : {},
      ...typeof sourceInput.userAgent === "string" ? { userAgent: cleanText(sourceInput.userAgent, 220) } : {}
    };
    const consentInput = input.consent && typeof input.consent === "object" ? input.consent : {};
    const consent = {
      grantedAt: typeof consentInput.grantedAt === "string" ? isoOr(consentInput.grantedAt, "") : "",
      statement: cleanText(consentInput.statement, 280),
      textCollection: consentInput.textCollection === true
    };
    if (!consent.grantedAt) {
      warnings.push("The file does not declare when recording consent was granted.");
    }
    const captureInput = input.capture && typeof input.capture === "object" ? input.capture : {};
    const capture = {
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
        Math.min(15e3, number(captureInput.observationWindowMs, OBSERVATION_WINDOW_MS))
      )
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
    const events = [];
    const usedIds = /* @__PURE__ */ new Set();
    rawEvents.slice(0, MAX_EVENTS).forEach((raw, index) => {
      if (!raw || typeof raw !== "object") {
        warnings.push(`Event ${index + 1} is not an object and was skipped.`);
        return;
      }
      const item = raw;
      let kind = KNOWN_KINDS.has(item.kind) ? item.kind : "unknown";
      if (kind === "unknown" && item.kind !== "unknown") {
        warnings.push(`Event ${index + 1} has an unknown kind and is shown as unclassified.`);
      }
      const family = KNOWN_FAMILIES.has(item.family) ? item.family : fallbackFamily(kind);
      const at = isoOr(item.at, new Date(startedMs + Math.max(0, number(item.t, 0))).toISOString());
      const target = safeTarget(item.target);
      const changes = safeChanges(item.changes);
      const data = primitiveData(item.data);
      let idValue = cleanText(item.id, 80).replace(/[^a-zA-Z0-9_-]/g, "");
      if (!idValue || usedIds.has(idValue)) idValue = id(`evt${index}`, index);
      usedIds.add(idValue);
      const event = {
        id: idValue,
        seq: events.length,
        t: Math.max(0, number(item.t, Date.parse(at) - startedMs)),
        at,
        family,
        kind,
        title: redactText(item.title || describeEvent(kind, target, data), 160) || "Event",
        evidence: item.evidence === "inferred" || item.evidence === "manual" ? item.evidence : "observed",
        ...target ? { target } : {},
        ...item.confidence === "high" || item.confidence === "medium" || item.confidence === "low" ? { confidence: item.confidence } : {},
        ...data ? { data } : {},
        ...typeof item.note === "string" ? { note: redactText(item.note, 240) } : {},
        ...Array.isArray(item.warnings) ? {
          warnings: item.warnings.slice(0, 4).map((warning) => redactText(warning, 160)).filter(Boolean)
        } : {},
        ...changes ? { changes } : {}
      };
      events.push(event);
    });
    events.sort((a, b) => a.t - b.t);
    events.forEach((event, index) => {
      event.seq = index;
      event.afterActionId = void 0;
      event.deltaMs = void 0;
    });
    for (const raw of rawEvents.slice(0, MAX_EVENTS)) {
      if (!raw || typeof raw !== "object") continue;
      const item = raw;
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
    const annotations = [];
    rawAnnotations.slice(0, MAX_ANNOTATIONS).forEach((raw, index) => {
      if (!raw || typeof raw !== "object") return;
      const item = raw;
      const eventId = cleanText(item.eventId, 80);
      const text = redactText(item.text, 1e3);
      if (!text) return;
      if (!events.some((event) => event.id === eventId)) {
        warnings.push(`Annotation ${index + 1} refers to a missing event and was skipped.`);
        return;
      }
      annotations.push({
        id: cleanText(item.id, 80) || id("note", index),
        eventId,
        text,
        createdAt: isoOr(item.createdAt, nowIso())
      });
    });
    const producerInput = input.producer && typeof input.producer === "object" ? input.producer : {};
    const producerKind = producerInput.kind === "extension" || producerInput.kind === "studio" ? producerInput.kind : "unknown";
    const recording = {
      schema: SCHEMA_ID,
      version: SCHEMA_VERSION,
      id: cleanText(input.id, 80) || id("rec", 0),
      title: redactText(input.title, 120) || "Untitled recording",
      createdAt: isoOr(input.createdAt, startedAt),
      startedAt,
      ...endedAt ? { endedAt } : {},
      durationMs: computedDuration,
      producer: {
        name: "AFTERCLICK",
        kind: producerKind,
        version: cleanText(producerInput.version, 40) || "unknown"
      },
      source,
      consent,
      capture,
      events,
      annotations,
      ...typeof input.notes === "string" ? { notes: redactText(input.notes, 2e3) } : {}
    };
    return { ok: true, recording, warnings };
  }

  // lib/afterclick/session.ts
  function startSession(input) {
    if (!Number.isInteger(input.tabId) || input.tabId < 0) {
      return { ok: false, error: "No recordable tab was selected." };
    }
    if (!/^https?:\/\//i.test(input.url)) {
      return {
        ok: false,
        error: "This page cannot be recorded. Open a normal http:// or https:// page."
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
      feedbackText: input.feedbackText
    });
    const session = {
      status: "recording",
      tabId: input.tabId,
      startedAtMs: Date.parse(recording.startedAt),
      recording,
      lastPageUrl: recording.source.url
    };
    appendEvent(recording, {
      family: "context",
      kind: "page-ready",
      title: "Page ready",
      data: {
        path: new URL(input.url).pathname || "/",
        viewport: input.viewport ? `${input.viewport.width}\xD7${input.viewport.height}` : "unknown"
      },
      at: recording.startedAt,
      evidence: "observed"
    });
    appendEvent(recording, {
      family: "context",
      kind: "session-start",
      title: "Recording started",
      at: recording.startedAt,
      data: {
        feedbackText: input.feedbackText === true,
        observationWindowMs: recording.capture.observationWindowMs
      },
      evidence: "manual"
    });
    return { ok: true, session };
  }
  function addEvent(session, draft) {
    if (session.status === "complete" || session.status === "error") {
      return { ok: false, error: "The recording has already ended." };
    }
    if (session.status === "paused" && draft.kind !== "checkpoint") {
      return { ok: false, error: "The recording is paused." };
    }
    const event = appendEvent(session.recording, draft);
    return event ? { ok: true, eventId: event.id } : { ok: false, error: "Event not stored." };
  }
  function pauseSession(session) {
    if (session.status !== "recording") {
      return { ok: false, error: "Only a recording session can be paused." };
    }
    const at = (/* @__PURE__ */ new Date()).toISOString();
    session.status = "paused";
    session.pausedAtMs = Date.parse(at);
    appendEvent(session.recording, {
      family: "context",
      kind: "session-paused",
      title: "Recording paused",
      at,
      evidence: "manual"
    });
    return { ok: true, session };
  }
  function resumeSession(session) {
    if (session.status !== "paused") {
      return { ok: false, error: "Only a paused session can resume." };
    }
    session.status = "recording";
    delete session.pausedAtMs;
    appendEvent(session.recording, {
      family: "context",
      kind: "session-resumed",
      title: "Recording resumed",
      at: (/* @__PURE__ */ new Date()).toISOString(),
      evidence: "manual"
    });
    return { ok: true, session };
  }
  function stopSession(session, reason = "stopped") {
    if (session.status === "complete") return { ok: true, session };
    if (session.status === "error") return { ok: false, error: session.error ?? "The session failed." };
    const endedAt = (/* @__PURE__ */ new Date()).toISOString();
    session.status = "complete";
    session.endedAtMs = Date.parse(endedAt);
    session.endReason = reason;
    delete session.pausedAtMs;
    session.recording.endedAt = endedAt;
    session.recording.durationMs = Math.max(
      session.recording.durationMs,
      Date.parse(endedAt) - session.startedAtMs
    );
    appendEvent(session.recording, {
      family: "context",
      kind: "session-end",
      title: reason === "tab-closed" ? "Recording ended: tab closed" : reason === "interrupted" ? "Recording interrupted" : "Recording stopped",
      at: endedAt,
      data: { reason },
      evidence: "observed"
    });
    return { ok: true, session };
  }
  function interruptSession(session, message) {
    if (session.status === "complete" || session.status === "error") {
      return { ok: false, error: "The session has already ended." };
    }
    const endedAt = (/* @__PURE__ */ new Date()).toISOString();
    appendEvent(session.recording, {
      family: "system",
      kind: "interrupted",
      title: "Recording interrupted",
      at: endedAt,
      data: { message },
      evidence: "observed",
      warnings: [message]
    });
    session.status = "error";
    session.error = message;
    session.endedAtMs = Date.parse(endedAt);
    session.endReason = "interrupted";
    session.recording.endedAt = endedAt;
    session.recording.durationMs = Math.max(
      session.recording.durationMs,
      Date.parse(endedAt) - session.startedAtMs
    );
    return { ok: true, session };
  }
  function addManualCheckpoint(session, note) {
    if (session.status !== "recording" && session.status !== "paused") {
      return { ok: false, error: "Start a recording before adding a checkpoint." };
    }
    return addEvent(session, {
      family: "manual",
      kind: "checkpoint",
      title: note ? `Manual checkpoint: ${note}` : "Manual checkpoint",
      note,
      data: { note: note || "none", paused: session.status === "paused" },
      evidence: "manual"
    });
  }

  // extensions/afterclick/src/background.ts
  var ACTIVE_KEY = "afterclick.active.v1";
  var LAST_KEY = "afterclick.lastCompleted.v1";
  var SETTINGS_KEY = "afterclick.settings.v1";
  var STUDIO_URL = "https://lab.tanishk.me/play/afterclick";
  var CONSENT_STATEMENT = "I chose to record this tab with AFTERCLICK. It records local interaction events and observed UI changes only. It does not read form values or typed characters.";
  var SUPPORTED = /^https?:\/\//i;
  var activeCache;
  var saveTimer = null;
  function isSession(value) {
    if (!value || typeof value !== "object") return false;
    const item = value;
    return (item.status === "recording" || item.status === "paused" || item.status === "complete" || item.status === "error") && typeof item.tabId === "number" && typeof item.startedAtMs === "number" && Boolean(item.recording && typeof item.recording === "object");
  }
  async function loadActive() {
    if (activeCache !== void 0) return activeCache;
    try {
      const stored = await chrome.storage.session.get(ACTIVE_KEY);
      const value = stored[ACTIVE_KEY];
      activeCache = isSession(value) ? value : null;
    } catch {
      activeCache = null;
    }
    return activeCache;
  }
  async function persistActive() {
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
    }
  }
  function persistSoon() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      void persistActive();
    }, 240);
  }
  async function getSettings() {
    try {
      const stored = await chrome.storage.local.get(SETTINGS_KEY);
      const value = stored[SETTINGS_KEY];
      if (value && typeof value === "object") {
        return { feedbackText: value.feedbackText === true };
      }
    } catch {
    }
    return { feedbackText: false };
  }
  async function setSettings(settings) {
    try {
      await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    } catch {
    }
  }
  async function saveLast(recording) {
    try {
      const saved = { recording, savedAt: (/* @__PURE__ */ new Date()).toISOString() };
      await chrome.storage.local.set({ [LAST_KEY]: saved });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Chrome storage rejected the recording."
      };
    }
  }
  async function getLast() {
    try {
      const stored = await chrome.storage.local.get(LAST_KEY);
      const value = stored[LAST_KEY];
      if (!value || typeof value !== "object") return null;
      const item = value;
      const parsed = parseRecording(item.recording);
      if (!parsed.ok) return null;
      return {
        recording: parsed.recording,
        savedAt: typeof item.savedAt === "string" && !Number.isNaN(Date.parse(item.savedAt)) ? item.savedAt : parsed.recording.createdAt
      };
    } catch {
      return null;
    }
  }
  async function badge(session) {
    try {
      if (!session) {
        await chrome.action.setBadgeText({ text: "" });
        return;
      }
      const text = session.status === "paused" ? "II" : session.status === "recording" ? "REC" : "";
      await chrome.action.setBadgeText({ text, tabId: session.tabId });
      await chrome.action.setBadgeBackgroundColor({
        color: session.status === "paused" ? "#8a5300" : "#b3261e",
        tabId: session.tabId
      });
    } catch {
    }
  }
  function supported(url) {
    return typeof url === "string" && SUPPORTED.test(url);
  }
  async function activeTabState(tabId) {
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
        supported: supported(url)
      };
    } catch {
      return null;
    }
  }
  function statePayload(active, saved, settings, tab) {
    return {
      ok: true,
      now: Date.now(),
      active: active ? {
        status: active.status,
        tabId: active.tabId,
        startedAtMs: active.startedAtMs,
        pausedAtMs: active.pausedAtMs,
        endedAtMs: active.endedAtMs,
        error: active.error,
        endReason: active.endReason,
        recording: active.recording
      } : null,
      saved,
      settings,
      tab,
      studioUrl: STUDIO_URL,
      consentStatement: CONSENT_STATEMENT
    };
  }
  async function injectAndStart(tabId, config) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      });
    } catch (error) {
      return {
        error: error instanceof Error ? `AFTERCLICK could not enter this page: ${error.message}` : "AFTERCLICK could not enter this page."
      };
    }
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: "AFTERCLICK_CONTENT_START",
        config
      });
      if (!response || response.ok !== true) {
        return { error: response?.error ?? "The page recorder did not start." };
      }
      return { viewport: response.viewport ?? { width: 0, height: 0 } };
    } catch (error) {
      return {
        error: error instanceof Error ? `The page recorder did not answer: ${error.message}` : "The page recorder did not answer."
      };
    }
  }
  async function startRecording(message) {
    const existing = await loadActive();
    if (existing && (existing.status === "recording" || existing.status === "paused")) {
      return {
        ok: false,
        error: "A recording is already in progress. Stop it before starting another."
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
        error: "This page cannot be recorded. Open a normal http:// or https:// page, not a browser settings page or the new tab page."
      };
    }
    const settings = await getSettings();
    const feedbackText = typeof message.feedbackText === "boolean" ? message.feedbackText : settings.feedbackText;
    await setSettings({ feedbackText });
    const result = startSession({
      tabId: tab.id,
      url: tab.url,
      title: tab.title || tab.url,
      consentStatement: CONSENT_STATEMENT,
      feedbackText
    });
    if (!result.ok) return result;
    const session = result.session;
    const injected = await injectAndStart(tab.id, {
      startedAt: session.recording.startedAt,
      startedAtMs: session.startedAtMs,
      feedbackText,
      observationWindowMs: session.recording.capture.observationWindowMs,
      paused: false
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
  async function stopAndSave(reason) {
    const session = await loadActive();
    if (!session) return { ok: false, error: "There is no recording to stop." };
    const result = stopSession(session, reason);
    if (!result.ok) return result;
    await chrome.tabs.sendMessage(session.tabId, { type: "AFTERCLICK_CONTENT_STOP" }).catch(() => void 0);
    const saved = await saveLast(session.recording);
    activeCache = null;
    await persistActive();
    await badge(null);
    const settings = await getSettings();
    const tab = await activeTabState(session.tabId);
    return {
      ok: true,
      saveError: saved.ok ? void 0 : saved.error,
      state: statePayload(null, { recording: session.recording, savedAt: (/* @__PURE__ */ new Date()).toISOString() }, settings, tab)
    };
  }
  async function handleMessage(message, sender) {
    const type = message && typeof message === "object" && "type" in message ? String(message.type) : "";
    const payload = message ?? {};
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
      const result = addEvent(session, draft);
      if (!result.ok) return result;
      persistSoon();
      return { ok: true, eventId: result.eventId };
    }
    if (type === "AFTERCLICK_PAGE_LEAVING") {
      const session = await loadActive();
      if (!session || !sender.tab || sender.tab.id !== session.tabId) return { ok: true };
      if (session.status !== "recording") return { ok: true };
      const url = sanitizeUrl(payload.url);
      const draft = {
        family: "navigation",
        kind: "navigation",
        title: `Navigated to ${url || "another page"}`,
        data: { url, path: url, method: "document" },
        evidence: "observed",
        confidence: "high",
        at: (/* @__PURE__ */ new Date()).toISOString(),
        ...typeof payload.afterActionId === "string" ? { afterActionId: payload.afterActionId } : {}
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
      const requestedTab = typeof payload.tabId === "number" ? payload.tabId : active?.tabId;
      const tab = await activeTabState(requestedTab);
      return statePayload(active, saved, settings, tab);
    }
    if (type === "AFTERCLICK_START") {
      return startRecording({
        tabId: typeof payload.tabId === "number" ? payload.tabId : void 0,
        feedbackText: payload.feedbackText === true,
        consent: payload.consent === true
      });
    }
    if (type === "AFTERCLICK_PAUSE") {
      const session = await loadActive();
      if (!session) return { ok: false, error: "There is no active recording." };
      const result = pauseSession(session);
      if (!result.ok) return result;
      activeCache = session;
      await chrome.tabs.sendMessage(session.tabId, { type: "AFTERCLICK_CONTENT_PAUSE" }).catch(() => void 0);
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
      await chrome.tabs.sendMessage(session.tabId, { type: "AFTERCLICK_CONTENT_RESUME" }).catch(() => void 0);
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
      const note = typeof payload.note === "string" ? payload.note.replace(/\s+/g, " ").trim().slice(0, 160) : "";
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
    void handleMessage(message, sender).then((response) => sendResponse(response)).catch(
      (error) => sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "AFTERCLICK hit an unexpected error."
      })
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
          "The tab left a normal web page, so capture stopped. The partial recording is still exportable."
        );
        if (result.ok) {
          activeCache = session;
          await saveLast(session.recording);
          await persistActive();
          await badge(null);
        }
        return;
      }
      try {
        const ping = await chrome.tabs.sendMessage(tabId, {
          type: "AFTERCLICK_CONTENT_PING"
        });
        if (ping?.ok && ping.status && ping.status !== "idle") return;
      } catch {
      }
      const url = sanitizeUrl(tab.url);
      const injected = await injectAndStart(tabId, {
        startedAt: session.recording.startedAt,
        startedAtMs: session.startedAtMs,
        feedbackText: session.recording.capture.feedbackText,
        observationWindowMs: session.recording.capture.observationWindowMs,
        paused: session.status === "paused"
      });
      if ("error" in injected) {
        const result = interruptSession(
          session,
          "Navigation ended capture on this tab. This can happen when a page crosses origins. The partial recording is exportable."
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
          at: (/* @__PURE__ */ new Date()).toISOString(),
          data: { path: url, viewport: injected.viewport ? `${injected.viewport.width}\xD7${injected.viewport.height}` : "unknown" },
          evidence: "observed"
        });
      }
      if (injected.viewport && injected.viewport.width > 0) {
        session.recording.source.viewport = injected.viewport;
      }
      activeCache = session;
      await persistActive();
    })().catch(() => void 0);
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
    })().catch(() => void 0);
  });
  chrome.runtime.onInstalled.addListener(() => {
    void chrome.storage.local.get(SETTINGS_KEY).then((value) => {
      if (!value[SETTINGS_KEY]) {
        return chrome.storage.local.set({
          [SETTINGS_KEY]: { feedbackText: false }
        });
      }
      return void 0;
    }).catch(() => void 0);
  });
})();
