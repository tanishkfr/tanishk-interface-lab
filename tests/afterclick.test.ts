import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  MAX_EVENTS,
  addAnnotation,
  appendEvent,
  buildStateMap,
  createRecording,
  describeEvent,
  formatDelay,
  formatDuration,
  parseRecording,
  parseRecordingFile,
  redactText,
  removeAnnotation,
  sanitizeUrl,
  serializeRecording,
  summarizeRecording,
} from "../lib/afterclick/schema.ts";
import {
  addEvent,
  addManualCheckpoint,
  activeEventCount,
  elapsedMs,
  interruptSession,
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
} from "../lib/afterclick/session.ts";
import {
  classifyFeedbackText,
  isLoadingDescriptor,
  looksLikeSecret,
  shortcutLabel,
} from "../lib/afterclick/classify.ts";
import { mapConsequences, timelineBand } from "../lib/afterclick/view.ts";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sample = JSON.parse(
  readFileSync(path.join(repo, "lib", "afterclick", "sample-recording.json"), "utf8"),
);

function baseRecording() {
  return createRecording({
    url: "https://example.com/checkout?token=secret#top",
    title: "A checkout",
    startedAt: "2026-11-20T10:00:00.000Z",
    consentStatement: "I chose to record this tab.",
    feedbackText: true,
  });
}

test("URLs lose credentials, query strings and fragments", () => {
  assert.equal(
    sanitizeUrl("https://user:pass@example.com/checkout?session=abc#pay"),
    "https://example.com/checkout",
  );
  assert.equal(sanitizeUrl("chrome://extensions"), "chrome://extensions");
  assert.equal(sanitizeUrl("not a url"), "not a url");
  assert.equal(sanitizeUrl(undefined), "");
});

test("redaction removes obvious email, phone, card and token shapes", () => {
  const redacted = redactText(
    "Email mira@example.com, call +1 (555) 210-9000, card 4242 4242 4242 4242, token abcdef1234567890abcdef1234567890",
  );
  assert.ok(!redacted.includes("mira@example.com"));
  assert.ok(!redacted.includes("555"));
  assert.ok(!redacted.includes("4242"));
  assert.ok(!redacted.includes("abcdef1234567890"));
  assert.ok(redacted.includes("[email]"));
  assert.ok(redacted.includes("[number]"));
});

test("sensitive inputs never keep their label text", () => {
  const recording = baseRecording();
  appendEvent(recording, {
    family: "action",
    kind: "click",
    target: {
      tag: "input",
      inputType: "password",
      label: "Password: hunter2",
      selector: "#password",
    },
  });
  const event = recording.events[0];
  assert.equal(event.target?.label, "[redacted]");
  assert.equal(event.target?.redacted, true);
  assert.ok(!serializeRecording(recording).includes("hunter2"));
});

test("appendEvent measures action-relative delay and opens a window", () => {
  const recording = baseRecording();
  const action = appendEvent(recording, {
    id: "act_1",
    at: "2026-11-20T10:00:01.000Z",
    family: "action",
    kind: "click",
    title: "Clicked “Place order”",
    target: { tag: "button", label: "Place order" },
  });
  assert.ok(action);
  const change = appendEvent(recording, {
    at: "2026-11-20T10:00:01.046Z",
    family: "state",
    kind: "control-disabled",
    title: "Button disabled",
    afterActionId: "act_1",
    target: { tag: "button", label: "Place order" },
  });
  assert.equal(change?.deltaMs, 46);
  assert.equal(change?.afterActionId, "act_1");
  assert.equal(action?.data?.observationWindowMs, 4000);
});

test("duplicate actions inside 180ms are suppressed", () => {
  const recording = baseRecording();
  const first = appendEvent(recording, {
    at: "2026-11-20T10:00:01.000Z",
    family: "action",
    kind: "click",
    target: { tag: "button", label: "Save" },
  });
  const second = appendEvent(recording, {
    at: "2026-11-20T10:00:01.050Z",
    family: "action",
    kind: "click",
    target: { tag: "button", label: "Save" },
  });
  assert.equal(recording.events.length, 1);
  assert.equal(first?.id, second?.id);
});

test("event count is bounded and a warning is added", () => {
  const recording = baseRecording();
  for (let index = 0; index < MAX_EVENTS + 2; index += 1) {
    appendEvent(recording, {
      at: new Date(Date.parse(recording.startedAt) + index * 2).toISOString(),
      family: "focus",
      kind: "focus",
      title: `Focus ${index}`,
    });
  }
  assert.equal(recording.events.length, MAX_EVENTS + 1);
  assert.equal(recording.events.at(-1)?.kind, "warning");
});

