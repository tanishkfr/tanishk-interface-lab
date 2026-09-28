import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateExpression,
  formatIntent,
  parseComposerInput,
  parseDuration,
} from "../components/lab/adaptive-composer/composer-parse.ts";

test("arithmetic is evaluated without eval", () => {
  assert.equal(evaluateExpression("12 * 40 + 44"), 524);
  assert.equal(evaluateExpression("(6 + 2) * 3"), 24);
  assert.equal(evaluateExpression("2 ^ 10"), 1024);
  assert.equal(evaluateExpression("alert(1)"), null);
  assert.equal(evaluateExpression("1 / 0"), null);
  assert.equal(evaluateExpression(""), null);
});

test("a maths sentence is recognised as an intent", () => {
  const parsed = parseComposerInput("what is 12 * 40 + 44?");
  assert.equal(parsed.intent, "math");
  if (parsed.payload.intent === "math") {
    assert.equal(parsed.payload.math.result, 524);
  } else {
    assert.fail("expected a maths payload");
  }
});

test("a scheduling sentence yields day, time and duration", () => {
  const parsed = parseComposerInput(
    "review the deck with Ana on tue 2pm for 45m",
  );
  assert.equal(parsed.intent, "meeting");
  if (parsed.payload.intent === "meeting") {
    assert.equal(parsed.payload.meeting.durationMin, 45);
    assert.ok(parsed.payload.meeting.time, "expected a parsed time");
    assert.ok(parsed.payload.meeting.day, "expected a parsed day");
  } else {
    assert.fail("expected a meeting payload");
  }
});

test("duration parsing handles the common shapes", () => {
  assert.equal(parseDuration("for 45m"), 45);
  assert.equal(parseDuration("1h30"), 90);
  assert.equal(parseDuration("in two hours"), 120);
  assert.equal(parseDuration("no duration here"), null);
});

test("a link outranks every other intent", () => {
  const parsed = parseComposerInput(
    "meet in Lisbon tomorrow at 9am — agenda at example.com/agenda",
  );
  assert.equal(parsed.intent, "link");
});

test("lists become tasks", () => {
  const parsed = parseComposerInput(
    "draft the outline; send the invite; book the room",
  );
  assert.equal(parsed.intent, "task");
  if (parsed.payload.intent === "task") {
    assert.equal(parsed.payload.tasks.length, 3);
  } else {
    assert.fail("expected a task payload");
  }
});

test("a capitalised place is extracted", () => {
  const parsed = parseComposerInput("standup in Lisbon on friday");
  assert.ok(
    parsed.intent === "place" || parsed.intent === "meeting",
    `unexpected intent ${parsed.intent}`,
  );
});

test("people are extracted from a share sentence", () => {
  const parsed = parseComposerInput("share the notes with Ana, Luis and Priya");
  assert.equal(parsed.intent, "person");
  if (parsed.payload.intent === "person") {
    assert.deepEqual(parsed.payload.person.names, ["Ana", "Luis", "Priya"]);
  } else {
    assert.fail("expected a person payload");
  }
});

test("plain prose stays text", () => {
  const parsed = parseComposerInput("the quiet part of the interface");
  assert.equal(parsed.intent, "text");
});

test("intents have human labels", () => {
  assert.equal(formatIntent("meeting"), "Meeting");
  assert.equal(formatIntent("math"), "Calculation");
});

test("labels are deterministic for the same input", () => {
  const first = parseComposerInput("draft the outline; send the invite");
  const second = parseComposerInput("draft the outline; send the invite");
  assert.deepEqual(first, second);
});