test("state map groups consequences and identifies a lost action", () => {
  const parsed = parseRecording(sample);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const map = buildStateMap(parsed.recording);
  assert.equal(map.actions.length, 5);
  const save = map.groups.find((group) =>
    group.action.title.includes("Save address"),
  );
  assert.ok(save);
  assert.equal(save?.consequences.length, 0);
  assert.equal(save?.outcome, "no-observed-change");
  const place = map.groups.find((group) =>
    group.action.title.includes("Place order"),
  );
  assert.ok(place && place.consequences.length >= 3);
  assert.ok((place?.firstDelta ?? 0) > 0);
  const selected = mapConsequences(place!, 3);
  assert.ok(selected.visible.some((event) => event.data?.messageType === "success"));
  assert.equal(timelineBand(map.actions[0]), "action");
});

test("sample recording is valid, annotated round-trip and contains no fixture form values", () => {
  const parsed = parseRecording(sample);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const recording = parsed.recording;
  assert.equal(recording.version, 1);
  assert.equal(recording.events.length, 29);
  assert.equal(recording.annotations.length, 0);
  const action = recording.events.find((event) => event.kind === "click");
  assert.ok(action);
  addAnnotation(recording, action!.id, "This is a sample note.");
  const roundTrip = parseRecordingFile(serializeRecording(recording));
  assert.equal(roundTrip.ok, true);
  if (!roundTrip.ok) return;
  assert.equal(roundTrip.recording.annotations.length, 1);
  assert.equal(roundTrip.recording.annotations[0].text, "This is a sample note.");
  assert.equal(removeAnnotation(roundTrip.recording, roundTrip.recording.annotations[0].id), true);
  assert.equal(roundTrip.recording.annotations.length, 0);
  const serialized = serializeRecording(recording);
  for (const forbidden of ["mira@example.com", "hunter2", "SPRING24", "14 Harbour Walk"]) {
    assert.ok(!serialized.includes(forbidden));
  }
});

test("malformed, empty and unknown-version files are handled without throwing", () => {
  assert.equal(parseRecordingFile("").ok, false);
  assert.equal(parseRecordingFile("{ nope").ok, false);
  assert.equal(parseRecording({ schema: "something.else" }).ok, false);
  const newer = parseRecording({ schema: "afterclick.recording", version: 99 });
  assert.equal(newer.ok, false);
  if (!newer.ok) assert.match(newer.error, /newer/);
  const empty = parseRecording({
    schema: "afterclick.recording",
    version: 1,
    startedAt: "2026-11-20T10:00:00.000Z",
    events: [],
  });
  assert.equal(empty.ok, true);
  if (empty.ok) {
    assert.equal(empty.recording.events.length, 0);
    assert.ok(empty.warnings.some((warning) => warning.includes("no events")));
  }
  const badAnnotation = parseRecording({
    schema: "afterclick.recording",
    version: 1,
    startedAt: "2026-11-20T10:00:00.000Z",
    events: [{ id: "e1", t: 0, kind: "click", family: "action", title: "Click" }],
    annotations: [{ id: "n1", eventId: "missing", text: "orphan" }],
  });
  assert.equal(badAnnotation.ok, true);
  if (badAnnotation.ok) {
    assert.equal(badAnnotation.recording.annotations.length, 0);
    assert.ok(badAnnotation.warnings.some((warning) => warning.includes("missing event")));
  }
});

test("summary and formatting produce honest labels", () => {
  const parsed = parseRecording(sample);
  assert.ok(parsed.ok);
  if (!parsed.ok) return;
  const summary = summarizeRecording(parsed.recording);
  assert.equal(summary.actions, 5);
  assert.equal(summary.observedFeedback, 4);
  assert.equal(summary.lostActions, 1);
  assert.equal(formatDelay(46), "+46ms");
  assert.equal(formatDelay(null), "no observed change");
  assert.equal(formatDuration(10873), "10.9s");
  assert.match(describeEvent("feedback-appeared", undefined, { messageType: "error" }), /Error/);
});

test("recording session start / pause / resume / stop is explicit", () => {
  const start = startSession({
    tabId: 7,
    url: "https://example.com/",
    title: "Example",
    consentStatement: "I chose to record this tab.",
    startedAt: "2026-11-20T10:00:00.000Z",
  });
  assert.equal(start.ok, true);
  if (!start.ok) return;
  const session = start.session;
  assert.equal(session.status, "recording");
  assert.equal(activeEventCount(session), 1);
  assert.equal(pauseSession(session).ok, true);
  assert.equal(session.status, "paused");
  const frozen = elapsedMs(session, Date.parse("2026-11-20T10:00:10.000Z"));
  assert.equal(
    elapsedMs(session, Date.parse("2026-11-20T10:00:20.000Z")),
    frozen,
  );
  assert.ok(frozen >= 0);
  assert.equal(addEvent(session, { kind: "click", family: "action" }).ok, false);
  assert.equal(addManualCheckpoint(session, "Paused note").ok, true);
  assert.equal(resumeSession(session).ok, true);
  assert.equal(session.status, "recording");
  assert.equal(addEvent(session, { kind: "click", family: "action" }).ok, true);
  const stopped = stopSession(session, "stopped");
  assert.equal(stopped.ok, true);
  assert.equal(session.status, "complete");
  assert.equal(session.endReason, "stopped");
  assert.equal(stopSession(session, "stopped").ok, true);
  assert.equal(addEvent(session, { kind: "click", family: "action" }).ok, false);
});

test("invalid transitions and interrupted sessions stay honest", () => {
  const bad = startSession({
    tabId: 1,
    url: "chrome://extensions",
    title: "Settings",
    consentStatement: "yes",
  });
  assert.equal(bad.ok, false);
  const noConsent = startSession({
    tabId: 1,
    url: "https://example.com",
    title: "Example",
    consentStatement: " ",
  });
  assert.equal(noConsent.ok, false);
  const start = startSession({
    tabId: 2,
    url: "https://example.com",
    title: "Example",
    consentStatement: "I chose to record this tab.",
    startedAt: "2026-11-20T10:00:00.000Z",
  });
  assert.ok(start.ok);
  if (!start.ok) return;
  const session = start.session;
  assert.equal(resumeSession(session).ok, false);
  assert.equal(pauseSession(session).ok, true);
  assert.equal(pauseSession(session).ok, false);
  const interrupted = interruptSession(session, "Tab crossed origins.");
  assert.equal(interrupted.ok, true);
  assert.equal(session.status, "error");
  assert.equal(session.error, "Tab crossed origins.");
  assert.ok(session.recording.events.some((event) => event.kind === "interrupted"));
});

test("feedback classifier and shortcut filter avoid raw typing", () => {
  assert.equal(classifyFeedbackText("Order confirmed. A receipt is ready."), "success");
  assert.equal(classifyFeedbackText("Something went wrong. Try again."), "error");
  assert.equal(classifyFeedbackText("Loading, please wait"), "loading");
  assert.equal(classifyFeedbackText("Gift options"), null);
  assert.equal(isLoadingDescriptor("spinner is visible"), true);
  assert.equal(shortcutLabel({ key: "a", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false }), null);
  assert.equal(shortcutLabel({ key: "a", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false }), "Ctrl+A");
  assert.equal(shortcutLabel({ key: "Escape", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false }), "Escape");
  assert.equal(looksLikeSecret("mira@example.com"), true);
});

test("built manifest keeps the minimal permission boundary", () => {
  const manifestPath = path.join(repo, "extensions", "afterclick", "dist", "manifest.json");
  assert.ok(existsSync(manifestPath), "build the extension before running tests");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, "0.1.0");
  assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "scripting", "storage"]);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.content_scripts, undefined);
  assert.equal(manifest.background.service_worker, "background.js");
  for (const file of ["background.js", "content.js", "popup.html", "popup.js"]) {
    assert.ok(
      existsSync(path.join(repo, "extensions", "afterclick", "dist", file)),
      `missing ${file}`,
    );
  }
  const popup = readFileSync(
    path.join(repo, "extensions", "afterclick", "dist", "popup.html"),
    "utf8",
  );
  assert.ok(!/<script(?![^>]*src=)/i.test(popup), "popup must not use inline script");
});

test("downloadable ZIP contains an installable extension at its root", () => {
  const zip = path.join(repo, "public", "downloads", "afterclick-v0.1.0.zip");
  assert.ok(existsSync(zip));
  const listing = spawnSync("tar", ["-tf", zip], { encoding: "utf8" });
  assert.equal(listing.status, 0, listing.stderr);
  const files = listing.stdout.split(/\r?\n/).filter(Boolean);
  assert.ok(files.includes("manifest.json"));
  assert.ok(files.includes("background.js"));
  assert.ok(files.includes("content.js"));
  assert.ok(files.includes("popup.html"));
  assert.ok(files.some((file) => file.startsWith("icons/")));
  assert.ok(files.includes("README.txt"));
  assert.ok(files.includes("PRIVACY.txt"));
});
